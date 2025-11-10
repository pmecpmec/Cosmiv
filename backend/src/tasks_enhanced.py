# Complete enhanced version of tasks.py render_job function
# This demonstrates all Phase 1 enhancements before integration

import os
import json
import logging
import subprocess
from datetime import datetime
from celery import Celery
from db import get_session
from models import Job, JobStatus, Render
from storage import job_upload_dir, job_export_dir
from sqlmodel import select
from typing import List, Tuple, Dict, Any, Optional
from pipeline.preprocess import preprocess_clips
from pipeline.highlight_detection import detect_scenes_seconds, fused_score
from pipeline.editing import write_ffconcat, render_with_fallback
from pipeline.music import generate_music_bed
from services.storage_adapters import get_storage
from services.stt.whisper_stub import transcribe_audio
from pipeline.censor import build_profanity_mute_filters
from config import settings

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="[%(asctime)s] [%(levelname)s] [job=%(job_id)s] [stage=%(stage)s] %(message)s",
)


# Custom exceptions for retry logic
class RetryableException(Exception):
    """Exception that should trigger a retry"""

    pass


class NonRetryableException(Exception):
    """Exception that should NOT trigger a retry"""

    pass


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
    logger.info(f"Progress: {percentage}% - {message}", extra={"job_id": job_id, "stage": stage})


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


def render_job_with_enhancements(job_id: str, target_duration: int):
    """Enhanced render_job with progress tracking, error handling, and retry logic"""

    # Helper to wrap stages with error handling
    def run_stage(
        stage_name: str,
        percentage_start: int,
        percentage_end: int,
        message: str,
        func,
        critical: bool = False,
        *args,
        **kwargs,
    ):
        """Execute a pipeline stage with error handling"""
        update_progress(job_id, percentage_start, stage_name, message)
        try:
            result = func(*args, **kwargs)
            logger.info(f"Stage '{stage_name}' completed successfully", extra={"job_id": job_id, "stage": stage_name})
            return result
        except RetryableException as e:
            add_error_detail(job_id, "WARNING", stage_name, f"Retryable error: {str(e)}")
            logger.warning(
                f"Retryable error in '{stage_name}': {str(e)}", extra={"job_id": job_id, "stage": stage_name}
            )
            if critical:
                raise  # Re-raise for retry
            return None  # Continue with degraded mode
        except Exception as e:
            add_error_detail(job_id, "CRITICAL" if critical else "WARNING", stage_name, str(e))
            logger.error(
                f"Error in '{stage_name}': {str(e)}", extra={"job_id": job_id, "stage": stage_name}, exc_info=True
            )
            if critical:
                raise NonRetryableException(f"{stage_name} failed: {str(e)}")
            return None

    try:
        export_dir = job_export_dir(job_id)
        upload_dir = job_upload_dir(job_id)

        # Initialize job status
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if not job:
                logger.error(f"Job {job_id} not found")
                return
            job.status = JobStatus.PROCESSING
            job.error_detail = json.dumps([])
            session.add(job)
            session.commit()

        # STAGE 1: Collect video files (0-5%)
        video_files: List[str] = []
        run_stage(
            "collect",
            0,
            5,
            "Collecting uploaded clips...",
            lambda: [
                video_files.extend(
                    [
                        os.path.join(upload_dir, name)
                        for name in os.listdir(upload_dir)
                        if name.lower().endswith((".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"))
                    ]
                )
            ][0],
            critical=True,
        )

        if not video_files:
            raise NonRetryableException("No valid video files found")

        logger.info(f"Found {len(video_files)} video files", extra={"job_id": job_id, "stage": "collect"})

        # STAGE 2: Preprocess clips (5-20%)
        preprocessed = run_stage(
            "preprocess",
            10,
            20,
            f"Normalizing {len(video_files)} clips to 1080p30...",
            lambda: preprocess_clips(video_files, export_dir),
            critical=True,
        )

        if not preprocessed:
            raise NonRetryableException("Preprocessing failed")

        # STAGE 3: Detect and score scenes (20-50%)
        candidates: List[Tuple[str, float, float, float]] = []  # (path, start, dur, score)

        run_stage(
            "detect",
            25,
            50,
            "Detecting scenes and scoring highlights...",
            lambda: [
                candidates.append((vp, s, dur, scores["fused_score"]))
                for vp in preprocessed
                for s, e in detect_scenes_seconds(vp)
                for dur in [max(0.5, e - s)]
                for scores in [fused_score(vp, s, min(dur, 10.0))]
            ],
            critical=False,
        )  # Can continue even if some fail

        if not candidates:
            logger.warning("No scenes detected, using fallback", extra={"job_id": job_id, "stage": "detect"})
            for vp in preprocessed:
                candidates.append((vp, 0.0, min(5.0, target_duration), 50.0))

        # Sort by fused score and select top scenes
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
            selected = [(preprocessed[0], 0.0, float(target_duration))]

        logger.info(
            f"Selected {len(selected)} scenes totaling {total:.1f}s", extra={"job_id": job_id, "stage": "detect"}
        )

        # STAGE 4: Render video formats (50-80%)
        concat_path = os.path.join(export_dir, "concat.txt")
        write_ffconcat(concat_path, selected)

        variants = ["landscape", "portrait"]
        video_outputs = {}

        for v in variants:
            render_pct = 50 + (30 * (variants.index(v) + 1) / len(variants))
            run_stage(
                f"render_{v}",
                render_pct - 15,
                render_pct,
                f"Rendering {v} format...",
                lambda fmt=v: video_outputs.update(
                    {fmt: render_with_fallback(concat_path, os.path.join(export_dir, f"video_{fmt}.mp4"), preset=fmt)}
                ),
                critical=True,
            )

        # STAGE 5: Generate music (80-85%)
        music_path = os.path.join(export_dir, "music.mp3")
        music_result = run_stage(
            "music",
            80,
            85,
            "Generating music bed...",
            lambda: generate_music_bed(total or target_duration, music_path, freq=220),
            critical=False,  # Can continue without music
        )

        # STAGE 6: Profanity detection (85-87%)
        transcript = None
        mute_chain = "anull"
        if preprocessed:
            transcript_result = run_stage(
                "stt", 85, 87, "Detecting profanity...", lambda: transcribe_audio(preprocessed[0]), critical=False
            )
            if transcript_result:
                transcript = transcript_result
                mute_chain = build_profanity_mute_filters(transcript.get("profanity", []))

        # STAGE 7: Final mixing and watermarking (87-95%)
        final_outputs = {}
        for v, vid in video_outputs.items():
            mix_pct = 87 + (8 * (list(video_outputs.keys()).index(v) + 1) / len(video_outputs))
            run_stage(
                f"mix_{v}",
                mix_pct - 4,
                mix_pct,
                f"Adding music and watermark to {v}...",
                lambda fmt=v, path=vid: _mix_final(fmt, path, music_path, mute_chain, export_dir, final_outputs),
                critical=True,
            )

        # STAGE 8: Upload to storage (95-100%)
        storage = get_storage()
        public_map = {}
        run_stage(
            "upload",
            95,
            100,
            "Uploading final videos...",
            lambda: _upload_outputs(final_outputs, storage, job_id, public_map),
            critical=False,  # Local files still available
        )

        # Success!
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            job.status = JobStatus.SUCCESS
            job.progress = json.dumps(
                {
                    "percentage": 100,
                    "stage": "complete",
                    "message": "Job completed successfully",
                    "stage_started": datetime.utcnow().isoformat(),
                }
            )
            for v, path in final_outputs.items():
                session.add(Render(job_id=job_id, output_path=path, format=v))
            session.add(job)
            session.commit()

        logger.info(f"Job {job_id} completed successfully", extra={"job_id": job_id, "stage": "complete"})

    except NonRetryableException as e:
        # Don't retry - mark as failed
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if job:
                job.status = JobStatus.FAILED
                job.error = str(e)
                session.add(job)
                session.commit()
        logger.error(f"Job {job_id} failed non-retryably: {str(e)}", extra={"job_id": job_id, "stage": "error"})

    except Exception as e:
        # Retryable or unexpected error
        with get_session() as session:
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if job:
                job.status = JobStatus.FAILED
                job.error = str(e)
                session.add(job)
                session.commit()
        logger.error(
            f"Job {job_id} failed with retryable error: {str(e)}",
            extra={"job_id": job_id, "stage": "error"},
            exc_info=True,
        )
        raise RetryableException(f"Job failed: {str(e)}")


