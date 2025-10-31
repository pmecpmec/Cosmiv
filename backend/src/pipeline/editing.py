import os
import subprocess
from typing import List, Tuple


def write_ffconcat(concat_path: str, clips: List[Tuple[str, float, float]]):
    with open(concat_path, 'w') as f:
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
    # Try NVENC first
    nvenc_cmd = [
        "ffmpeg","-y","-f","concat","-safe","0","-i",concat_path,
        "-vf", vf,
        "-c:v","h264_nvenc","-b:v","8M","-maxrate","8M","-bufsize","16M",
        "-c:a","aac","-b:a","192k", output_path
    ]
    try:
        subprocess.run(nvenc_cmd, check=True)
        return output_path
    except Exception:
        pass
    # Fallback to libx264
    x264_cmd = [
        "ffmpeg","-y","-f","concat","-safe","0","-i",concat_path,
        "-vf", vf,
        "-c:v","libx264","-preset","veryfast","-crf","20",
        "-c:a","aac","-b:a","192k", output_path
    ]
    subprocess.run(x264_cmd, check=True)
    return output_path


def render_matrix(concat_path: str, out_dir: str, presets: List[str]) -> List[Tuple[str,str]]:
    os.makedirs(out_dir, exist_ok=True)
    outputs: List[Tuple[str,str]] = []
    for p in presets:
        out_path = os.path.join(out_dir, f"video_{p}.mp4")
        render_with_fallback(concat_path, out_path, preset=p)
        outputs.append((p, out_path))
    return outputs
