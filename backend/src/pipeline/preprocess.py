import os
from typing import List

from pipeline.utils.ffmpeg import run_ffmpeg

FFMPEG = "ffmpeg"


def normalize_clip(input_path: str, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = [
        FFMPEG,
        "-y",
        "-i",
        input_path,
        "-vf",
        "scale=1920:-1:flags=lanczos,fps=30",
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
    run_ffmpeg(cmd)
    return output_path


def preprocess_clips(input_files: List[str], workdir: str) -> List[str]:
    processed = []
    out_dir = os.path.join(workdir, "preprocessed")
    os.makedirs(out_dir, exist_ok=True)
    for idx, f in enumerate(input_files):
        base = os.path.splitext(os.path.basename(f))[0]
        out_path = os.path.join(out_dir, f"{idx:03d}_{base}.mp4")
        normalize_clip(f, out_path)
        processed.append(out_path)
    return processed
