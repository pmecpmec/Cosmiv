import logging
import shlex
import subprocess
import time
from dataclasses import dataclass
from typing import Sequence, Optional

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 1.0  # seconds
RETRY_BACKOFF = 2.0  # multiplier for exponential backoff


@dataclass
class FFmpegExecutionError(RuntimeError):
    command: Sequence[str]
    returncode: int
    stderr: str
    attempt: int = 1

    def __str__(self) -> str:
        """Generate user-friendly error message"""
        cmd = " ".join(shlex.quote(part) for part in self.command)
        
        # Extract common error patterns for better messages
        stderr_lower = self.stderr.lower() if self.stderr else ""
        
        if "no such file" in stderr_lower or "cannot find" in stderr_lower:
            user_message = "Video file not found. Please check the file path."
        elif "invalid data" in stderr_lower or "invalid argument" in stderr_lower:
            user_message = "Invalid video file format or corrupted file."
        elif "permission denied" in stderr_lower:
            user_message = "Permission denied. Please check file permissions."
        elif "codec" in stderr_lower and "not found" in stderr_lower:
            user_message = "Required video codec not available. Please install codec support."
        elif "out of memory" in stderr_lower or "cannot allocate" in stderr_lower:
            user_message = "Insufficient memory to process video. Try a smaller file or reduce quality."
        elif "connection" in stderr_lower or "network" in stderr_lower:
            user_message = "Network error while processing video. Please try again."
        else:
            user_message = f"Video processing failed (error code {self.returncode})."
        
        return f"{user_message}\nCommand: {cmd}\nDetails: {self.stderr.strip()[:200]}"


def run_ffmpeg(
    command: Sequence[str],
    *,
    check: bool = True,
    capture: bool = True,
    retries: int = MAX_RETRIES,
    retry_delay: float = RETRY_DELAY,
) -> subprocess.CompletedProcess:
    """
    Run an ffmpeg command with structured logging, error handling, and retry logic.
    
    Args:
        command: FFmpeg command as sequence of strings
        check: Raise exception on non-zero return code
        capture: Capture stdout/stderr
        retries: Number of retry attempts (default: 3)
        retry_delay: Initial delay between retries in seconds (default: 1.0)
        
    Returns:
        subprocess.CompletedProcess
        
    Raises:
        FFmpegExecutionError: If command fails after all retries
    """
    log_line = " ".join(shlex.quote(part) for part in command)
    logger.debug("Executing ffmpeg: %s", log_line)
    
    last_error = None
    delay = retry_delay
    
    for attempt in range(retries + 1):
        try:
            result = subprocess.run(
                command,
                capture_output=capture,
                text=True,
                check=False,
                timeout=3600,  # 1 hour timeout for long operations
            )
            
            if result.returncode == 0:
                if attempt > 0:
                    logger.info(f"FFmpeg succeeded on attempt {attempt + 1}")
                return result
            
            # Non-zero return code
            stderr = result.stderr or result.stdout or ""
            
            # Don't retry on certain errors (client errors, invalid input)
            if any(keyword in stderr.lower() for keyword in [
                "no such file",
                "cannot find",
                "invalid data",
                "invalid argument",
                "permission denied",
            ]):
                logger.warning(f"FFmpeg command failed (non-retryable): {log_line}")
                if check:
                    raise FFmpegExecutionError(
                        command=list(command),
                        returncode=result.returncode,
                        stderr=stderr,
                        attempt=attempt + 1,
                    )
                return result
            
            # Retryable error
            if attempt < retries:
                logger.warning(
                    f"FFmpeg command failed (attempt {attempt + 1}/{retries + 1}), "
                    f"retrying in {delay:.1f}s: {log_line}"
                )
                time.sleep(delay)
                delay *= RETRY_BACKOFF  # Exponential backoff
                continue
            
            # Final attempt failed
            logger.error(f"FFmpeg command failed after {retries + 1} attempts: {log_line}")
            if check:
                raise FFmpegExecutionError(
                    command=list(command),
                    returncode=result.returncode,
                    stderr=stderr,
                    attempt=attempt + 1,
                )
            return result
            
        except subprocess.TimeoutExpired as e:
            logger.error(f"FFmpeg command timed out after 1 hour: {log_line}")
            if attempt < retries:
                logger.warning(f"Retrying after timeout (attempt {attempt + 1}/{retries + 1})")
                time.sleep(delay)
                delay *= RETRY_BACKOFF
                continue
            raise FFmpegExecutionError(
                command=list(command),
                returncode=-1,
                stderr=f"Command timed out after 1 hour: {str(e)}",
                attempt=attempt + 1,
            )
        except FFmpegExecutionError as e:
            last_error = e
            if attempt < retries and check:
                logger.warning(f"Retrying after error (attempt {attempt + 1}/{retries + 1})")
                time.sleep(delay)
                delay *= RETRY_BACKOFF
                continue
            raise
    
    # Should not reach here, but handle it
    if last_error:
        raise last_error
    
    raise FFmpegExecutionError(
        command=list(command),
        returncode=-1,
        stderr="Unknown error occurred",
        attempt=retries + 1,
    )
