"""
Editing Agent - Automates video editing based on learned rules
Supports DaVinci Resolve (local) and MoviePy/FFmpeg (headless)
"""

import json
import os
import logging
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from datetime import datetime
import subprocess
import tempfile

logger = logging.getLogger(__name__)

try:
    from moviepy.editor import VideoFileClip, CompositeVideoClip, TextClip, concatenate_videoclips
    from moviepy.video.fx import fadein, fadeout
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    logger.warning("MoviePy not available, headless editing will be limited")


class EditingAgent:
    """Automates video editing based on learned rules and trends"""
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "core" / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.editing_config = self.config.get("editing", {})
        self.preferred_editor = self.config.get("training", {}).get("preferred_editor", "davinci")
        self.data_dir = Path(__file__).parent / "data"
        self.renders_dir = Path(__file__).parent / "renders"
        self.renders_dir.mkdir(parents=True, exist_ok=True)
        
        # Load rules and patterns
        self.rules_file = self.data_dir / "editing_rules.json"
        self.patterns_file = self.data_dir / "trend_patterns.json"
    
    def _load_rules(self) -> Dict[str, Any]:
        """Load editing rules"""
        if not self.rules_file.exists():
            return {"rules": []}
        
        with open(self.rules_file, "r") as f:
            return json.load(f)
    
    def _load_patterns(self) -> Dict[str, Any]:
        """Load trend patterns"""
        if not self.patterns_file.exists():
            return {"meta_summary": {}}
        
        with open(self.patterns_file, "r") as f:
            return json.load(f)
    
    def _get_editing_plan(self, video_path: str, edit_style: str = "default") -> Dict[str, Any]:
        """
        Generate editing plan based on rules and style
        
        Args:
            video_path: Path to input video
            edit_style: Style preference (fast, medium, slow, viral)
            
        Returns:
            Editing plan dictionary
        """
        rules = self._load_rules()
        patterns = self._load_patterns()
        
        # Extract relevant rules for style
        relevant_rules = []
        for rule_set in rules.get("rules", []):
            rule_data = rule_set.get("rules", {})
            pace = rule_data.get("pace", "medium")
            
            if edit_style == "viral" or edit_style == "fast":
                if pace in ["fast", "viral"]:
                    relevant_rules.append(rule_data)
            elif edit_style == "medium":
                if pace in ["medium", "fast"]:
                    relevant_rules.append(rule_data)
            else:
                relevant_rules.append(rule_data)
        
        # Get current meta
        meta = patterns.get("meta_summary", {})
        
        # Build editing plan
        plan = {
            "style": edit_style,
            "pace": self.editing_config.get("default_pace", "fast"),
            "subtitle_enabled": self.editing_config.get("subtitle_enabled", True),
            "color_grade_enabled": self.editing_config.get("color_grade_enabled", True),
            "transition_style": self.editing_config.get("transition_style", "modern"),
            "beat_sync_enabled": self.editing_config.get("beat_sync_enabled", True),
            "rules_applied": relevant_rules[:3],  # Top 3 most relevant
            "meta_insights": meta,
            "cut_rhythm": "fast" if edit_style in ["fast", "viral"] else "medium"
        }
        
        return plan
    
    def _edit_with_moviepy(self, video_path: str, plan: Dict[str, Any], output_path: str) -> str:
        """
        Edit video using MoviePy (headless)
        
        Args:
            video_path: Input video path
            plan: Editing plan
            output_path: Output video path
            
        Returns:
            Path to edited video
        """
        if not MOVIEPY_AVAILABLE:
            raise RuntimeError("MoviePy not available")
        
        try:
            # Load video
            clip = VideoFileClip(video_path)
            
            # Apply cuts based on pace
            if plan["cut_rhythm"] == "fast":
                # Fast cuts: trim to shorter segments
                segment_duration = min(3.0, clip.duration / 5)  # 3 second segments or divide by 5
                segments = []
                current_time = 0
                
                while current_time < clip.duration:
                    end_time = min(current_time + segment_duration, clip.duration)
                    segment = clip.subclip(current_time, end_time)
                    # Add fade transitions
                    if current_time > 0:
                        segment = fadein(segment, 0.2)
                    if end_time < clip.duration:
                        segment = fadeout(segment, 0.2)
                    segments.append(segment)
                    current_time = end_time
                
                if segments:
                    final_clip = concatenate_videoclips(segments, method="compose")
                else:
                    final_clip = clip
            else:
                final_clip = clip
            
            # Add subtitles if enabled
            if plan.get("subtitle_enabled"):
                # Simple subtitle overlay (would need transcription in production)
                txt_clip = TextClip(
                    "Edited by Cosmiv AI",
                    fontsize=24,
                    color='white',
                    font='Arial-Bold'
                ).set_position(('center', 'bottom')).set_duration(min(2, final_clip.duration))
                
                final_clip = CompositeVideoClip([final_clip, txt_clip])
            
            # Write output
            final_clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                fps=24,
                preset='medium'
            )
            
            # Cleanup
            final_clip.close()
            clip.close()
            
            return output_path
        except Exception as e:
            logger.error(f"Error editing with MoviePy: {e}")
            raise
    
    def _edit_with_davinci(self, video_path: str, plan: Dict[str, Any], output_path: str) -> str:
        """
        Edit video using DaVinci Resolve (requires Resolve API)
        
        Args:
            video_path: Input video path
            plan: Editing plan
            output_path: Output video path
            
        Returns:
            Path to edited video
        """
        # DaVinci Resolve Python API integration
        # This would require DaVinci Resolve to be installed and configured
        logger.warning("DaVinci Resolve editing not fully implemented")
        logger.info(f"Would edit {video_path} with plan: {plan}")
        
        # For now, fallback to MoviePy or return original
        if MOVIEPY_AVAILABLE:
            return self._edit_with_moviepy(video_path, plan, output_path)
        else:
            # Just copy the file as fallback
            import shutil
            shutil.copy(video_path, output_path)
            return output_path
    
    def edit_video(self, video_path: str, edit_style: str = "default", output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Main method to edit a video
        
        Args:
            video_path: Path to input video
            edit_style: Editing style (fast, medium, slow, viral)
            output_path: Optional output path (auto-generated if not provided)
            
        Returns:
            Dictionary with output path and metadata
        """
        logger.info(f"Editing video: {video_path} with style: {edit_style}")
        
        # Generate editing plan
        plan = self._get_editing_plan(video_path, edit_style)
        
        # Generate output path if not provided
        if not output_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"edited_{timestamp}_{edit_style}.mp4"
            output_path = str(self.renders_dir / output_filename)
        
        # Edit based on preferred editor
        if self.preferred_editor == "davinci":
            try:
                edited_path = self._edit_with_davinci(video_path, plan, output_path)
            except Exception as e:
                logger.warning(f"DaVinci editing failed: {e}, falling back to MoviePy")
                edited_path = self._edit_with_moviepy(video_path, plan, output_path)
        else:
            edited_path = self._edit_with_moviepy(video_path, plan, output_path)
        
        # Save metadata
        metadata = {
            "input_path": video_path,
            "output_path": edited_path,
            "edit_style": edit_style,
            "plan": plan,
            "editor_used": self.preferred_editor,
            "rendered_at": datetime.now().isoformat(),
            "version": self._load_rules().get("version", 1)
        }
        
        metadata_file = output_path.replace(".mp4", "_metadata.json")
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Video edited successfully: {edited_path}")
        return {
            "output_path": edited_path,
            "metadata": metadata
        }
