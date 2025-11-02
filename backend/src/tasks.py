import logging
import os
from datetime import datetime
from typing import List

from celery import Celery
from db import get_session
from models import DiscoveredClip, Job, JobStatus, Render, UserAuth
from storage import job_upload_dir, job_export_dir
from sqlmodel import select

from config import settings
from pipeline.censor import build_profanity_mute_filters
from pipeline.editing import render_with_fallback, write_ffconcat
from pipeline.highlight_detection import SceneSlice, get_highlight_detector
from pipeline.music import generate_music_bed
from pipeline.preprocess import preprocess_clips
from pipeline.utils.ffmpeg import FFmpegExecutionError, run_ffmpeg
from services.clip_discovery import mock_fetch_recent_clips
from services.job_state import update_job_state
from services.storage_adapters import get_storage
from services.stt.whisper_stub import transcribe_audio

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

celery_app = Celery(
    "cosmiv",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

logger = logging.getLogger(__name__)

# Beat schedule: every 30 minutes sync user clips (mock)
celery_app.conf.beat_schedule = {
    "sync-user-clips-every-30m": {
        "task": "sync_all_users_clips",
        "schedule": 1800.0,
    }
}


class RenderPipelineError(Exception):
    """Non-retryable error raised when the pipeline cannot recover."""


class RetryableRenderError(Exception):
    """Raised for transient errors that should trigger a Celery retry."""


TRANSIENT_ERROR_KEYWORDS = (
    "resource temporarily unavailable",
    "server returned 5",
    "timed out",
    "i/o error",
    "connection reset",
    "connection refused",
    "temporarily unavailable",
)


def _classify_ffmpeg_error(exc: FFmpegExecutionError) -> Exception:
    stderr = (exc.stderr or "").lower()
    if any(keyword in stderr for keyword in TRANSIENT_ERROR_KEYWORDS):
        return RetryableRenderError(str(exc))
    return RenderPipelineError(str(exc))


VIDEO_EXTENSIONS = (".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v")


def _list_uploaded_clips(upload_dir: str) -> List[str]:
    try:
        names = sorted(os.listdir(upload_dir))
    except FileNotFoundError:
        return []
    return [os.path.join(upload_dir, name) for name in names if name.lower().endswith(VIDEO_EXTENSIONS)]

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

def _mux_with_music(video_path: str, music_path: str, output_path: str, mute_chain: str) -> None:
    filters = []
    if mute_chain and mute_chain != "anull":
        filters.append(f"[0:a]{mute_chain}[a_clean]")
        voice_src = "[a_clean]"
    else:
        voice_src = "[0:a]"
    filters.append(f"{voice_src}volume=1.0[a0]")
    filters.append("[1:a]volume=0.2[a1]")
    filters.append("[a0][a1]amix=inputs=2:duration=shortest[aout]")

    filter_complex_parts = [";".join(filters)]
    video_map = "0:v"
    video_codec_args = ["-c:v", "copy"]

    if settings.WATERMARK_TEXT:
        escaped = settings.WATERMARK_TEXT.replace("'", "\\'").replace(":", "\\:")
        filter_complex_parts.append(
            f"[0:v]drawtext=text='{escaped}':fontcolor=white:fontsize=24:x=w-tw-20:y=h-th-20:alpha=0.5[vout]"
        )
        video_map = "[vout]"
        video_codec_args = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20"]

    filter_complex = ";".join(filter_complex_parts)
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        video_path,
        "-i",
        music_path,
        "-filter_complex",
        filter_complex,
        "-map",
        video_map,
        "-map",
        "[aout]",
        *video_codec_args,
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        output_path,
    ]
    run_ffmpeg(cmd)


