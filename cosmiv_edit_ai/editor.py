"""
Editing Agent - Automates video editing using DaVinci Resolve or MoviePy/FFmpeg
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List
import numpy as np
from moviepy.editor import (
    VideoFileClip,
    CompositeVideoClip,
    TextClip,
    concatenate_videoclips,
)
from moviepy.video.fx import resize, speedx, fadein, fadeout

try:
    import librosa

    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("Warning: librosa not available. Beat detection will be disabled.")


class Editor:
    """Automates video editing based on rules and meta patterns"""

    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.renders_dir = Path(self.config.get("renders_dir", "renders"))
        self.rules_file = self.data_dir / "editing_rules.json"
        self.trends_file = self.data_dir / "trend_patterns.json"
        self.preferred_editor = self.config.get("preferred_editor", "davinci")

        self.renders_dir.mkdir(parents=True, exist_ok=True)

        # Check for DaVinci Resolve
        self.davinci_available = self._check_davinci_resolve()

    def _check_davinci_resolve(self) -> bool:
        """Check if DaVinci Resolve Python API is available"""
        try:
            import DaVinciResolveScript as dvr_script

            return True
        except ImportError:
            return False

    def load_rules(self) -> Dict:
        """Load editing rules"""
        if not self.rules_file.exists():
            return {}

        with open(self.rules_file, "r") as f:
            return json.load(f)

    def load_trends(self) -> Dict:
        """Load current trend patterns"""
        if not self.trends_file.exists():
            return {}

        with open(self.trends_file, "r") as f:
            trends_data = json.load(f)
            return (
                trends_data.get("trends", {})
                .get("youtube_shorts", {})
                .get("trending_patterns", {})
            )

    def detect_beats(self, audio_path: str) -> List[float]:
        """Detect beat timestamps in audio"""
        if not LIBROSA_AVAILABLE:
            return []

        try:
            y, sr = librosa.load(audio_path, sr=22050)
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beats, sr=sr)
            return beat_times.tolist()
        except Exception as e:
            print(f"Beat detection error: {e}")
            return []

    def apply_edits_moviepy(
        self, input_video: str, output_path: str, rules: Dict, trends: Dict
    ) -> Dict:
        """Apply edits using MoviePy and FFmpeg"""
        print(f"🎬 Editing video with MoviePy: {input_video}")

        try:
            clip = VideoFileClip(input_video)
            rules_data = rules.get("rules", {})
            meta_patterns = rules.get("meta_patterns", {})

            edited_clips = []
            current_time = 0

            # Extract audio for beat detection
            audio_path = str(Path(output_path).parent / "temp_audio.wav")
            clip.audio.write_audiofile(audio_path, verbose=False, logger=None)
            beats = self.detect_beats(audio_path)

            # Apply cut timing rules
            cut_timing = rules_data.get("cut_timing", {})
            fast_cut = cut_timing.get("fast_cut_threshold", 0.5)
            beat_sync = cut_timing.get("beat_sync", True)

            # Determine cut points
            if beat_sync and beats:
                cut_points = beats[: int(clip.duration / fast_cut)]
            else:
                # Regular interval cuts
                cut_points = np.arange(0, clip.duration, fast_cut)

            # Create clips with cuts
            for i, cut_time in enumerate(cut_points[:-1]):
                if cut_time >= clip.duration:
                    break

                end_time = min(cut_points[i + 1], clip.duration)
                subclip = clip.subclip(cut_time, end_time)

                # Apply transitions
                transitions = rules_data.get("transitions", {})
                transition_type = self._choose_transition(transitions, i)

                if transition_type == "fade":
                    subclip = fadein(subclip, 0.2)
                    subclip = fadeout(subclip, 0.2)
                elif (
                    transition_type == "zoom"
                    and meta_patterns.get("zooms") == "frequent"
                ):
                    zoom_factor = 1.2
                    subclip = resize(subclip, zoom_factor)

                # Apply speed ramps if enabled
                if meta_patterns.get("speed_ramps") == "moderate":
                    if i % 3 == 0:  # Every 3rd clip
                        subclip = speedx(subclip, 1.2)

                edited_clips.append(subclip)

            # Concatenate all clips
            final_clip = concatenate_videoclips(edited_clips, method="compose")

            # Add subtitles if enabled
            if meta_patterns.get("subtitles") == "always":
                text_styles = rules_data.get("text_styles", {})
                final_clip = self._add_subtitles(final_clip, text_styles)

            # Write final video
            final_clip.write_videofile(
                output_path,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile=str(Path(output_path).parent / "temp_audio.m4a"),
                remove_temp=True,
                verbose=False,
                logger=None,
            )

            # Cleanup
            clip.close()
            final_clip.close()
            if os.path.exists(audio_path):
                os.remove(audio_path)

            return {
                "success": True,
                "output_path": output_path,
                "duration": final_clip.duration,
                "rule_version": rules.get("version", "unknown"),
            }
        except Exception as e:
            print(f"Editing error: {e}")
            return {"success": False, "error": str(e)}

    def _choose_transition(self, transitions: Dict, clip_index: int) -> str:
        """Choose transition type based on probabilities"""
        if not transitions:
            return "cut"

        # Normalize probabilities
        total = sum(transitions.values())
        if total == 0:
            return "cut"

        normalized = {k: v / total for k, v in transitions.items()}

        # Weighted random choice
        rand = np.random.random()
        cumulative = 0
        for trans_type, prob in normalized.items():
            cumulative += prob
            if rand <= cumulative:
                return trans_type

        return "cut"

    def _add_subtitles(self, clip, text_styles: Dict):
        """Add subtitles to video"""
        # Simplified subtitle implementation
        # In production, would use actual transcription + timing
        subtitle_duration = text_styles.get("subtitle_duration", 1.5)
        font_size = text_styles.get("font_size", 48)
        position = text_styles.get("subtitle_position", "bottom")

        # Placeholder: would need actual text and timing
        # For now, return clip as-is
        return clip

    def apply_edits_davinci(
        self, input_video: str, output_path: str, rules: Dict, trends: Dict
    ) -> Dict:
        """Apply edits using DaVinci Resolve Python API"""
        if not self.davinci_available:
            print("DaVinci Resolve not available, falling back to MoviePy")
            return self.apply_edits_moviepy(input_video, output_path, rules, trends)

        try:
            import DaVinciResolveScript as dvr_script

            resolve = dvr_script.scriptapp("Resolve")
            project_manager = resolve.GetProjectManager()
            project = project_manager.GetCurrentProject()

            if not project:
                project = project_manager.CreateProject("CosmivEditAI")

            media_pool = project.GetMediaPool()
            timeline = project.GetCurrentTimeline()

            if not timeline:
                timeline = media_pool.CreateEmptyTimeline("AutoEdit")

            # Import video
            media_pool.ImportMedia([input_video])

            # Apply edits based on rules
            # (DaVinci Resolve API implementation would go here)
            # This is a placeholder - full implementation would require
            # extensive DaVinci Resolve API knowledge

            print(
                "DaVinci Resolve editing not fully implemented - using MoviePy fallback"
            )
            return self.apply_edits_moviepy(input_video, output_path, rules, trends)

        except Exception as e:
            print(f"DaVinci Resolve error: {e}, falling back to MoviePy")
            return self.apply_edits_moviepy(input_video, output_path, rules, trends)

    def edit_video(self, input_video: str, output_name: Optional[str] = None) -> Dict:
        """Main editing function"""
        if not os.path.exists(input_video):
            return {"success": False, "error": f"Input video not found: {input_video}"}

        rules = self.load_rules()
        trends = self.load_trends()

        if not output_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"edit_{timestamp}.mp4"

        output_path = self.renders_dir / output_name

        # Choose editor
        if self.preferred_editor == "davinci" and self.davinci_available:
            result = self.apply_edits_davinci(
                input_video, str(output_path), rules, trends
            )
        else:
            result = self.apply_edits_moviepy(
                input_video, str(output_path), rules, trends
            )

        # Log which rule version was used
        result["rule_version"] = rules.get("version", "unknown")
        result["trend_snapshot"] = trends

        return result


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: editor.py <input_video> [output_name]")
        sys.exit(1)

    editor = Editor()
    result = editor.edit_video(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
    print(json.dumps(result, indent=2))
