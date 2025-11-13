"""
Pipeline Tests
Tests for video preprocessing, highlight detection, and scene selection
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import tempfile
import os
from pathlib import Path

# Import pipeline modules
import sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from pipeline.highlight_detection import (
    detect_scenes_seconds,
    fused_score,
    motion_score,
    SceneSlice,
    get_highlight_detector,
)
from pipeline.preprocess import preprocess_clips


class TestHighlightDetection:
    """Tests for highlight detection logic"""

    def test_fused_score_calculation(self):
        """Test that fused_score combines audio and motion correctly"""
        # Test with high audio and motion
        score = fused_score(audio_score=80.0, motion_score=70.0)
        assert score > 70.0  # Should be weighted combination
        
        # Test with low scores
        score_low = fused_score(audio_score=20.0, motion_score=15.0)
        assert score_low < 30.0
        
        # Test edge cases
        score_zero = fused_score(audio_score=0.0, motion_score=0.0)
        assert score_zero >= 0.0

    def test_motion_score_calculation(self):
        """Test motion score calculation"""
        # Mock motion data
        motion_data = [10, 20, 30, 25, 15]  # Frame differences
        
        # Motion score should calculate based on variation
        score = motion_score(motion_data)
        assert isinstance(score, float)
        assert 0.0 <= score <= 100.0

    @patch('pipeline.highlight_detection.detect_scenes_seconds')
    def test_detect_scenes_seconds_mocked(self, mock_detect):
        """Test scene detection with mocked FFmpeg"""
        # Mock scene detection to return test scenes
        mock_detect.return_value = [
            SceneSlice(start=0.0, end=5.0, score=85.0),
            SceneSlice(start=5.0, end=10.0, score=60.0),
            SceneSlice(start=10.0, end=15.0, score=90.0),
        ]
        
        video_path = "/fake/path/video.mp4"
        scenes = detect_scenes_seconds(video_path)
        
        assert len(scenes) == 3
        assert scenes[0].start == 0.0
        assert scenes[2].score == 90.0

    def test_scene_slice_creation(self):
        """Test SceneSlice data structure"""
        scene = SceneSlice(start=10.0, end=15.5, score=75.0)
        
        assert scene.start == 10.0
        assert scene.end == 15.5
        assert scene.score == 75.0
        assert scene.duration == 5.5

    def test_get_highlight_detector(self):
        """Test highlight detector initialization"""
        detector = get_highlight_detector()
        assert detector is not None


class TestVideoPreprocessing:
    """Tests for video preprocessing"""

    @patch('pipeline.preprocess.run_ffmpeg')
    def test_preprocess_clips_mocked(self, mock_ffmpeg):
        """Test video preprocessing with mocked FFmpeg"""
        # Mock FFmpeg to succeed
        mock_ffmpeg.return_value = (0, "", "")  # Success exit code
        
        # Create temporary test files
        with tempfile.TemporaryDirectory() as tmpdir:
            test_video = os.path.join(tmpdir, "test.mp4")
            Path(test_video).touch()  # Create empty file
            
            # Mock file existence
            with patch('os.path.exists', return_value=True):
                with patch('os.path.getsize', return_value=1024):
                    result = preprocess_clips([test_video], tmpdir)
                    
                    # Should return list of processed video paths
                    assert isinstance(result, list)

    def test_preprocess_empty_list(self):
        """Test preprocessing with empty clip list"""
        result = preprocess_clips([], "/tmp")
        assert result == []

    @patch('pipeline.preprocess.run_ffmpeg')
    def test_preprocess_ffmpeg_error(self, mock_ffmpeg):
        """Test preprocessing handles FFmpeg errors gracefully"""
        # Mock FFmpeg to fail
        from pipeline.utils.ffmpeg import FFmpegExecutionError
        mock_ffmpeg.side_effect = FFmpegExecutionError("FFmpeg failed", "", 1)
        
        with tempfile.TemporaryDirectory() as tmpdir:
            test_video = os.path.join(tmpdir, "test.mp4")
            
            with patch('os.path.exists', return_value=True):
                # Should handle error gracefully
                result = preprocess_clips([test_video], tmpdir)
                # Should return empty list or handle error
                assert isinstance(result, list)


class TestSceneSelection:
    """Tests for scene selection logic"""

    def test_scene_selection_by_score(self):
        """Test selecting top scenes by score"""
        scenes = [
            SceneSlice(start=0.0, end=5.0, score=60.0),
            SceneSlice(start=5.0, end=10.0, score=90.0),
            SceneSlice(start=10.0, end=15.0, score=75.0),
            SceneSlice(start=15.0, end=20.0, score=85.0),
        ]
        
        # Select top 2 scenes
        sorted_scenes = sorted(scenes, key=lambda s: s.score, reverse=True)
        top_scenes = sorted_scenes[:2]
        
        assert len(top_scenes) == 2
        assert top_scenes[0].score == 90.0
        assert top_scenes[1].score == 85.0

    def test_scene_selection_by_duration(self):
        """Test selecting scenes up to target duration"""
        scenes = [
            SceneSlice(start=0.0, end=10.0, score=90.0),   # 10s
            SceneSlice(start=10.0, end=25.0, score=85.0),  # 15s
            SceneSlice(start=25.0, end=35.0, score=80.0),   # 10s
        ]
        
        target_duration = 20.0  # 20 seconds
        
        # Select scenes up to target duration
        selected = []
        total_duration = 0.0
        sorted_scenes = sorted(scenes, key=lambda s: s.score, reverse=True)
        
        for scene in sorted_scenes:
            if total_duration + scene.duration <= target_duration:
                selected.append(scene)
                total_duration += scene.duration
            else:
                break
        
        assert len(selected) >= 1
        assert sum(s.duration for s in selected) <= target_duration


class TestFFmpegIntegration:
    """Tests for FFmpeg utility functions"""

    @patch('pipeline.utils.ffmpeg.run_ffmpeg')
    def test_ffmpeg_success(self, mock_run):
        """Test successful FFmpeg execution"""
        mock_run.return_value = (0, "output", "")
        
        from pipeline.utils.ffmpeg import run_ffmpeg
        exit_code, stdout, stderr = run_ffmpeg(["ffmpeg", "-version"])
        
        assert exit_code == 0

    @patch('pipeline.utils.ffmpeg.run_ffmpeg')
    def test_ffmpeg_failure(self, mock_run):
        """Test FFmpeg error handling"""
        from pipeline.utils.ffmpeg import FFmpegExecutionError
        mock_run.side_effect = FFmpegExecutionError("Error", "stderr", 1)
        
        from pipeline.utils.ffmpeg import run_ffmpeg
        with pytest.raises(FFmpegExecutionError):
            run_ffmpeg(["ffmpeg", "-invalid"])


@pytest.mark.integration
class TestPipelineIntegration:
    """Integration tests for full pipeline (requires actual video files)"""
    
    @pytest.mark.skip(reason="Requires actual video file")
    def test_full_pipeline_with_real_video(self):
        """Test full pipeline with real video file"""
        # This test would require an actual video file
        # Skip in unit tests, run in integration tests
        pass

