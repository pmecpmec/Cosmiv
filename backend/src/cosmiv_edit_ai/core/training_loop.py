"""
Training Loop - Continuous autonomous learning process
Orchestrates the full training cycle: research → trends → edit → evaluate → improve
"""

import json
import time
import logging
from typing import Dict, Optional, Any
from pathlib import Path
from datetime import datetime, timedelta
import threading

from ..researcher import KnowledgeCollector
from ..meta_tracker import MetaTracker
from ..editor import EditingAgent
from ..evaluator import Evaluator
from .updater import SelfUpdater

logger = logging.getLogger(__name__)


class TrainingLoop:
    """Manages the autonomous training cycle"""
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.training_config = self.config.get("training", {})
        self.auto_train = self.training_config.get("auto_train", True)
        self.train_interval_hours = self.training_config.get("train_interval_hours", 24)
        
        # Initialize components
        from ..core.brain import AIBrain
        brain = AIBrain(config_path)
        
        self.researcher = KnowledgeCollector(config_path, brain)
        self.meta_tracker = MetaTracker(config_path, brain)
        self.editor = EditingAgent(config_path)
        self.evaluator = Evaluator(config_path)
        self.updater = SelfUpdater(config_path)
        
        self.running = False
        self.thread = None
        
        self.data_dir = Path(__file__).parent.parent / "data"
        self.status_file = self.data_dir / "training_status.json"
    
    def _save_status(self, status: Dict[str, Any]):
        """Save training status"""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        with open(self.status_file, "w") as f:
            json.dump(status, f, indent=2)
    
    def _load_status(self) -> Dict[str, Any]:
        """Load training status"""
        if not self.status_file.exists():
            return {
                "last_training": None,
                "training_count": 0,
                "status": "idle"
            }
        
        with open(self.status_file, "r") as f:
            return json.load(f)
    
    def train(self) -> Dict[str, Any]:
        """
        Execute one full training cycle
        
        Returns:
            Training results
        """
        logger.info("=" * 50)
        logger.info("Starting training cycle")
        logger.info("=" * 50)
        
        results = {
            "started_at": datetime.now().isoformat(),
            "steps": {}
        }
        
        try:
            # Step 1: Research tutorials
            logger.info("Step 1/5: Researching tutorials...")
            try:
                rules_updated = self.researcher.update_rules()
                results["steps"]["research"] = {
                    "success": True,
                    "rules_updated": rules_updated
                }
            except Exception as e:
                logger.error(f"Research step failed: {e}")
                results["steps"]["research"] = {
                    "success": False,
                    "error": str(e)
                }
            
            # Step 2: Track trends
            logger.info("Step 2/5: Tracking trends...")
            try:
                trends = self.meta_tracker.track_trends()
                results["steps"]["trends"] = {
                    "success": True,
                    "trends_found": len(trends.get("trends", []))
                }
            except Exception as e:
                logger.error(f"Trend tracking failed: {e}")
                results["steps"]["trends"] = {
                    "success": False,
                    "error": str(e)
                }
            
            # Step 3: Edit (would need test videos - skip for now)
            logger.info("Step 3/5: Editing (skipped - no test videos)")
            results["steps"]["editing"] = {
                "success": True,
                "skipped": True,
                "note": "Requires test video input"
            }
            
            # Step 4: Evaluate (would need edited videos - skip for now)
            logger.info("Step 4/5: Evaluation (skipped - no videos to evaluate)")
            results["steps"]["evaluation"] = {
                "success": True,
                "skipped": True,
                "note": "Requires edited videos"
            }
            
            # Step 5: Update rules
            logger.info("Step 5/5: Updating rules...")
            try:
                update_result = self.updater.update()
                results["steps"]["update"] = {
                    "success": True,
                    "version": update_result.get("new_version")
                }
            except Exception as e:
                logger.error(f"Update step failed: {e}")
                results["steps"]["update"] = {
                    "success": False,
                    "error": str(e)
                }
            
            results["completed_at"] = datetime.now().isoformat()
            results["success"] = all(
                step.get("success", False) or step.get("skipped", False)
                for step in results["steps"].values()
            )
            
            # Update status
            status = self._load_status()
            status["last_training"] = datetime.now().isoformat()
            status["training_count"] = status.get("training_count", 0) + 1
            status["status"] = "completed" if results["success"] else "partial"
            self._save_status(status)
            
            logger.info("=" * 50)
            logger.info(f"Training cycle complete - Success: {results['success']}")
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"Training cycle failed: {e}")
            results["error"] = str(e)
            results["success"] = False
        
        return results
    
    def _run_loop(self):
        """Background training loop"""
        logger.info(f"Training loop started - Interval: {self.train_interval_hours} hours")
        
        while self.running:
            try:
                # Execute training
                self.train()
                
                # Wait for next interval
                wait_seconds = self.train_interval_hours * 3600
                logger.info(f"Waiting {self.train_interval_hours} hours until next training cycle...")
                
                # Sleep in chunks to allow for graceful shutdown
                for _ in range(wait_seconds // 60):
                    if not self.running:
                        break
                    time.sleep(60)
                
            except Exception as e:
                logger.error(f"Error in training loop: {e}")
                # Wait a bit before retrying
                time.sleep(3600)  # 1 hour
    
    def start(self):
        """Start autonomous training loop"""
        if self.running:
            logger.warning("Training loop already running")
            return
        
        if not self.auto_train:
            logger.info("Auto-training disabled in config")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        logger.info("Training loop started in background")
        
        # Update status
        status = self._load_status()
        status["status"] = "running"
        status["started_at"] = datetime.now().isoformat()
        self._save_status(status)
    
    def stop(self):
        """Stop autonomous training loop"""
        if not self.running:
            return
        
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        
        logger.info("Training loop stopped")
        
        # Update status
        status = self._load_status()
        status["status"] = "stopped"
        status["stopped_at"] = datetime.now().isoformat()
        self._save_status(status)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current training status"""
        status = self._load_status()
        status["running"] = self.running
        status["auto_train"] = self.auto_train
        status["train_interval_hours"] = self.train_interval_hours
        return status
