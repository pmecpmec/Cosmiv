import logging
import shlex
import subprocess
from dataclasses import dataclass
from typing import Sequence

logger = logging.getLogger(__name__)


@dataclass
class FFmpegExecutionError(RuntimeError):
    command: Sequence[str]
    returncode: int
    stderr: str

    def __str__(self) -> str:  # pragma: no cover - simple repr
        cmd = " ".join(shlex.quote(part) for part in self.command)
        return f"ffmpeg command failed (code {self.returncode}): {cmd}\n{self.stderr.strip()}"


def run_ffmpeg(
    command: Sequence[str], *, check: bool = True, capture: bool = True
) -> subprocess.CompletedProcess:
    """Run an ffmpeg command with structured logging and error handling."""
    log_line = " ".join(shlex.quote(part) for part in command)
    logger.debug("Executing ffmpeg: %s", log_line)
    result = subprocess.run(
        command,
        capture_output=capture,
        text=True,
        check=False,
    )
    if result.returncode != 0 and check:
        stderr = result.stderr or result.stdout or ""
        logger.warning("ffmpeg command failed: %s", log_line)
        raise FFmpegExecutionError(
            command=list(command), returncode=result.returncode, stderr=stderr
        )
    return result
