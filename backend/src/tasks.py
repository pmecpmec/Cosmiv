import json
import logging
import os
from datetime import datetime
from typing import List, Tuple, Dict, Any, Optional

from celery import Celery
from db import get_session
from models import (
    Job,
    JobStatus,
    Render,
    UserAuth,
    DiscoveredClip,
    WeeklyMontage,
    Entitlement,
    SocialConnection,
    SocialPost,
)
from storage import job_upload_dir, job_export_dir
from sqlmodel import select

from config import settings
from pipeline.preprocess import preprocess_clips
from pipeline.highlight_detection import (
    detect_scenes_seconds,
    fused_score,
    motion_score,
    SceneSlice,
    get_highlight_detector,
)
from pipeline.editing import write_ffconcat, render_with_fallback
from pipeline.music import generate_music_bed
from pipeline.censor import build_profanity_mute_filters, build_censor_filter_chain
from pipeline.utils.ffmpeg import FFmpegExecutionError, run_ffmpeg
from services.clip_discovery import mock_fetch_recent_clips, MOCK_PROVIDERS
from services.job_state import update_job_state
from services.storage_adapters import get_storage
from services.stt.whisper_stub import transcribe_audio

try:
    from ml.highlights.model import get_model
except Exception:
    get_model = None

# Set up logging with configurable level
log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=log_level,
    format="[%(asctime)s] [%(levelname)s] [job=%(job_id)s] [stage=%(stage)s] %(message)s",
)


# Custom exceptions for retry logic
class RetryableException(Exception):
    """Exception that should trigger a retry"""

    pass


class NonRetryableException(Exception):
    """Exception that should NOT trigger a retry"""

    pass


REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

