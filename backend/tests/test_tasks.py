from db import get_session
from models import Job, JobStatus
from services.job_state import update_job_state
from tasks import (
    RenderPipelineError,
    RetryableRenderError,
    _classify_ffmpeg_error,
)
from pipeline.utils.ffmpeg import FFmpegExecutionError
from sqlmodel import select


def test_classify_ffmpeg_error_transient():
    exc = FFmpegExecutionError(command=["ffmpeg"], returncode=1, stderr="Resource temporarily unavailable")
    mapped = _classify_ffmpeg_error(exc)
    assert isinstance(mapped, RetryableRenderError)


def test_classify_ffmpeg_error_fatal():
    exc = FFmpegExecutionError(command=["ffmpeg"], returncode=1, stderr="unknown encoder")
    mapped = _classify_ffmpeg_error(exc)
    assert isinstance(mapped, RenderPipelineError)


def test_update_job_state_persists_progress():
    with get_session() as session:
        job = Job(job_id="test-job")
        session.add(job)
        session.commit()

    update_job_state(
        "test-job",
        status=JobStatus.PROCESSING,
        stage="preprocessing",
        progress=33,
        mark_started=True,
    )

    with get_session() as session:
        stored = session.exec(select(Job).where(Job.job_id == "test-job")).first()
        assert stored is not None
        assert stored.stage == "preprocessing"
        # Job model stores progress as string
        assert stored.progress == "33"
        assert stored.status == JobStatus.PROCESSING
        assert stored.started_at is not None
