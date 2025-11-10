import logging
import os
from typing import List, Tuple

from config import settings
from pipeline.utils.ffmpeg import FFmpegExecutionError, run_ffmpeg

logger = logging.getLogger(__name__)

_nvenc_checked = False
_nvenc_available = False


def write_ffconcat(concat_path: str, clips: List[Tuple[str, float, float]]):
    with open(concat_path, "w") as f:
        f.write("ffconcat version 1.0\n\n")
        for path, start, dur in clips:
            escaped = path.replace("'", "'\\''")
            f.write(f"file '{escaped}'\n")
            f.write(f"inpoint {start}\n")
            f.write(f"duration {dur}\n\n")


def _vf_for_preset(preset: str) -> str:
    if preset == "portrait":
        return "scale=-2:1920:flags=lanczos,crop=1080:1920:(in_w-1080)/2:0"
    if preset == "square":
        return "scale=1080:-2:flags=lanczos,crop=1080:1080:(in_w-1080)/2:(in_h-1080)/2"
    return "scale=1920:-2:flags=lanczos"


def render_with_fallback(concat_path: str, output_path: str, preset: str = "landscape"):
    vf = _vf_for_preset(preset)
    base = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_path, "-vf", vf]

    if _should_try_nvenc():
        nvenc_cmd = base + [
            "-c:v",
            "h264_nvenc",
            "-b:v",
            "8M",
            "-maxrate",
            "8M",
            "-bufsize",
            "16M",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            output_path,
        ]
        try:
            run_ffmpeg(nvenc_cmd)
            return output_path
        except FFmpegExecutionError as exc:
            logger.info("NVENC failed, falling back to libx264: %s", exc)

    x264_cmd = base + [
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        output_path,
    ]
    run_ffmpeg(x264_cmd)
    return output_path


def render_matrix(
    concat_path: str, out_dir: str, presets: List[str]
) -> List[Tuple[str, str]]:
    os.makedirs(out_dir, exist_ok=True)
    outputs: List[Tuple[str, str]] = []
    for p in presets:
        out_path = os.path.join(out_dir, f"video_{p}.mp4")
        render_with_fallback(concat_path, out_path, preset=p)
        outputs.append((p, out_path))
    return outputs


def _should_try_nvenc() -> bool:
    global _nvenc_checked, _nvenc_available
    if not settings.ENABLE_NVENC:
        return False
    if _nvenc_checked:
        return _nvenc_available

    cmd = ["ffmpeg", "-hide_banner", "-encoders"]
    result = run_ffmpeg(cmd, check=False)
    _nvenc_available = result.returncode == 0 and "h264_nvenc" in (result.stdout or "")
    _nvenc_checked = True
    if not _nvenc_available:
        logger.info("NVENC encoder not available, defaulting to libx264")
    return _nvenc_available