celery_app = Celery(
    "cosmiv",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

# Beat schedule: periodic tasks
celery_app.conf.beat_schedule = {
    "sync-user-clips-every-30m": {
        "task": "sync_all_users_clips",
        "schedule": 1800.0,  # Every 30 minutes
    },
    "compile-weekly-montage": {
        "task": "compile_weekly_montage",
        "schedule": 604800.0,  # Every 7 days (weekly on Monday)
        # Can be made more specific with crontab format if needed
    },
    "refresh-platform-tokens": {
        "task": "refresh_expiring_platform_tokens",
        "schedule": 3600.0,  # Every hour - check for tokens expiring soon
    },
    "learn-frontend-patterns-daily": {
        "task": "learn_frontend_patterns",
        "schedule": 86400.0,  # Every 24 hours (daily at 2 AM UTC)
    },
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
    return [
        os.path.join(upload_dir, name)
        for name in names
        if name.lower().endswith(VIDEO_EXTENSIONS)
    ]


def update_progress(job_id: str, percentage: int, stage: str, message: str):
    """Update job progress in database"""
    progress = {
        "percentage": percentage,
        "stage": stage,
        "message": message,
        "stage_started": datetime.utcnow().isoformat(),
    }
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if job:
            job.progress = json.dumps(progress)
            job.updated_at = datetime.utcnow()
            session.add(job)
            session.commit()

    # Log progress
    logger.info(
        f"Progress: {percentage}% - {message}", extra={"job_id": job_id, "stage": stage}
    )


def add_error_detail(job_id: str, category: str, stage: str, error: str):
    """Add detailed error information to job"""
    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if job:
            existing = json.loads(job.error_detail) if job.error_detail else []
            existing.append(
                {
                    "category": category,  # CRITICAL, WARNING, INFO
                    "stage": stage,
                    "error": error,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            job.error_detail = json.dumps(existing)
            session.add(job)
            session.commit()


@celery_app.task(name="sync_all_users_clips")
def sync_all_users_clips():
    with get_session() as session:
        auths = session.exec(select(UserAuth)).all()
        user_ids = sorted({a.user_id for a in auths})
    for uid in user_ids:
        sync_user_clips.delay(uid)


@celery_app.task(name="sync_user_clips")
def sync_user_clips(user_id: str):
    from services.clip_discovery import fetch_recent_clips

    with get_session() as session:
        auths = session.exec(select(UserAuth).where(UserAuth.user_id == user_id)).all()
        for a in auths:
            # Check if token expired
            if a.expires_at and a.expires_at < datetime.utcnow():
                logger.warning(f"Token expired for {a.provider} user {user_id}")
                # In production, refresh token here
                continue

            # Fetch clips using OAuth token
            clips = fetch_recent_clips(a.provider, user_id, a.access_token)
            for c in clips:
                exists = session.exec(
                    select(DiscoveredClip).where(
                        (DiscoveredClip.user_id == user_id) & (DiscoveredClip.external_id == c["external_id"])  # type: ignore
                    )
                ).first()
                if exists:
                    continue
                session.add(
                    DiscoveredClip(
                        user_id=user_id,
                        provider=a.provider,
                        external_id=c["external_id"],
                        title=c.get("title"),
                        url=c.get("url"),
                    )
                )
        session.commit()
        logger.info(
            f"Synced clips for user {user_id}",
            extra={"user_id": user_id, "stage": "sync"},
        )


def _mux_with_music(
    video_path: str, music_path: str, output_path: str, mute_chain: str
) -> None:
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
    update_job_state(
        job_id,
        status=JobStatus.PROCESSING,
        stage="preparing",
        progress=5,
        mark_started=True,
    )

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
            update_job_state(
                job_id, stage=f"rendering:{variant}", progress=60 + idx * 5
            )
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
                    logger.warning(
                        "Upload to object storage failed for %s: %s", path, exc
                    )

        update_job_state(
            job_id,
            status=JobStatus.SUCCESS,
            stage="completed",
            progress=100,
            mark_finished=True,
        )

    except (RetryableRenderError, RenderPipelineError) as exc:
        update_job_state(
            job_id,
            status=JobStatus.FAILED,
            stage="failed",
            progress=100,
            error=str(exc),
            mark_finished=True,
        )
        raise


# Enhanced render_job with comprehensive error handling
@celery_app.task(
    name="render_job_enhanced", bind=True, max_retries=3, default_retry_delay=60
)
def render_job_enhanced(self, job_id: str, target_duration: int):
    """
    Enhanced render job with progress tracking, error handling, and retry logic.
    """
    import time

    start_time = time.time()

    export_dir = job_export_dir(job_id)
    upload_dir = job_upload_dir(job_id)

    from sqlmodel import Session  # local import to avoid circular issues

    with get_session() as session:
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            logger.warning(f"Job {job_id} not found in database")
            return
        job.status = JobStatus.PROCESSING
        session.add(job)
        session.commit()

    try:
        # Stage 1: Preprocessing (0-20%)
        update_progress(job_id, 5, "preprocessing", "Collecting uploaded clips...")
        video_files: List[str] = []
        for name in os.listdir(upload_dir):
            if name.lower().endswith((".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v")):
                video_files.append(os.path.join(upload_dir, name))
        if not video_files:
            raise NonRetryableException("No uploaded clips found for job")

        update_progress(
            job_id, 10, "preprocessing", f"Normalizing {len(video_files)} clips..."
        )
        try:
            preprocessed = preprocess_clips(video_files, export_dir)
            update_progress(job_id, 20, "preprocessing", "Preprocessing complete")
        except Exception as e:
            add_error_detail(job_id, "CRITICAL", "preprocessing", str(e))
            raise RetryableException(f"Preprocessing failed: {str(e)}") from e

        # Stage 2: Scene Detection (20-40%)
        update_progress(job_id, 25, "scene_detection", "Analyzing scenes...")
        candidates: List[Tuple[str, float, float, float]] = (
            []
        )  # (path, start, dur, score)
        try:
            if settings.USE_HIGHLIGHT_MODEL and get_model:
                model = get_model()
                for vp in preprocessed:
                    events = model.detect_events(vp)
                    # Boost scenes near detected events
                    scenes = detect_scenes_seconds(vp)
                    for s, e in scenes:
                        dur = max(0.5, e - s)
                        # Use fused_score for better detection
                        fused = fused_score(vp, s, min(dur, 10.0))
                        score = fused.get("total", motion_score(vp, s, min(dur, 10.0)))
                        proximity_boost = 0.0
                        for ev in events:
                            if abs(ev["time"] - (s + dur / 2)) < 3.0:
                                proximity_boost = max(
                                    proximity_boost, ev["confidence"] * 10.0
                                )
                        score += proximity_boost
                        candidates.append((vp, s, dur, score))
            else:
                for vp in preprocessed:
                    scenes = detect_scenes_seconds(vp)
                    for s, e in scenes:
                        dur = max(0.5, e - s)
                        # Use enhanced fused_score for better detection
                        fused = fused_score(vp, s, min(dur, 10.0))
                        score = fused.get("total", motion_score(vp, s, min(dur, 10.0)))
                        candidates.append((vp, s, dur, score))
            update_progress(
                job_id,
                40,
                "scene_detection",
                f"Found {len(candidates)} candidate scenes",
            )
        except Exception as e:
            add_error_detail(
                job_id, "WARNING", "scene_detection", f"Scene detection issue: {str(e)}"
            )
            logger.warning(
                f"Scene detection failed, using fallback: {str(e)}",
                extra={"job_id": job_id, "stage": "scene_detection"},
            )
            # Fallback to simple motion scoring
            for vp in preprocessed:
                candidates.append((vp, 0.0, 10.0, 5.0))

        # Stage 3: Selection (40-50%)
        update_progress(job_id, 45, "selection", "Selecting best highlights...")
        candidates.sort(key=lambda x: x[3], reverse=True)
        selected: List[Tuple[str, float, float]] = []
        total = 0.0
        for vp, s, dur, score in candidates:
            if total >= target_duration:
                break
            take = min(dur, max(1.0, min(4.0, target_duration - total)))
            selected.append((vp, s, take))
            total += take

        if not selected:
            # Fallback: take from first file
            add_error_detail(
                job_id, "WARNING", "selection", "No scenes selected, using fallback"
            )
            selected = [(preprocessed[0], 0.0, float(target_duration))]
        update_progress(
            job_id,
            50,
            "selection",
            f"Selected {len(selected)} highlights ({total:.1f}s)",
        )

        # Stage 4: Rendering (50-80%)
        update_progress(job_id, 55, "rendering", "Building video sequence...")
        concat_path = os.path.join(export_dir, "concat.txt")
        try:
            write_ffconcat(concat_path, selected)
        except Exception as e:
            add_error_detail(
                job_id,
                "CRITICAL",
                "rendering",
                f"Failed to create concat file: {str(e)}",
            )
            raise RetryableException(f"Concat file creation failed: {str(e)}") from e

        variants = ["landscape", "portrait"]
        video_outputs = {}
        for v in variants:
            update_progress(
                job_id,
                60 + (10 * variants.index(v)),
                "rendering",
                f"Rendering {v} format...",
            )
            out_path = os.path.join(export_dir, f"video_{v}.mp4")
            try:
                render_with_fallback(concat_path, out_path, preset=v)
                video_outputs[v] = out_path
            except Exception as e:
                add_error_detail(
                    job_id, "CRITICAL", "rendering", f"Failed to render {v}: {str(e)}"
                )
                raise RetryableException(f"Rendering {v} failed: {str(e)}") from e
        update_progress(job_id, 80, "rendering", "Rendering complete")

        # Stage 5: Post-processing (80-95%)
        update_progress(job_id, 85, "postprocessing", "Generating AI music bed...")
        music_path = os.path.join(export_dir, "music.mp3")

        # Get style from job if available
        job_style = None
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if job and job.style_id:
                job_style = job.style_id

        try:
            generate_music_bed(
                total or target_duration, music_path, style=job_style or "gaming"
            )
        except Exception as e:
            add_error_detail(
                job_id,
                "WARNING",
                "postprocessing",
                f"Music generation failed: {str(e)}",
            )
            logger.warning(
                f"Music generation failed, continuing without music: {str(e)}",
                extra={"job_id": job_id, "stage": "postprocessing"},
            )
            music_path = None  # Continue without music

        # STT transcription for profanity mute spans (stub)
        update_progress(job_id, 88, "postprocessing", "Detecting profanity...")
        try:
            transcript = transcribe_audio(preprocessed[0])
            mute_chain = build_profanity_mute_filters(transcript.get("profanity", []))
        except Exception as e:
            add_error_detail(
                job_id,
                "WARNING",
                "postprocessing",
                f"Profanity detection failed: {str(e)}",
            )
            mute_chain = ""  # Continue without muting
            logger.warning(
                f"Profanity detection failed: {str(e)}",
                extra={"job_id": job_id, "stage": "postprocessing"},
            )

        # Mix music into each variant with mute + optional watermark
        import subprocess

        final_outputs = {}
        for v, vid in video_outputs.items():
            update_progress(
                job_id,
                90 + (3 * list(video_outputs.keys()).index(v)),
                "postprocessing",
                f"Finalizing {v} format...",
            )
            final_path = os.path.join(export_dir, f"final_{v}.mp4")
            try:
                # Base audio chain: mute profanities then amix music (if available)
                if mute_chain:
                    af_base = f"[0:a]{mute_chain}[aclean];[aclean]volume=1.0[a0]"
                else:
                    af_base = "[0:a]volume=1.0[a0]"

                if music_path and os.path.exists(music_path):
                    af = f"{af_base};[1:a]volume=0.2[a1];[a0][a1]amix=inputs=2:duration=shortest[aout]"
                    music_input = ["-i", music_path]
                else:
                    af = f"{af_base}[aout]"
                    music_input = []

                vf_overlay = "null"
                if settings.WATERMARK_TEXT:
                    # Simple drawtext watermark bottom-right
                    pos = "x=w-tw-20:y=h-th-20"
                    vf_overlay = f"drawtext=text='{settings.WATERMARK_TEXT}':fontcolor=white:fontsize=24:{pos}:alpha=0.5"

                cmd = (
                    ["ffmpeg", "-y", "-i", vid]
                    + music_input
                    + [
                        "-filter_complex",
                        af
                        + (
                            ";[0:v]" + vf_overlay + "[vout]"
                            if vf_overlay != "null"
                            else ""
                        ),
                        "-map",
                        "0:v" if vf_overlay == "null" else "[vout]",
                        "-map",
                        "[aout]",
                        "-c:v",
                        "copy" if vf_overlay == "null" else "libx264",
                        "-preset",
                        "veryfast",
                        "-crf",
                        "20",
                        "-c:a",
                        "aac",
                        "-b:a",
                        "192k",
                        "-shortest",
                        final_path,
                    ]
                )
                subprocess.run(cmd, check=True, capture_output=True)
                final_outputs[v] = final_path
            except subprocess.CalledProcessError as e:
                add_error_detail(
                    job_id,
                    "CRITICAL",
                    "postprocessing",
                    f"FFmpeg failed for {v}: {str(e)}",
                )
                raise RetryableException(f"FFmpeg failed for {v}: {str(e)}") from e
            except Exception as e:
                add_error_detail(
                    job_id,
                    "CRITICAL",
                    "postprocessing",
                    f"Post-processing failed for {v}: {str(e)}",
                )
                raise RetryableException(
                    f"Post-processing failed for {v}: {str(e)}"
                ) from e

        # Stage 6: Upload (95-100%)
        update_progress(job_id, 95, "upload", "Uploading to storage...")
        storage = get_storage()
        public_map = {}
        try:
            if settings.USE_OBJECT_STORAGE:
                for v, path in final_outputs.items():
                    key = f"exports/{job_id}/final_{v}.mp4"
                    # upload via S3 adapter
                    try:
                        storage.upload(path, key)  # type: ignore
                        public_map[v] = storage.presigned_url(key)  # type: ignore
                    except Exception as e:
                        add_error_detail(
                            job_id,
                            "WARNING",
                            "upload",
                            f"Object storage upload failed for {v}: {str(e)}",
                        )
                        public_map[v] = path  # Fallback to local path
            else:
                for v, path in final_outputs.items():
                    public_map[v] = path
        except Exception as e:
            add_error_detail(
                job_id, "WARNING", "upload", f"Storage upload issue: {str(e)}"
            )
            # Use local paths as fallback
            for v, path in final_outputs.items():
                public_map[v] = path

        update_progress(job_id, 100, "complete", "Job completed successfully!")

        # Calculate processing time
        processing_time = time.time() - start_time

        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            job.status = JobStatus.SUCCESS
            job.processing_time_seconds = processing_time
            for v, path in final_outputs.items():
                session.add(Render(job_id=job_id, output_path=path, format=v))
            session.add(job)
            session.commit()

            # Update analytics after commit
            if job.user_id and job.style_id:
                from services.analytics import update_style_performance

                try:
                    update_style_performance(job.style_id, job_id)
                except Exception as e:
                    logger.warning(f"Failed to update style performance: {str(e)}")

            if job.user_id:
                from services.analytics import update_user_analytics

                try:
                    update_user_analytics(job.user_id)
                except Exception as e:
                    logger.warning(f"Failed to update user analytics: {str(e)}")

            # If this is a weekly montage job, update the montage record
            montage = session.exec(
                select(WeeklyMontage).where(WeeklyMontage.job_id == job_id)
            ).first()
            if montage:
                montage.render_path_landscape = final_outputs.get("landscape")
                montage.render_path_portrait = final_outputs.get("portrait")
                session.add(montage)

                # Auto-post weekly montages for Creator+ users with auto_post_weekly enabled
                creator_connections = session.exec(
                    select(SocialConnection).where(
                        SocialConnection.auto_post_weekly == True,
                        SocialConnection.is_active == True,
                    )
                ).all()

                for conn in creator_connections:
                    # Post portrait to TikTok/Instagram, landscape to YouTube
                    format_to_use = (
                        "portrait"
                        if conn.platform in ["tiktok", "instagram"]
                        else "landscape"
                    )
                    video_path = (
                        montage.render_path_portrait
                        if format_to_use == "portrait"
                        else montage.render_path_landscape
                    )

                    if video_path:
                        post = SocialPost(
                            user_id=conn.user_id,
                            weekly_montage_id=montage.id,
                            platform=conn.platform,
                            caption=montage.title
                            or f"Weekly Highlights - {montage.week_start.strftime('%B %d, %Y')} 🎬",
                            status="pending",
                        )
                        session.add(post)
                        session.commit()
                        session.refresh(post)

                        # Trigger async posting
                        post_to_social_async.delay(
                            post.id,
                            video_path,
                            post.caption,
                            conn.access_token,
                            platform=conn.platform,
                            user_id=conn.user_id,
                            platform_user_id=conn.platform_user_id,
                            instagram_account_id=(
                                conn.platform_user_id
                                if conn.platform == "instagram"
                                else None
                            ),
                        )

            # Check for auto-post connections for this job
            # Try to get user_id from job metadata or infer from job_id structure
            # For now, we'll skip auto-posting regular jobs (users can manually post)
            # This can be enhanced later when we add user_id to Job model

            session.commit()

        # Save a small marker file for URLs (optional)
        try:
            with open(os.path.join(export_dir, "urls.txt"), "w") as f:
                for v, url in public_map.items():
                    f.write(f"{v}: {url}\n")
        except Exception:
            pass

    except RetryableException as e:
        # Retryable error - attempt retry with exponential backoff
        logger.warning(
            f"Retryable error in job {job_id}: {str(e)}",
            extra={"job_id": job_id, "stage": "error"},
        )
        add_error_detail(job_id, "WARNING", "retry", f"Retryable error: {str(e)}")

        # Check retry count
        retries = self.request.retries if hasattr(self, "request") else 0
        if retries < 3:
            countdown = 60 * (2**retries)  # Exponential backoff: 60s, 120s, 240s
            logger.info(
                f"Scheduling retry {retries + 1}/3 for job {job_id} in {countdown}s"
            )
            raise self.retry(exc=e, countdown=countdown)
        else:
            # Max retries reached - fail the job
            with get_session() as session:
                job = session.exec(select(Job).where(Job.job_id == job_id)).first()
                if job:
                    job.status = JobStatus.FAILED
                    job.error = f"Job failed after {retries} retries: {str(e)}"
                    session.add(job)
                    session.commit()
            raise

    except (NonRetryableException, ValueError) as e:
        # Non-retryable error - fail immediately
        logger.error(
            f"Non-retryable error in job {job_id}: {str(e)}",
            extra={"job_id": job_id, "stage": "error"},
        )
        add_error_detail(job_id, "CRITICAL", "validation", str(e))
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
        update_job_state(
            job_id,
            status=JobStatus.RETRYING,
            stage="retrying",
            progress=95,
            error=str(exc),
        )
        raise
    except RenderPipelineError as exc:
        logger.error("Render job %s failed: %s", job_id, exc)
        update_job_state(
            job_id,
            status=JobStatus.FAILED,
            stage="failed",
            progress=100,
            error=str(exc),
            mark_finished=True,
        )
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
            update_job_state(
                job_id,
                status=JobStatus.RETRYING,
                stage="retrying",
                progress=95,
                error=str(mapped),
            )
            raise mapped
        logger.error("Render job %s ffmpeg failure: %s", job_id, mapped)
        update_job_state(
            job_id,
            status=JobStatus.FAILED,
            stage="failed",
            progress=100,
            error=str(mapped),
            mark_finished=True,
        )
        raise mapped
    except Exception as exc:
        logger.exception("Render job %s unexpected failure", job_id)
        update_job_state(
            job_id,
            status=JobStatus.FAILED,
            stage="failed",
            progress=100,
            error=str(exc),
            mark_finished=True,
        )
        raise

    except Exception as e:
        # Unknown error - treat as retryable by default
        logger.error(
            f"Unexpected error in job {job_id}: {str(e)}",
            extra={"job_id": job_id, "stage": "error"},
            exc_info=True,
        )
        add_error_detail(job_id, "CRITICAL", "unknown", str(e))

        retries = self.request.retries if hasattr(self, "request") else 0
        if retries < 2:  # Only retry unknown errors twice
            countdown = 60 * (2**retries)
            logger.info(
                f"Scheduling retry {retries + 1}/2 for unexpected error in job {job_id}"
            )
            raise self.retry(exc=RetryableException(str(e)), countdown=countdown)
        else:
            with get_session() as session:
                job = session.exec(select(Job).where(Job.job_id == job_id)).first()
                if job:
                    job.status = JobStatus.FAILED
                    job.error = f"Job failed after {retries} retries: {str(e)}"
                    session.add(job)
                    session.commit()
            raise


@celery_app.task(name="compile_weekly_montage")
def compile_weekly_montage():
    """
    Compile weekly automated montage from best clips of the week.
    Runs automatically via Celery beat every Monday.
    """
    from datetime import timedelta
    from storage import new_job_id
    import shutil

    logger.info(
        "Starting weekly montage compilation",
        extra={"job_id": "weekly", "stage": "compile"},
    )

    # Calculate week start (Monday)
    now = datetime.utcnow()
    days_since_monday = (now.weekday()) % 7
    week_start = now - timedelta(days=days_since_monday)
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=7)

    # Check if montage already exists for this week
    with get_session() as session:
        existing = session.exec(
            select(WeeklyMontage).where(WeeklyMontage.week_start == week_start)
        ).first()
        if existing:
            logger.info(
                f"Weekly montage for week {week_start} already exists",
                extra={"job_id": "weekly", "stage": "compile"},
            )
            return {"status": "exists", "week_start": week_start.isoformat()}

        # 1. Get successful jobs from past week
        recent_jobs = session.exec(
            select(Job)
            .where(
                Job.status == JobStatus.SUCCESS,
                Job.created_at >= week_start,
                Job.created_at < week_end,
            )
            .order_by(Job.created_at.desc())
        ).all()

        if not recent_jobs:
            logger.warning(
                "No successful jobs found for weekly montage",
                extra={"job_id": "weekly", "stage": "compile"},
            )
            return {"status": "no_clips", "week_start": week_start.isoformat()}

        # 2. Get renders from these jobs (prioritize landscape for compilation)
        clip_paths = []
        featured_users = set()

        for job in recent_jobs[:50]:  # Limit to 50 most recent
            renders = session.exec(
                select(Render).where(
                    Render.job_id == job.job_id, Render.format == "landscape"
                )
            ).first()
            if renders and os.path.exists(renders.output_path):
                clip_paths.append(
                    {
                        "path": renders.output_path,
                        "created_at": job.created_at,
                    }
                )

        if not clip_paths:
            logger.warning(
                "No renders found for weekly montage",
                extra={"job_id": "weekly", "stage": "compile"},
            )
            return {"status": "no_clips", "week_start": week_start.isoformat()}

        # Sort by creation date (newest first)
        clip_paths.sort(key=lambda x: x["created_at"], reverse=True)

        # Take top 10-15 clips for compilation (~3 minutes)
        selected_clips = clip_paths[:15]
        target_duration = 180  # 3 minutes

        # Create weekly montage record
        montage = WeeklyMontage(
            week_start=week_start,
            clip_count=len(selected_clips),
            total_duration=target_duration,
            title=f"Weekly Highlights - {week_start.strftime('%B %d, %Y')}",
            featured_user_ids=json.dumps(list(featured_users)),
        )
        session.add(montage)
        session.commit()
        session.refresh(montage)

        # Create compilation job
        job_id = new_job_id()
        export_dir = job_export_dir(job_id)
        upload_dir = job_upload_dir(job_id)

        # Copy clips to upload directory
        os.makedirs(upload_dir, exist_ok=True)
        for i, clip_info in enumerate(selected_clips):
            dest = os.path.join(upload_dir, f"weekly_clip_{i:03d}.mp4")
            try:
                shutil.copy2(clip_info["path"], dest)
            except Exception as e:
                logger.warning(f"Failed to copy clip {clip_info['path']}: {str(e)}")
                continue

        # Create job
        job = Job(
            job_id=job_id,
            status=JobStatus.PENDING,
            target_duration=target_duration,
        )
        session.add(job)

        # Update montage with job_id
        montage.job_id = job_id
        session.add(montage)
        session.commit()

    # Process compilation asynchronously
    logger.info(
        f"Created weekly montage job {job_id} with {len(selected_clips)} clips",
        extra={"job_id": job_id, "stage": "compile"},
    )

    render_job.delay(job_id, target_duration)

    return {
        "status": "created",
        "job_id": job_id,
        "week_start": week_start.isoformat(),
        "clip_count": len(selected_clips),
    }


@celery_app.task(name="post_to_social_async")
def post_to_social_async(
    post_id: int,
    video_path: str,
    caption: str,
    access_token: str,
    platform: str = "tiktok",
    user_id: Optional[str] = None,
    platform_user_id: Optional[str] = None,
    instagram_account_id: Optional[str] = None,
):
    """
    Async task to post video to social media platform.
    """
    from services.social_posters import post_to_social_media
    import os

    logger.info(
        f"Posting to {platform}",
        extra={"job_id": f"social_{post_id}", "stage": "posting"},
    )

    try:
        # Verify video file exists
        if not os.path.exists(video_path):
            raise Exception(f"Video file not found: {video_path}")

        # Post to platform
        kwargs = {}
        if platform == "instagram" and instagram_account_id:
            kwargs["instagram_account_id"] = instagram_account_id
        elif platform == "tiktok" and platform_user_id:
            kwargs["user_id"] = platform_user_id

        result = post_to_social_media(
            platform=platform,
            video_path=video_path,
            caption=caption,
            access_token=access_token,
            **kwargs,
        )

        # Update post record
        with get_session() as session:
            post = session.exec(
                select(SocialPost).where(SocialPost.id == post_id)
            ).first()
            if post:
                post.status = "posted" if result.get("success") else "failed"
                post.platform_post_id = result.get("post_id")
                post.video_url = result.get("video_url")
                post.posted_at = datetime.utcnow()
                if not result.get("success"):
                    post.error = result.get("error", "Unknown error")
                session.add(post)
                session.commit()

        logger.info(
            f"Posted to {platform} successfully",
            extra={"job_id": f"social_{post_id}", "stage": "complete"},
        )
        return result

    except Exception as e:
        logger.error(f"Failed to post to {platform}: {str(e)}", exc_info=True)

        # Update post record with error
        with get_session() as session:
            post = session.exec(
                select(SocialPost).where(SocialPost.id == post_id)
            ).first()
            if post:
                post.status = "failed"
                post.error = str(e)
                session.add(post)
                session.commit()

        raise


@celery_app.task(name="refresh_expiring_platform_tokens")
def refresh_expiring_platform_tokens():
    """
    Automatically refresh OAuth tokens for gaming platforms that are about to expire.
    Runs every hour via Celery Beat to check for tokens expiring in the next 24 hours.
    """
    from services.platform_oauth import get_oauth_handler
    from datetime import datetime, timedelta
    import requests

    logger.info("Checking for expiring platform tokens...")

    with get_session() as session:
        # Find tokens expiring in the next 24 hours
        expiry_threshold = datetime.utcnow() + timedelta(hours=24)

        expiring_tokens = session.exec(
            select(UserAuth).where(
                UserAuth.expires_at.isnot(None),
                UserAuth.expires_at <= expiry_threshold,
                UserAuth.refresh_token.isnot(None),
            )
        ).all()

        refreshed_count = 0
        failed_count = 0

        for user_auth in expiring_tokens:
            try:
                provider = user_auth.provider.lower()
                handler = get_oauth_handler(provider)

                if not handler:
                    logger.warning(f"No OAuth handler for provider: {provider}")
                    continue

                # Skip Steam (doesn't use refresh tokens)
                if provider == "steam":
                    continue

                # Check if token has refresh method
                if not hasattr(handler, "refresh_token"):
                    logger.warning(f"Provider {provider} doesn't support token refresh")
                    continue

                # Refresh the token
                logger.info(
                    f"Refreshing token for user {user_auth.user_id}, provider {provider}"
                )

                # Call static method
                new_token_data = handler.refresh_token(user_auth.refresh_token)

                # Update in database
                user_auth.access_token = new_token_data.get(
                    "access_token", user_auth.access_token
                )
                if new_token_data.get("refresh_token"):
                    user_auth.refresh_token = new_token_data["refresh_token"]
                if new_token_data.get("expires_at"):
                    user_auth.expires_at = datetime.fromisoformat(
                        new_token_data["expires_at"]
                    )

                session.add(user_auth)
                session.commit()

                refreshed_count += 1
                logger.info(f"Successfully refreshed token for {provider}")

            except Exception as e:
                failed_count += 1
                logger.error(
                    f"Failed to refresh token for user {user_auth.user_id}, provider {user_auth.provider}: {str(e)}",
                    exc_info=True,
                )
                # Continue with next token even if one fails

        logger.info(
            f"Token refresh complete: {refreshed_count} refreshed, {failed_count} failed",
            extra={"refreshed": refreshed_count, "failed": failed_count},
        )


@celery_app.task(name="learn_frontend_patterns")
def learn_frontend_patterns():
    """
    Automated daily task to learn front-end design patterns.
    Updates design principles from existing patterns.
    Runs daily via Celery Beat.

    Note: Scraping functionality has been removed.
    """
    from services.frontend_learner.learner import PatternLearner

    logger.info("Starting automated front-end pattern learning...")

    try:
        learner = PatternLearner()

        # Update design principles from existing patterns
        logger.info("Updating design principles from existing patterns...")
        principles = learner.generate_design_principles()

        logger.info(
            f"Front-end learning complete: {len(principles.get('trends', {}))} trend categories"
        )

        return {
            "status": "completed",
            "message": "Scraping functionality removed. Only design principles updated from existing patterns.",
            "trends_detected": len(principles.get("trends", {})),
        }

    except Exception as e:
        logger.error(f"Failed to learn front-end patterns: {e}", exc_info=True)
        return {"status": "failed", "error": str(e)}
