import os
from celery import Celery
from db import get_session
from models import Job, JobStatus, Render, UserAuth, DiscoveredClip
from storage import job_upload_dir, job_export_dir
from sqlmodel import select
from typing import List, Tuple
from pipeline.preprocess import preprocess_clips
from pipeline.highlight_detection import detect_scenes_seconds, motion_score
from pipeline.editing import write_ffconcat, render_from_concat
from pipeline.music import generate_music_bed
from pipeline.censor import build_censor_filter_chain
from services.clip_discovery import mock_fetch_recent_clips, MOCK_PROVIDERS
from config import settings
try:
    from ml.highlights.model import get_model
except Exception:
    get_model = None

from services.storage_adapters import get_storage
from pipeline.editing import render_matrix
from services.stt.whisper_stub import transcribe_audio
from pipeline.censor import build_profanity_mute_filters

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

celery_app = Celery(
    "aiditor",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

# Beat schedule: every 30 minutes sync user clips (mock)
celery_app.conf.beat_schedule = {
    "sync-user-clips-every-30m": {
        "task": "sync_all_users_clips",
        "schedule": 1800.0,
    }
}

@celery_app.task(name="sync_all_users_clips")
def sync_all_users_clips():
    with get_session() as session:
        auths = session.exec(select(UserAuth)).all()
        user_ids = sorted({a.user_id for a in auths})
    for uid in user_ids:
        sync_user_clips.delay(uid)

@celery_app.task(name="sync_user_clips")
def sync_user_clips(user_id: str):
    with get_session() as session:
        auths = session.exec(select(UserAuth).where(UserAuth.user_id == user_id)).all()
        for a in auths:
            clips = mock_fetch_recent_clips(a.provider, user_id)
            for c in clips:
                exists = session.exec(
                    select(DiscoveredClip).where(
                        (DiscoveredClip.user_id == user_id) & (DiscoveredClip.external_id == c["external_id"])  # type: ignore
                    )
                ).first()
                if exists:
                    continue
                session.add(DiscoveredClip(
                    user_id=user_id,
                    provider=a.provider,
                    external_id=c["external_id"],
                    title=c.get("title"),
                    url=c.get("url"),
                ))
        session.commit()

@celery_app.task(name="render_job")
def render_job(job_id: str, target_duration: int):
    export_dir = job_export_dir(job_id)
    upload_dir = job_upload_dir(job_id)

    from sqlmodel import Session  # local import to avoid circular issues
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return
        job.status = JobStatus.PROCESSING
        session.add(job)
        session.commit()

    try:
        # Collect uploaded clips
        video_files: List[str] = []
        for name in os.listdir(upload_dir):
            if name.lower().endswith((".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v")):
                video_files.append(os.path.join(upload_dir, name))
        if not video_files:
            raise ValueError("No uploaded clips found for job")

        # 1) Preprocess
        preprocessed = preprocess_clips(video_files, export_dir)

        # 2) Detect scenes across files and score
        candidates: List[Tuple[str, float, float, float]] = []  # (path, start, dur, score)
        if settings.USE_HIGHLIGHT_MODEL and get_model:
            model = get_model()
            for vp in preprocessed:
                events = model.detect_events(vp)
                # Boost scenes near detected events
                scenes = detect_scenes_seconds(vp)
                for (s, e) in scenes:
                    dur = max(0.5, e - s)
                    mot = motion_score(vp, s, min(dur, 10.0))
                    proximity_boost = 0.0
                    for ev in events:
                        if abs(ev["time"] - (s + dur / 2)) < 3.0:
                            proximity_boost = max(proximity_boost, ev["confidence"] * 10.0)
                    score = mot + proximity_boost
                    candidates.append((vp, s, dur, score))
        else:
            for vp in preprocessed:
                scenes = detect_scenes_seconds(vp)
                for (s, e) in scenes:
                    dur = max(0.5, e - s)
                    mot = motion_score(vp, s, min(dur, 10.0))
                    score = mot
                    candidates.append((vp, s, dur, score))

        # Sort by score desc and pick until target_duration
        candidates.sort(key=lambda x: x[3], reverse=True)
        selected: List[Tuple[str, float, float]] = []
        total = 0.0
        for (vp, s, dur, score) in candidates:
            if total >= target_duration:
                break
            take = min(dur, max(1.0, min(4.0, target_duration - total)))
            selected.append((vp, s, take))
            total += take

        if not selected:
            # Fallback: take from first file
            selected = [(preprocessed[0], 0.0, float(target_duration))]

        # 3) Build concat and renders (landscape + portrait)
        concat_path = os.path.join(export_dir, "concat.txt")
        write_ffconcat(concat_path, selected)
        variants = ["landscape", "portrait"]
        from pipeline.editing import render_with_fallback
        video_outputs = {}
        for v in variants:
            out_path = os.path.join(export_dir, f"video_{v}.mp4")
            render_with_fallback(concat_path, out_path, preset=v)
            video_outputs[v] = out_path

        # 4) Generate simple music bed
        music_path = os.path.join(export_dir, "music.mp3")
        generate_music_bed(total or target_duration, music_path, freq=220)

        # STT transcription for profanity mute spans (stub)
        transcript = transcribe_audio(preprocessed[0])
        mute_chain = build_profanity_mute_filters(transcript.get("profanity", []))

        # 5) Mix music into each variant with mute + optional watermark
        import subprocess
        final_outputs = {}
        for v, vid in video_outputs.items():
            final_path = os.path.join(export_dir, f"final_{v}.mp4")
            # Base audio chain: mute profanities then amix music
            af = f"[0:a]{mute_chain}[aclean];[aclean]volume=1.0[a0];[1:a]volume=0.2[a1];[a0][a1]amix=inputs=2:duration=shortest[aout]"
            vf_overlay = "null"
            if settings.WATERMARK_TEXT:
                # Simple drawtext watermark bottom-right
                pos = "x=w-tw-20:y=h-th-20"
                vf_overlay = f"drawtext=text='{settings.WATERMARK_TEXT}':fontcolor=white:fontsize=24:{pos}:alpha=0.5"
            cmd = [
                "ffmpeg","-y","-i", vid, "-i", music_path,
                "-filter_complex", af + (";[0:v]"+vf_overlay+"[vout]" if vf_overlay!="null" else ""),
                "-map", "0:v" if vf_overlay=="null" else "[vout]",
                "-map","[aout]",
                "-c:v","copy" if vf_overlay=="null" else "libx264","-preset","veryfast","-crf","20",
                "-c:a","aac","-b:a","192k","-shortest", final_path
            ]
            subprocess.run(cmd, check=True)
            final_outputs[v] = final_path

        # 6) Optional upload to object storage
        storage = get_storage()
        public_map = {}
        if settings.USE_OBJECT_STORAGE:
            for v, path in final_outputs.items():
                key = f"exports/{job_id}/final_{v}.mp4"
                # upload via S3 adapter
                try:
                    storage.upload(path, key)  # type: ignore
                    public_map[v] = storage.presigned_url(key)  # type: ignore
                except Exception:
                    public_map[v] = path
        else:
            for v, path in final_outputs.items():
                public_map[v] = path

        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            job.status = JobStatus.SUCCESS
            for v, path in final_outputs.items():
                session.add(Render(job_id=job_id, output_path=path, format=v))
            session.add(job)
            session.commit()

        # Save a small marker file for URLs (optional)
        try:
            with open(os.path.join(export_dir, "urls.txt"), "w") as f:
                for v, url in public_map.items():
                    f.write(f"{v}: {url}\n")
        except Exception:
            pass

    except Exception as e:
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if job:
                job.status = JobStatus.FAILED
                job.error = str(e)
                session.add(job)
                session.commit()
        raise
