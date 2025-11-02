import logging
import re
import math
import subprocess
from dataclasses import dataclass
from typing import List, Protocol, Sequence, Tuple, Dict

import cv2
import numpy as np
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector

from config import settings
from pipeline.utils.ffmpeg import FFmpegExecutionError, run_ffmpeg

logger = logging.getLogger(__name__)

try:  # Optional model import
    from ml.highlights.model import get_model  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    get_model = None


@dataclass
class SceneSlice:
    video_path: str
    start: float
    end: float
    motion: float
    loudness: float
    score: float

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)


class HighlightDetector(Protocol):
    def detect(self, video_paths: Sequence[str], target_duration: float) -> List[SceneSlice]:
        ...


class HeuristicHighlightDetector:
    motion_weight: float = 1.0
    loudness_weight: float = 0.45
    model_weight: float = 18.0
    model_window: float = 3.0

    def __init__(self, enable_model: bool = False) -> None:
        self._model = get_model() if enable_model and get_model else None

    def detect(self, video_paths: Sequence[str], target_duration: float) -> List[SceneSlice]:
        candidates: List[SceneSlice] = []
        for vp in video_paths:
            events = self._model.detect_events(vp) if self._model else []
            for start, end in detect_scenes_seconds(vp):
                duration = max(0.5, end - start)
                sample = min(duration, 12.0)
                mot = motion_score(vp, start, sample)
                loud = estimate_loudness(vp, start, sample)
                loud_score = max(0.0, 30.0 + loud)
                score = (mot * self.motion_weight) + (loud_score * self.loudness_weight)
                if events:
                    center = start + duration / 2.0
                    bonus = 0.0
                    for ev in events:
                        if abs(ev.get("time", center) - center) <= self.model_window:
                            bonus = max(bonus, ev.get("confidence", 0.0) * self.model_weight)
                    score += bonus
                candidates.append(SceneSlice(vp, start, end, mot, loud, score))

        if not candidates and video_paths:
            logger.debug("No highlight scenes detected, adding fallback slice")
            return [SceneSlice(video_paths[0], 0.0, target_duration, 0.0, -30.0, 0.0)]

        candidates.sort(key=lambda c: c.score, reverse=True)
        selected: List[SceneSlice] = []
        total = 0.0
        for slice_ in candidates:
            if total >= target_duration:
                break
            take = min(slice_.duration, max(1.0, min(4.0, target_duration - total)))
            selected.append(
                SceneSlice(
                    video_path=slice_.video_path,
                    start=slice_.start,
                    end=slice_.start + take,
                    motion=slice_.motion,
                    loudness=slice_.loudness,
                    score=slice_.score,
                )
            )
            total += take

        if not selected and candidates:
            first = candidates[0]
            take = min(target_duration, first.duration)
            selected.append(
                SceneSlice(
                    video_path=first.video_path,
                    start=first.start,
                    end=first.start + take,
                    motion=first.motion,
                    loudness=first.loudness,
                    score=first.score,
                )
            )

        return selected


def get_highlight_detector() -> HighlightDetector:
    detector = settings.HIGHLIGHT_DETECTOR.lower()
    if detector == "heuristic":
        return HeuristicHighlightDetector(enable_model=settings.USE_HIGHLIGHT_MODEL)
    logger.warning("Unknown highlight detector '%s', falling back to heuristic", detector)
    return HeuristicHighlightDetector(enable_model=settings.USE_HIGHLIGHT_MODEL)


def detect_scenes_seconds(video_path: str) -> List[Tuple[float, float]]:
    """
    Detect scene boundaries in video using PySceneDetect.
    
    Returns list of (start_seconds, end_seconds) tuples for each scene.
    Falls back to single 30s scene if no scenes detected.
    """
    vm = VideoManager([video_path])
    sm = SceneManager()
    sm.add_detector(ContentDetector(threshold=30.0))
    vm.set_downscale_factor()
    vm.start()
    sm.detect_scenes(frame_source=vm)
    scene_list = sm.get_scene_list()
    vm.release()
    results = []
    for s, e in scene_list:
        results.append((s.get_seconds(), e.get_seconds()))
    if not results:
        results.append((0.0, 30.0))
    return results


def motion_score(video_path: str, start: float, duration: float, sample_fps: int = 6) -> float:
    """
    Calculate motion intensity score for a video segment.
    
    Uses frame differencing to measure average pixel changes.
    Higher scores indicate more motion/action.
    
    Args:
        video_path: Path to video file
        start: Start time in seconds
        duration: Duration to analyze in seconds
        sample_fps: How many frames per second to sample (default 6)
    
    Returns:
        Average motion score (0.0 if no frames processed)
    """
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_MSEC, start * 1000.0)
    prev = None
    motion_values = []
    ms_step = 1000.0 / sample_fps
    
    while True:
        pos = cap.get(cv2.CAP_PROP_POS_MSEC)
        if pos - start * 1000.0 > duration * 1000.0:
            break
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev is not None:
            diff = cv2.absdiff(gray, prev)
            motion_values.append(float(diff.mean()))
        prev = gray
        cap.set(cv2.CAP_PROP_POS_MSEC, pos + ms_step)
    
    cap.release()
    
    if not motion_values:
        return 0.0
    
    # Use median to reduce impact of outliers (more robust than mean)
    return float(np.median(motion_values))


