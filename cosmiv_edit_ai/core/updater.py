"""
Self-Updater - Reads feedback and automatically adjusts editing parameters
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import shutil


class Updater:
    """Automatically updates editing rules based on evaluator feedback"""
    
    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.rules_file = self.data_dir / "editing_rules.json"
        self.feedback_file = self.data_dir / "feedback.json"
        self.versions_dir = self.data_dir / "versions"
        self.max_versions = self.config.get("max_versions", 10)
        self.learning_rate = self.config.get("learning_rate", 0.3)
        
        self.versions_dir.mkdir(parents=True, exist_ok=True)
    
    def load_rules(self) -> Dict:
        """Load current editing rules"""
        if not self.rules_file.exists():
            return {"version": "1.0.0", "rules": {}, "last_updated": None}
        
        with open(self.rules_file, 'r') as f:
            return json.load(f)
    
    def load_feedback(self) -> Dict:
        """Load evaluator feedback"""
        if not self.feedback_file.exists():
            return {"evaluations": [], "performance_history": []}
        
        with open(self.feedback_file, 'r') as f:
            return json.load(f)
    
    def analyze_performance(self, feedback: Dict) -> Dict:
        """Analyze performance trends from feedback"""
        evaluations = feedback.get("evaluations", [])
        if not evaluations:
            return {}
        
        # Get recent evaluations (last 20)
        recent = evaluations[-20:]
        
        # Calculate average scores per metric
        metric_totals = {}
        metric_counts = {}
        
        for eval_data in recent:
            metrics = eval_data.get("metrics", {})
            for metric, score in metrics.items():
                metric_totals[metric] = metric_totals.get(metric, 0) + score
                metric_counts[metric] = metric_counts.get(metric, 0) + 1
        
        averages = {
            metric: metric_totals[metric] / metric_counts[metric]
            for metric in metric_totals
        }
        
        # Identify weak areas (scores < 70)
        weak_areas = [metric for metric, avg in averages.items() if avg < 70]
        
        # Calculate trend (improving/declining)
        if len(recent) >= 10:
            older_avg = sum(e.get("overall_score", 0) for e in recent[:10]) / 10
            newer_avg = sum(e.get("overall_score", 0) for e in recent[10:]) / 10
            trend = "improving" if newer_avg > older_avg else "declining"
        else:
            trend = "stable"
        
        return {
            "averages": averages,
            "weak_areas": weak_areas,
            "trend": trend,
            "overall_avg": sum(e.get("overall_score", 0) for e in recent) / len(recent)
        }
    
    def adjust_rules(self, rules: Dict, performance: Dict) -> Dict:
        """Adjust rules based on performance analysis"""
        updated_rules = rules.copy()
        weak_areas = performance.get("weak_areas", [])
        trend = performance.get("trend", "stable")
        
        rules_data = updated_rules.get("rules", {})
        
        # Adjust based on weak areas
        if "pacing_consistency" in weak_areas:
            # Make cuts more consistent
            cut_timing = rules_data.get("cut_timing", {})
            current_threshold = cut_timing.get("fast_cut_threshold", 0.5)
            # Reduce variation in cut timing
            cut_timing["fast_cut_threshold"] = current_threshold * (1 - self.learning_rate * 0.1)
            rules_data["cut_timing"] = cut_timing
        
        if "beat_alignment" in weak_areas:
            # Strengthen beat sync
            cut_timing = rules_data.get("cut_timing", {})
            cut_timing["beat_sync"] = True
            # Adjust threshold to be more sensitive
            if "fast_cut_threshold" in cut_timing:
                cut_timing["fast_cut_threshold"] *= 0.9
            rules_data["cut_timing"] = cut_timing
        
        if "clarity" in weak_areas:
            # Can't directly improve clarity through rules, but can note it
            # This would require better source material or processing
        
        if "subtitle_rhythm" in weak_areas:
            # Adjust subtitle timing
            text_styles = rules_data.get("text_styles", {})
            current_duration = text_styles.get("subtitle_duration", 1.5)
            # Make subtitles faster to match rhythm
            text_styles["subtitle_duration"] = current_duration * 0.9
            rules_data["text_styles"] = text_styles
        
        if "trend_adherence" in weak_areas:
            # Increase trend-following behavior
            meta_patterns = updated_rules.get("meta_patterns", {})
            # Make patterns more aggressive
            if meta_patterns.get("zooms") == "frequent":
                pass  # Already frequent
            else:
                meta_patterns["zooms"] = "frequent"
            updated_rules["meta_patterns"] = meta_patterns
        
        # Adjust based on trend
        if trend == "declining":
            # More conservative adjustments
            self.learning_rate *= 0.8
        elif trend == "improving":
            # Can be more aggressive
            self.learning_rate = min(0.5, self.learning_rate * 1.1)
        
        updated_rules["rules"] = rules_data
        return updated_rules
    
    def save_checkpoint(self, rules: Dict):
        """Save a versioned checkpoint of rules"""
        version = rules.get("version", "1.0.0")
        checkpoint_path = self.versions_dir / f"rules_v{version}.json"
        
        with open(checkpoint_path, 'w') as f:
            json.dump(rules, f, indent=2)
        
        # Clean up old versions
        self._cleanup_old_versions()
    
    def _cleanup_old_versions(self):
        """Remove old version checkpoints beyond max_versions"""
        version_files = sorted(self.versions_dir.glob("rules_v*.json"), key=lambda p: p.stat().st_mtime)
        
        if len(version_files) > self.max_versions:
            for old_file in version_files[:-self.max_versions]:
                old_file.unlink()
    
    def update(self) -> Dict:
        """Main update function - analyzes feedback and updates rules"""
        print("🔄 Starting self-update phase...")
        
        # Load current state
        rules = self.load_rules()
        feedback = self.load_feedback()
        
        # Analyze performance
        performance = self.analyze_performance(feedback)
        
        if not performance:
            print("  No feedback data available yet")
            return {"success": False, "reason": "no_feedback"}
        
        print(f"  Performance analysis:")
        print(f"    Overall average: {performance.get('overall_avg', 0):.2f}")
        print(f"    Trend: {performance.get('trend', 'unknown')}")
        print(f"    Weak areas: {performance.get('weak_areas', [])}")
        
        # Adjust rules
        updated_rules = self.adjust_rules(rules, performance)
        
        # Increment version
        current_version = float(updated_rules.get("version", "1.0"))
        updated_rules["version"] = str(round(current_version + 0.1, 1))
        updated_rules["last_updated"] = datetime.now().isoformat()
        
        # Save checkpoint
        self.save_checkpoint(updated_rules)
        
        # Update main rules file
        with open(self.rules_file, 'w') as f:
            json.dump(updated_rules, f, indent=2)
        
        print(f"✅ Rules updated to version {updated_rules['version']}")
        
        return {
            "success": True,
            "old_version": rules.get("version"),
            "new_version": updated_rules["version"],
            "adjustments": performance.get("weak_areas", [])
        }


if __name__ == "__main__":
    updater = Updater()
    result = updater.update()
    print(json.dumps(result, indent=2))
