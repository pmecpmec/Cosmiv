import logging
import re
from dataclasses import dataclass
from typing import List, Protocol, Sequence, Tuple

import cv2
from scenedetect import SceneManager, VideoManager
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
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_MSEC, start * 1000.0)
    prev = None
    total = 0.0
    frames = 0
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
            total += float(diff.mean())
            frames += 1
        prev = gray
        cap.set(cv2.CAP_PROP_POS_MSEC, pos + ms_step)
    cap.release()
    if frames == 0:
        return 0.0
    return total / frames


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
