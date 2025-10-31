import cv2
import math
from typing import List, Tuple
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector


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
