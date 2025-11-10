import os
import subprocess
import zipfile
import tempfile
import shutil
from pathlib import Path
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector
from typing import List
import re
from dataclasses import dataclass


def find_video_files(directory: str):
    """Find all video files in a directory."""
    video_extensions = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
    video_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if Path(file).suffix.lower() in video_extensions:
                video_files.append(os.path.join(root, file))
    return sorted(video_files)


@dataclass
class SceneCandidate:
    video_path: str
    start_seconds: float
    duration_seconds: float
    score: float


def detect_scenes_seconds(video_path: str):
    """Return list of (start_seconds, end_seconds) scenes for a video."""
    vm = VideoManager([video_path])
    sm = SceneManager()
    sm.add_detector(ContentDetector(threshold=30.0))
    vm.set_downscale_factor()
    vm.start()
    sm.detect_scenes(frame_source=vm)
    scene_list = sm.get_scene_list()
    vm.release()
    results = []
    for start_time, end_time in scene_list:
        results.append((start_time.get_seconds(), end_time.get_seconds()))
    # Fallback: if no scenes, use a single 30s window from start (will trim later)
    if not results:
        results.append((0.0, 30.0))
    return results


def measure_audio_mean_db(video_path: str, start_seconds: float, duration_seconds: float) -> float:
    """Use ffmpeg volumedetect to get mean_volume (dB) for a segment."""
    cmd = [
        "ffmpeg",
        "-ss",
        str(max(0.0, start_seconds)),
        "-t",
        str(max(0.1, duration_seconds)),
        "-i",
        video_path,
        "-af",
        "volumedetect",
        "-f",
        "null",
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    stderr = proc.stderr or ""
    match = re.search(r"mean_volume:\s*([\-\d\.]+) dB", stderr)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    # Default quiet value
    return -30.0


def build_top_scenes_across_files(video_files: List[str], target_duration: int) -> List[SceneCandidate]:
    candidates: List[SceneCandidate] = []
    # Collect scene candidates with audio-based scores
    for vp in video_files:
        scenes = detect_scenes_seconds(vp)
        for s, e in scenes:
            dur = max(0.1, e - s)
            # For long scenes, sample up to first 15s for speed
            sample_dur = min(dur, 15.0)
            mean_db = measure_audio_mean_db(vp, s, sample_dur)
            # Convert dB to a positive score (higher louder)
            # Reference -30 dB as 0, -5 dB as high
            score = max(0.0, 30.0 + mean_db)
            candidates.append(SceneCandidate(vp, s, dur, score))

    # Sort by score desc
    candidates.sort(key=lambda c: c.score, reverse=True)

    # Select top scenes until target_duration
    selected: List[SceneCandidate] = []
    total = 0.0
    for c in candidates:
        if total >= target_duration:
            break
        take = min(c.duration_seconds, target_duration - total)
        selected.append(SceneCandidate(c.video_path, c.start_seconds, take, c.score))
        total += take
    return selected


def write_ffconcat(workdir: str, selected: List[SceneCandidate]) -> str:
    concat_file = os.path.join(workdir, "concat_list.txt")
    with open(concat_file, "w") as f:
        f.write("ffconcat version 1.0\n\n")
        for c in selected:
            escaped_path = c.video_path.replace("'", "'\\''")
            f.write(f"file '{escaped_path}'\n")
            f.write(f"inpoint {c.start_seconds}\n")
            f.write(f"duration {c.duration_seconds}\n\n")
    return concat_file


# Update ZIP flow to reuse multi-file pipeline
def process_zip_highlight(zip_path: str, target_duration: int, workdir: str = None):
    if workdir is None:
        workdir = tempfile.mkdtemp(prefix="cosmiv_")
    try:
        extract_dir = os.path.join(workdir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)
        video_files = find_video_files(extract_dir)
        if not video_files:
            raise ValueError("No video files found in ZIP")
        return process_clips_highlight(video_files, target_duration, workdir)
    except Exception as e:
        if os.path.exists(workdir):
            shutil.rmtree(workdir, ignore_errors=True)
        raise e


# Replace clips flow to use multi-file + audio scoring
def process_clips_highlight(video_files: List[str], target_duration: int, workdir: str) -> str:
    if not video_files:
        raise ValueError("No video files provided")

    output_path = os.path.join(workdir, "highlight.mp4")

    selected = build_top_scenes_across_files(video_files, target_duration)
    concat_file = write_ffconcat(workdir, selected)

    cmd = [
        "ffmpeg",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concat_file,
        "-c",
        "copy",
        "-y",
        output_path,
    ]
    subprocess.run(cmd, check=True, capture_output=True)

    final_output = os.path.join(workdir, "final_highlight.mp4")
    shutil.move(output_path, final_output)
    return final_output
