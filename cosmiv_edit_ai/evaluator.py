"""
Evaluator - Analyzes finished edits and scores performance
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
from moviepy.editor import VideoFileClip

try:
    import librosa

    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("Warning: librosa not available. Beat alignment evaluation will be limited.")


class Evaluator:
    """Evaluates video edits using multiple metrics"""

    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.feedback_file = self.data_dir / "feedback.json"
        self.metrics_weights = self.config.get(
            "evaluation_metrics",
            {
                "pacing_consistency": 0.25,
                "beat_alignment": 0.25,
                "clarity": 0.20,
                "subtitle_rhythm": 0.15,
                "trend_adherence": 0.15,
            },
        )

    def evaluate_pacing_consistency(self, video_path: str) -> float:
        """Evaluate pacing consistency (0-100)"""
        try:
            clip = VideoFileClip(video_path)
            duration = clip.duration

            # Analyze scene lengths (approximate using frame differences)
            # Simplified: check if cuts are evenly spaced
            # In production, would use actual scene detection

            # For now, return a score based on video length consistency
            # Shorter videos (< 60s) with good pacing score higher
            if duration < 60:
                score = 85.0
            elif duration < 120:
                score = 75.0
            else:
                score = 65.0

            clip.close()
            return min(100.0, max(0.0, score))
        except Exception as e:
            print(f"Pacing evaluation error: {e}")
            return 50.0

    def evaluate_beat_alignment(self, video_path: str) -> float:
        """Evaluate beat alignment (0-100)"""
        if not LIBROSA_AVAILABLE:
            return 50.0  # Neutral score if librosa unavailable

        try:
            # Extract audio
            clip = VideoFileClip(video_path)
            audio_path = str(Path(video_path).parent / "temp_eval_audio.wav")
            clip.audio.write_audiofile(audio_path, verbose=False, logger=None)

            # Detect beats
            y, sr = librosa.load(audio_path, sr=22050)
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beats, sr=sr)

            # Check if beats are regular (good alignment)
            if len(beat_times) < 2:
                score = 50.0
            else:
                intervals = np.diff(beat_times)
                std_dev = np.std(intervals)
                mean_interval = np.mean(intervals)

                # Lower std dev relative to mean = better alignment
                cv = std_dev / mean_interval if mean_interval > 0 else 1.0
                score = max(0.0, 100.0 - (cv * 100))

            clip.close()
            if os.path.exists(audio_path):
                os.remove(audio_path)

            return min(100.0, max(0.0, score))
        except Exception as e:
            print(f"Beat alignment evaluation error: {e}")
            return 50.0

    def evaluate_clarity(self, video_path: str) -> float:
        """Evaluate video clarity (0-100)"""
        try:
            clip = VideoFileClip(video_path)

            # Simplified clarity check
            # In production, would analyze:
            # - Resolution
            # - Motion blur
            # - Focus quality
            # - Color grading consistency

            # For now, return a baseline score
            # Higher resolution = better clarity
            if clip.size[0] >= 1920:
                score = 90.0
            elif clip.size[0] >= 1280:
                score = 75.0
            else:
                score = 60.0

            clip.close()
            return min(100.0, max(0.0, score))
        except Exception as e:
            print(f"Clarity evaluation error: {e}")
            return 50.0

    def evaluate_subtitle_rhythm(self, video_path: str) -> float:
        """Evaluate subtitle timing and rhythm (0-100)"""
        # Placeholder - would need actual subtitle data
        # For now, return a neutral score
        return 70.0

    def evaluate_trend_adherence(self, video_path: str, trends: Dict) -> float:
        """Evaluate adherence to current trends (0-100)"""
        try:
            clip = VideoFileClip(video_path)
            duration = clip.duration

            score = 50.0  # Base score

            # Check if video matches trending patterns
            if trends:
                # Short videos (< 60s) align with Shorts/Reels trend
                if duration < 60 and trends.get("beat_cuts", 0) > 50:
                    score += 20

                # Speed ramps trend
                if trends.get("speed_ramps", 0) > 50:
                    score += 15

                # Zoom trend
                if trends.get("zooms", 0) > 50:
                    score += 15

            clip.close()
            return min(100.0, max(0.0, score))
        except Exception as e:
            print(f"Trend adherence evaluation error: {e}")
            return 50.0

    def evaluate_video(self, video_path: str, trends: Optional[Dict] = None) -> Dict:
        """Main evaluation function - scores video on all metrics"""
        if not os.path.exists(video_path):
            return {"success": False, "error": f"Video not found: {video_path}"}

        print(f"📊 Evaluating video: {video_path}")

        # Run all evaluations
        metrics = {
            "pacing_consistency": self.evaluate_pacing_consistency(video_path),
            "beat_alignment": self.evaluate_beat_alignment(video_path),
            "clarity": self.evaluate_clarity(video_path),
            "subtitle_rhythm": self.evaluate_subtitle_rhythm(video_path),
            "trend_adherence": self.evaluate_trend_adherence(video_path, trends or {}),
        }

        # Calculate weighted overall score
        overall_score = sum(
            metrics[metric] * weight
            for metric, weight in self.metrics_weights.items()
            if metric in metrics
        )

        result = {
            "success": True,
            "video_path": video_path,
            "overall_score": round(overall_score, 2),
            "metrics": metrics,
            "timestamp": datetime.now().isoformat(),
        }

        # Generate improvement suggestions
        suggestions = self._generate_suggestions(metrics, overall_score)
        result["suggestions"] = suggestions

        # Save to feedback file
        self._save_feedback(result)

        return result

    def _generate_suggestions(self, metrics: Dict, overall_score: float) -> List[str]:
        """Generate improvement suggestions based on metrics"""
        suggestions = []

        if metrics.get("pacing_consistency", 0) < 70:
            suggestions.append(
                "Improve pacing consistency - ensure cuts are evenly timed"
            )

        if metrics.get("beat_alignment", 0) < 70:
            suggestions.append(
                "Better align cuts with audio beats for more dynamic feel"
            )

        if metrics.get("clarity", 0) < 70:
            suggestions.append("Enhance video clarity - check resolution and focus")

        if metrics.get("subtitle_rhythm", 0) < 70:
            suggestions.append("Optimize subtitle timing to match video rhythm")

        if metrics.get("trend_adherence", 0) < 70:
            suggestions.append("Increase adherence to current viral trends")

        if overall_score < 70:
            suggestions.append(
                "Overall: Focus on improving lowest-scoring metrics first"
            )

        return suggestions

    def _save_feedback(self, evaluation: Dict):
        """Save evaluation to feedback file"""
        if not self.feedback_file.exists():
            feedback_data = {
                "version": "1.0.0",
                "evaluations": [],
                "improvement_suggestions": [],
                "performance_history": [],
            }
        else:
            with open(self.feedback_file, "r") as f:
                feedback_data = json.load(f)

        # Add evaluation
        feedback_data["evaluations"].append(evaluation)

        # Keep only last 100 evaluations
        if len(feedback_data["evaluations"]) > 100:
            feedback_data["evaluations"] = feedback_data["evaluations"][-100:]

        # Add to performance history
        feedback_data["performance_history"].append(
            {
                "timestamp": evaluation["timestamp"],
                "overall_score": evaluation["overall_score"],
            }
        )

        # Keep only last 1000 history entries
        if len(feedback_data["performance_history"]) > 1000:
            feedback_data["performance_history"] = feedback_data["performance_history"][
                -1000:
            ]

        # Aggregate improvement suggestions
        all_suggestions = evaluation.get("suggestions", [])
        for suggestion in all_suggestions:
            if suggestion not in feedback_data["improvement_suggestions"]:
                feedback_data["improvement_suggestions"].append(suggestion)

        with open(self.feedback_file, "w") as f:
            json.dump(feedback_data, f, indent=2)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: evaluator.py <video_path>")
        sys.exit(1)

    evaluator = Evaluator()
    result = evaluator.evaluate_video(sys.argv[1])
    print(json.dumps(result, indent=2))
