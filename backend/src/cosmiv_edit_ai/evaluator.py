"""
Evaluator - Rates finished edits on virality score
Evaluates edits based on pace, beat sync, subtitle timing, retention prediction
"""

import json
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


class Evaluator:
    """Evaluates video edits and generates virality scores"""
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "core" / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.eval_config = self.config.get("evaluation", {})
        self.weights = self.eval_config.get("virality_weights", {
            "pace": 0.25,
            "beat_sync": 0.25,
            "subtitle_timing": 0.20,
            "retention_prediction": 0.30
        })
        self.min_score_threshold = self.eval_config.get("min_score_threshold", 60)
        
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.feedback_file = self.data_dir / "feedback.json"
        
        # Initialize feedback file if it doesn't exist
        if not self.feedback_file.exists():
            self._initialize_feedback()
    
    def _initialize_feedback(self):
        """Initialize empty feedback file"""
        initial_feedback = {
            "version": 1,
            "last_updated": datetime.now().isoformat(),
            "evaluations": []
        }
        with open(self.feedback_file, "w") as f:
            json.dump(initial_feedback, f, indent=2)
    
    def _load_feedback(self) -> Dict[str, Any]:
        """Load existing feedback"""
        if not self.feedback_file.exists():
            self._initialize_feedback()
        
        with open(self.feedback_file, "r") as f:
            return json.load(f)
    
    def _save_feedback(self, feedback: Dict[str, Any]):
        """Save feedback to file"""
        feedback["last_updated"] = datetime.now().isoformat()
        with open(self.feedback_file, "w") as f:
            json.dump(feedback, f, indent=2)
    
    def _evaluate_pace(self, metadata: Dict[str, Any]) -> float:
        """
        Evaluate pace alignment (0-100)
        
        Args:
            metadata: Video metadata including editing plan
            
        Returns:
            Pace score (0-100)
        """
        plan = metadata.get("plan", {})
        cut_rhythm = plan.get("cut_rhythm", "medium")
        style = plan.get("style", "default")
        
        # Score based on alignment with viral trends
        if cut_rhythm == "fast" and style in ["fast", "viral"]:
            return 90.0
        elif cut_rhythm == "fast":
            return 75.0
        elif cut_rhythm == "medium":
            return 60.0
        else:
            return 40.0
    
    def _evaluate_beat_sync(self, metadata: Dict[str, Any]) -> float:
        """
        Evaluate beat sync quality (0-100)
        
        Args:
            metadata: Video metadata
            
        Returns:
            Beat sync score (0-100)
        """
        plan = metadata.get("plan", {})
        beat_sync_enabled = plan.get("beat_sync_enabled", False)
        
        if beat_sync_enabled:
            # In production, would analyze actual audio/video sync
            # For now, return a score based on configuration
            return 80.0
        else:
            return 50.0
    
    def _evaluate_subtitle_timing(self, metadata: Dict[str, Any]) -> float:
        """
        Evaluate subtitle timing (0-100)
        
        Args:
            metadata: Video metadata
            
        Returns:
            Subtitle timing score (0-100)
        """
        plan = metadata.get("plan", {})
        subtitle_enabled = plan.get("subtitle_enabled", False)
        
        if subtitle_enabled:
            # In production, would analyze subtitle placement and timing
            # For now, return a score based on configuration
            return 75.0
        else:
            return 30.0
    
    def _evaluate_retention_prediction(self, metadata: Dict[str, Any]) -> float:
        """
        Predict viewer retention (0-100)
        
        Args:
            metadata: Video metadata
            
        Returns:
            Retention prediction score (0-100)
        """
        plan = metadata.get("plan", {})
        
        # Factors that affect retention:
        # - Fast pace (keeps attention)
        # - Subtitle presence (helps retention)
        # - Modern transitions (engaging)
        # - Beat sync (rhythmic engagement)
        
        score = 50.0  # Base score
        
        if plan.get("cut_rhythm") == "fast":
            score += 20.0
        if plan.get("subtitle_enabled"):
            score += 15.0
        if plan.get("transition_style") == "modern":
            score += 10.0
        if plan.get("beat_sync_enabled"):
            score += 5.0
        
        return min(100.0, score)
    
    def evaluate(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a video edit and generate virality score
        
        Args:
            metadata: Video editing metadata
            
        Returns:
            Evaluation results with scores and feedback
        """
        logger.info(f"Evaluating edit: {metadata.get('output_path', 'unknown')}")
        
        # Calculate individual scores
        pace_score = self._evaluate_pace(metadata)
        beat_sync_score = self._evaluate_beat_sync(metadata)
        subtitle_score = self._evaluate_subtitle_timing(metadata)
        retention_score = self._evaluate_retention_prediction(metadata)
        
        # Calculate weighted total score
        total_score = (
            pace_score * self.weights.get("pace", 0.25) +
            beat_sync_score * self.weights.get("beat_sync", 0.25) +
            subtitle_score * self.weights.get("subtitle_timing", 0.20) +
            retention_score * self.weights.get("retention_prediction", 0.30)
        )
        
        # Generate feedback
        feedback_items = []
        if pace_score < 70:
            feedback_items.append("Consider faster cuts for better engagement")
        if beat_sync_score < 70:
            feedback_items.append("Improve beat synchronization")
        if subtitle_score < 70:
            feedback_items.append("Add or improve subtitle timing")
        if retention_score < 70:
            feedback_items.append("Focus on retention-optimizing techniques")
        
        evaluation = {
            "output_path": metadata.get("output_path"),
            "edit_style": metadata.get("edit_style"),
            "scores": {
                "pace": round(pace_score, 2),
                "beat_sync": round(beat_sync_score, 2),
                "subtitle_timing": round(subtitle_score, 2),
                "retention_prediction": round(retention_score, 2),
                "total": round(total_score, 2)
            },
            "weights": self.weights,
            "feedback": feedback_items,
            "meets_threshold": total_score >= self.min_score_threshold,
            "evaluated_at": datetime.now().isoformat(),
            "version": metadata.get("version", 1)
        }
        
        # Save feedback
        feedback_data = self._load_feedback()
        feedback_data["evaluations"].append(evaluation)
        feedback_data["version"] = feedback_data.get("version", 1) + 1
        self._save_feedback(feedback_data)
        
        logger.info(f"Evaluation complete - Score: {total_score:.2f}/100")
        return evaluation
