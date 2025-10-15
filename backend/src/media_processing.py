import os
import subprocess
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector

def process_zip_highlight(zip_path: str, target_duration: int):
    # Extract ZIP -> find video files
    # For simplicity, assume a single MP4 in zip
    video_path = "/tmp/input.mp4"
    output_path = "/tmp/highlight.mp4"

    # Detect scenes
    video_manager = VideoManager([video_path])
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=30.0))
    video_manager.set_downscale_factor()
    video_manager.start()
    scene_manager.detect_scenes(frame_source=video_manager)
    scene_list = scene_manager.get_scene_list()

    # Pick clips to match target_duration
    # For MVP, just pick first scenes until duration met
    clips_to_concat = []
    # ... build ffmpeg concat command ...

    subprocess.run(["ffmpeg", "-i", video_path, "-t", str(target_duration), output_path])
    return output_path
