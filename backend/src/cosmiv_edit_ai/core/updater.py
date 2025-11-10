"""
Self-Updater - Adjusts editing parameters based on evaluator feedback
Reinforces high-scoring rule patterns and version-controls data
"""

import json
import shutil
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


class SelfUpdater:
    """Updates editing rules based on evaluation feedback"""
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.training_config = self.config.get("training", {})
        self.learning_rate = self.training_config.get("learning_rate", 0.3)
        self.max_versions = self.training_config.get("max_versions", 10)
        
        self.data_dir = Path(__file__).parent.parent / "data"
        self.versions_dir = self.data_dir / "versions"
        self.versions_dir.mkdir(parents=True, exist_ok=True)
        
        self.rules_file = self.data_dir / "editing_rules.json"
        self.feedback_file = self.data_dir / "feedback.json"
    
    def _load_rules(self) -> Dict[str, Any]:
        """Load editing rules"""
        if not self.rules_file.exists():
            return {"rules": [], "version": 1}
        
        with open(self.rules_file, "r") as f:
            return json.load(f)
    
    def _save_rules(self, rules: Dict[str, Any]):
        """Save editing rules"""
        rules["last_updated"] = datetime.now().isoformat()
        with open(self.rules_file, "w") as f:
            json.dump(rules, f, indent=2)
    
    def _load_feedback(self) -> Dict[str, Any]:
        """Load evaluation feedback"""
        if not self.feedback_file.exists():
            return {"evaluations": []}
        
        with open(self.feedback_file, "r") as f:
            return json.load(f)
    
    def _save_version(self, rules: Dict[str, Any], version_number: int):
        """Save a version snapshot"""
        version_file = self.versions_dir / f"rules_v{version_number}.json"
        with open(version_file, "w") as f:
            json.dump(rules, f, indent=2)
        logger.info(f"Saved version {version_number} to {version_file}")
    
    def _cleanup_old_versions(self, current_version: int):
        """Remove old versions beyond max_versions limit"""
        version_files = sorted(self.versions_dir.glob("rules_v*.json"))
        
        if len(version_files) > self.max_versions:
            # Remove oldest versions
            to_remove = version_files[:len(version_files) - self.max_versions]
            for file in to_remove:
                file.unlink()
                logger.info(f"Removed old version: {file.name}")
    
    def _reinforce_high_scoring_patterns(self, rules: Dict[str, Any], feedback: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reinforce rules that led to high scores
        
        Args:
            rules: Current editing rules
            feedback: Evaluation feedback
            
        Returns:
            Updated rules with reinforced patterns
        """
        evaluations = feedback.get("evaluations", [])
        if not evaluations:
            return rules
        
        # Get recent high-scoring evaluations
        recent_evaluations = [
            e for e in evaluations[-10:]  # Last 10 evaluations
            if e.get("scores", {}).get("total", 0) >= 75
        ]
        
        if not recent_evaluations:
            logger.info("No high-scoring evaluations to reinforce")
            return rules
        
        # Extract successful patterns
        successful_patterns = []
        for eval_data in recent_evaluations:
            metadata = eval_data.get("metadata", {})
            plan = metadata.get("plan", {})
            if plan:
                successful_patterns.append({
                    "plan": plan,
                    "score": eval_data.get("scores", {}).get("total", 0),
                    "timestamp": eval_data.get("evaluated_at")
                })
        
        # Update rule weights/priorities based on success
        # In a more sophisticated implementation, this would adjust rule parameters
        logger.info(f"Reinforcing {len(successful_patterns)} successful patterns")
        
        # Add successful patterns as new rules (with learning rate applied)
        for pattern in successful_patterns[:3]:  # Top 3 patterns
            rule_entry = {
                "source": {
                    "type": "learned",
                    "from_evaluation": True,
                    "score": pattern["score"],
                    "learned_at": pattern["timestamp"]
                },
                "rules": pattern["plan"],
                "extracted_at": datetime.now().isoformat(),
                "weight": self.learning_rate  # Apply learning rate
            }
            rules.setdefault("rules", []).append(rule_entry)
        
        return rules
    
    def _adjust_parameters(self, rules: Dict[str, Any], feedback: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjust editing parameters based on feedback
        
        Args:
            rules: Current rules
            feedback: Evaluation feedback
            
        Returns:
            Updated rules with adjusted parameters
        """
        evaluations = feedback.get("evaluations", [])
        if not evaluations:
            return rules
        
        # Analyze feedback patterns
        common_feedback = {}
        for eval_data in evaluations[-20:]:  # Last 20 evaluations
            for item in eval_data.get("feedback", []):
                common_feedback[item] = common_feedback.get(item, 0) + 1
        
        # Adjust rules based on common feedback
        # This is a simplified version - in production, would be more sophisticated
        logger.info(f"Common feedback patterns: {common_feedback}")
        
        return rules
    
    def update(self) -> Dict[str, Any]:
        """
        Main method to update rules based on feedback
        
        Returns:
            Update results
        """
        logger.info("Starting self-update process...")
        
        # Load current rules and feedback
        rules = self._load_rules()
        feedback = self._load_feedback()
        
        current_version = rules.get("version", 1)
        
        # Save current version before updating
        self._save_version(rules.copy(), current_version)
        
        # Reinforce high-scoring patterns
        rules = self._reinforce_high_scoring_patterns(rules, feedback)
        
        # Adjust parameters
        rules = self._adjust_parameters(rules, feedback)
        
        # Increment version
        new_version = current_version + 1
        rules["version"] = new_version
        
        # Save updated rules
        self._save_rules(rules)
        
        # Cleanup old versions
        self._cleanup_old_versions(new_version)
        
        logger.info(f"Self-update complete - Version: {new_version}")
        
        return {
            "previous_version": current_version,
            "new_version": new_version,
            "rules_updated": True,
            "updated_at": datetime.now().isoformat()
        }
    
    def rollback(self, target_version: int) -> bool:
        """
        Rollback to a previous version
        
        Args:
            target_version: Version number to rollback to
            
        Returns:
            True if rollback successful
        """
        version_file = self.versions_dir / f"rules_v{target_version}.json"
        
        if not version_file.exists():
            logger.error(f"Version {target_version} not found")
            return False
        
        # Load target version
        with open(version_file, "r") as f:
            target_rules = json.load(f)
        
        # Restore rules
        self._save_rules(target_rules)
        
        logger.info(f"Rolled back to version {target_version}")
        return True