def estimate_loudness(video_path: str, start: float, duration: float) -> float:
    """Return mean loudness (dB) for a clip window."""
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        str(max(0.0, start)),
        "-t",
        str(max(0.1, duration)),
        "-i",
        video_path,
        "-af",
        "volumedetect",
        "-f",
        "null",
        "-",
    ]
    try:
        proc = run_ffmpeg(cmd)
    except FFmpegExecutionError as exc:
        logger.debug("volumedetect failed for %s: %s", video_path, exc)
        return -30.0

    stderr = proc.stderr or ""
    match = re.search(r"mean_volume:\s*([\-\d\.]+) dB", stderr)
    if not match:
        return -30.0
    try:
        return float(match.group(1))
    except ValueError:
        return -30.0


def audio_energy_score(video_path: str, start: float, duration: float) -> float:
    """
    Calculate audio energy score using FFmpeg volumedetect.
    
    Analyzes mean volume, dynamic range, and peak energy.
    Higher scores indicate more engaging audio (louder, more dynamic).
    
    Args:
        video_path: Path to video file
        start: Start time in seconds
        duration: Duration to analyze in seconds
    
    Returns:
        Normalized audio energy score (0-100)
    """
    try:
        cmd = [
            "ffmpeg",
            "-ss", str(max(0.0, start)),
            "-t", str(max(0.1, duration)),
            "-i", video_path,
            "-af", "volumedetect",
            "-f", "null",
            "-",
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        stderr = proc.stderr or ""
        
        # Extract volume metrics
        mean_match = re.search(r"mean_volume:\s*([-\d\.]+)\s*dB", stderr)
        peak_match = re.search(r"max_volume:\s*([-\d\.]+)\s*dB", stderr)
        
        if mean_match and peak_match:
            mean_db = float(mean_match.group(1))
            peak_db = float(peak_match.group(1))
            
            # Normalize to 0-100 scale
            # Reference: -30 dB is quiet, -5 dB is loud
            # Dynamic range bonus: more variation = more interesting
            mean_score = max(0, min(100, 30 + mean_db))
            dynamic_score = (peak_db - mean_db) / 3  # bonus for dynamic range
            return float(mean_score + dynamic_score)
    except Exception:
        pass
    
    return 30.0  # Default moderate score


def temporal_consistency_score(video_path: str, start: float, duration: float) -> float:
    """
    Calculate temporal consistency score for action continuity.
    
    Prefers segments with sustained action over sporadic bursts.
    This helps avoid jarring cuts mid-action.
    
    Args:
        video_path: Path to video file
        start: Start time in seconds
        duration: Duration to analyze in seconds
    
    Returns:
        Consistency score (0-100)
    """
    try:
        # Sample motion at multiple points
        sample_points = max(3, int(duration * 2))  # 2 samples per second
        sample_duration = duration / sample_points
        
        motion_scores = []
        for i in range(sample_points):
            offset = i * sample_duration
            score = motion_score(video_path, start + offset, sample_duration, sample_fps=3)
            motion_scores.append(score)
        
        if not motion_scores:
            return 50.0
        
        # Variance: lower variance = more consistent
        variance = float(np.var(motion_scores))
        
        # Mean: prefer decent motion overall
        mean_motion = float(np.mean(motion_scores))
        
        # Combine: consistency bonus for lower variance, baseline for mean motion
        consistency_bonus = max(0, 100 - variance * 10)  # Penalty for high variance
        motion_baseline = min(100, mean_motion / 5)  # Scale motion to 0-100
        
        return (consistency_bonus * 0.6 + motion_baseline * 0.4)
    except Exception:
        return 50.0  # Default moderate score


def fused_score(video_path: str, start: float, duration: float) -> Dict[str, float]:
    """
    Compute multi-signal fused score for highlight quality.
    
    Combines motion, audio, and temporal consistency with learned weights.
    Returns both individual scores and final fused score.
    
    Args:
        video_path: Path to video file
        start: Start time in seconds
        duration: Duration to analyze in seconds
    
    Returns:
        Dictionary with individual scores and fused_score
    """
    # Get individual scores
    motion = motion_score(video_path, start, duration)
    audio = audio_energy_score(video_path, start, duration)
    temporal = temporal_consistency_score(video_path, start, duration)
    
    # Learned weights (can be tuned based on empirical testing)
    weights = {
        "motion": 0.40,    # Primary signal for gaming highlights
        "audio": 0.35,      # Important for engagement
        "temporal": 0.25,   # Ensures smoothness
    }
    
    # Normalize motion to 0-100 range (typical values are 0-50)
    motion_normalized = min(100, motion * 2)
    
    # Fused score
    fused = (
        motion_normalized * weights["motion"] +
        audio * weights["audio"] +
        temporal * weights["temporal"]
    )
    
    return {
        "motion": motion_normalized,
        "audio": audio,
        "temporal": temporal,
        "fused_score": fused,
    }