def _mix_final(
    format_name: str, video_path: str, music_path: str, mute_chain: str, export_dir: str, final_outputs: dict
):
    """Helper to mix audio and add watermark"""
    final_path = os.path.join(export_dir, f"final_{format_name}.mp4")

    # Build audio filter chain
    af = f"[0:a]{mute_chain}[aclean];[aclean]volume=1.0[a0];"
    if os.path.exists(music_path):
        af += f"[1:a]volume=0.2[a1];[a0][a1]amix=inputs=2:duration=shortest[aout]"
    else:
        af += "[a0]volume=1.0[aout]"

    # Build video filter for watermark
    vf_overlay = "null"
    if settings.WATERMARK_TEXT:
        pos = "x=w-tw-20:y=h-th-20"
        vf_overlay = f"drawtext=text='{settings.WATERMARK_TEXT}':fontcolor=white:fontsize=24:{pos}:alpha=0.5"

    inputs = ["-i", video_path]
    filter_complex = af + (";[0:v]" + vf_overlay + "[vout]" if vf_overlay != "null" else "")

    if os.path.exists(music_path):
        inputs.extend(["-i", music_path])

    cmd = (
        ["ffmpeg", "-y"]
        + inputs
        + [
            "-filter_complex",
            filter_complex,
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
    final_outputs[format_name] = final_path
    return final_path


def _upload_outputs(final_outputs: dict, storage: Any, job_id: str, public_map: dict):
    """Helper to upload outputs to storage"""
    if settings.USE_OBJECT_STORAGE:
        for v, path in final_outputs.items():
            key = f"exports/{job_id}/final_{v}.mp4"
            try:
                storage.upload(path, key)
                public_map[v] = storage.presigned_url(key)
            except Exception as e:
                logger.warning(f"Storage upload failed for {v}: {str(e)}")
                public_map[v] = path
    else:
        for v, path in final_outputs.items():
            public_map[v] = path

    # Save URLs
    try:
        with open(os.path.join(job_export_dir(job_id), "urls.txt"), "w") as f:
            for v, url in public_map.items():
                f.write(f"{v}: {url}\n")
    except Exception:
        pass

    return public_map