@celery_app.task(
    bind=True,
    name="render_job",
    autoretry_for=(RetryableRenderError,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def render_job(self, job_id: str, target_duration: int):
    export_dir = job_export_dir(job_id)
    upload_dir = job_upload_dir(job_id)

    logger.info("Render job %s started (attempt %s)", job_id, self.request.retries + 1)
    max_attempts = (getattr(self, "max_retries", 3) or 3) + 1
    update_job_state(job_id, status=JobStatus.PROCESSING, stage="preparing", progress=5, mark_started=True)

    video_files = _list_uploaded_clips(upload_dir)
    if not video_files:
        raise RenderPipelineError("No uploaded clips found for job")

    try:
        update_job_state(job_id, stage="preprocessing", progress=15)
        preprocessed = preprocess_clips(video_files, export_dir)

        update_job_state(job_id, stage="analysis", progress=35)
        detector = get_highlight_detector()
        slices: List[SceneSlice] = detector.detect(preprocessed, target_duration)
        if not slices:
            raise RenderPipelineError("Highlight detector returned no slices")

        selected = [(s.video_path, s.start, s.duration) for s in slices]
        total_duration = sum(s.duration for s in slices)

        update_job_state(job_id, stage="rendering", progress=55)
        concat_path = os.path.join(export_dir, "concat.txt")
        write_ffconcat(concat_path, selected)

        variants = ["landscape", "portrait"]
        video_outputs = {}
        for idx, variant in enumerate(variants):
            update_job_state(job_id, stage=f"rendering:{variant}", progress=60 + idx * 5)
            out_path = os.path.join(export_dir, f"video_{variant}.mp4")
            try:
                render_with_fallback(concat_path, out_path, preset=variant)
            except FFmpegExecutionError as exc:
                raise _classify_ffmpeg_error(exc)
            video_outputs[variant] = out_path

        update_job_state(job_id, stage="music", progress=75)
        music_path = os.path.join(export_dir, "music.mp3")
        try:
            generate_music_bed(total_duration or target_duration, music_path, freq=220)
        except FFmpegExecutionError as exc:
            raise _classify_ffmpeg_error(exc)

        transcript = transcribe_audio(preprocessed[0])
        mute_chain = build_profanity_mute_filters(transcript.get("profanity", []))

        update_job_state(job_id, stage="mixdown", progress=85)
        final_outputs = {}
        for variant, video_path in video_outputs.items():
            final_path = os.path.join(export_dir, f"final_{variant}.mp4")
            try:
                _mux_with_music(video_path, music_path, final_path, mute_chain)
            except FFmpegExecutionError as exc:
                raise _classify_ffmpeg_error(exc)
            final_outputs[variant] = final_path

        update_job_state(job_id, stage="publishing", progress=92)
        storage = get_storage()
        if settings.USE_OBJECT_STORAGE:
            for variant, path in final_outputs.items():
                key = f"exports/{job_id}/final_{variant}.mp4"
                try:
                    storage.upload(path, key)  # type: ignore[attr-defined]
                except Exception as exc:
                    logger.warning("Upload to object storage failed for %s: %s", path, exc)
        # Local storage already points to the filesystem path via final_outputs

        update_job_state(job_id, status=JobStatus.SUCCESS, stage="completed", progress=100, mark_finished=True)

        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if job:
                job.error = None
                job.stage = "completed"
                job.progress = 100
                job.status = JobStatus.SUCCESS
                job.finished_at = job.finished_at or datetime.utcnow()
                job.updated_at = datetime.utcnow()
                for variant, path in final_outputs.items():
                    session.add(Render(job_id=job_id, output_path=path, format=variant))
                session.add(job)
                session.commit()

        logger.info("Render job %s completed", job_id)

    except RetryableRenderError as exc:
        attempt = self.request.retries + 1
        logger.warning(
            "Render job %s transient failure (attempt %s/%s): %s",
            job_id,
            attempt,
            max_attempts,
            exc,
        )
        update_job_state(job_id, status=JobStatus.RETRYING, stage="retrying", progress=95, error=str(exc))
        raise
    except RenderPipelineError as exc:
        logger.error("Render job %s failed: %s", job_id, exc)
        update_job_state(job_id, status=JobStatus.FAILED, stage="failed", progress=100, error=str(exc), mark_finished=True)
        raise
    except FFmpegExecutionError as exc:
        mapped = _classify_ffmpeg_error(exc)
        if isinstance(mapped, RetryableRenderError):
            attempt = self.request.retries + 1
            logger.warning(
                "Render job %s ffmpeg transient failure (attempt %s/%s): %s",
                job_id,
                attempt,
                max_attempts,
                mapped,
            )
            update_job_state(job_id, status=JobStatus.RETRYING, stage="retrying", progress=95, error=str(mapped))
            raise mapped
        logger.error("Render job %s ffmpeg failure: %s", job_id, mapped)
        update_job_state(job_id, status=JobStatus.FAILED, stage="failed", progress=100, error=str(mapped), mark_finished=True)
        raise mapped
    except Exception as exc:
        logger.exception("Render job %s unexpected failure", job_id)
        update_job_state(job_id, status=JobStatus.FAILED, stage="failed", progress=100, error=str(exc), mark_finished=True)
        raise
