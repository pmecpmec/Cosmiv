"""
Training Loop - Orchestrates the autonomous self-training cycle
"""

import os
import json
import asyncio
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from researcher import Researcher
from meta_tracker import MetaTracker
from editor import Editor
from evaluator import Evaluator
from core.updater import Updater


class TrainingLoop:
    """Orchestrates the autonomous training cycle"""

    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.auto_train = self.config.get("auto_train", True)
        self.train_interval_hours = self.config.get("train_interval_hours", 24)
        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.renders_dir = Path(self.config.get("renders_dir", "renders"))

        # Initialize components
        self.researcher = Researcher(config_path)
        self.meta_tracker = MetaTracker(config_path)
        self.editor = Editor(config_path)
        self.evaluator = Evaluator(config_path)
        self.updater = Updater(config_path)

    async def train_phase(self) -> Dict:
        """Phase 1: Researcher learns new tutorials"""
        print("\n" + "=" * 60)
        print("PHASE 1: RESEARCH")
        print("=" * 60)
        try:
            result = self.researcher.research_and_update()
            return {"success": True, "phase": "train", "result": result}
        except Exception as e:
            print(f"❌ Research phase failed: {e}")
            return {"success": False, "phase": "train", "error": str(e)}

    async def update_phase(self) -> Dict:
        """Phase 2: Meta Tracker fetches trend updates"""
        print("\n" + "=" * 60)
        print("PHASE 2: TREND TRACKING")
        print("=" * 60)
        try:
            result = self.meta_tracker.fetch_and_update()
            return {"success": True, "phase": "update", "result": result}
        except Exception as e:
            print(f"❌ Trend tracking phase failed: {e}")
            return {"success": False, "phase": "update", "error": str(e)}

    async def edit_phase(self, test_video: Optional[str] = None) -> Dict:
        """Phase 3: Editor runs test edits"""
        print("\n" + "=" * 60)
        print("PHASE 3: TEST EDITING")
        print("=" * 60)

        if not test_video:
            # Look for test videos in renders directory or use a placeholder
            test_videos = list(self.renders_dir.glob("*.mp4"))
            if not test_videos:
                print("  ⚠️  No test video available - skipping edit phase")
                return {"success": False, "phase": "edit", "reason": "no_test_video"}
            test_video = str(test_videos[0])

        if not os.path.exists(test_video):
            print(f"  ⚠️  Test video not found: {test_video}")
            return {"success": False, "phase": "edit", "reason": "video_not_found"}

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"test_edit_{timestamp}.mp4"
            result = self.editor.edit_video(test_video, output_name)
            return {
                "success": result.get("success", False),
                "phase": "edit",
                "result": result,
            }
        except Exception as e:
            print(f"❌ Edit phase failed: {e}")
            return {"success": False, "phase": "edit", "error": str(e)}

    async def evaluate_phase(self, video_path: Optional[str] = None) -> Dict:
        """Phase 4: Evaluator scores performance"""
        print("\n" + "=" * 60)
        print("PHASE 4: EVALUATION")
        print("=" * 60)

        if not video_path:
            # Find most recent edit
            test_edits = sorted(
                self.renders_dir.glob("test_edit_*.mp4"),
                key=lambda p: p.stat().st_mtime,
            )
            if not test_edits:
                print("  ⚠️  No test edits to evaluate - skipping evaluation phase")
                return {"success": False, "phase": "evaluate", "reason": "no_edits"}
            video_path = str(test_edits[-1])

        if not os.path.exists(video_path):
            print(f"  ⚠️  Video not found: {video_path}")
            return {"success": False, "phase": "evaluate", "reason": "video_not_found"}

        try:
            trends = self.meta_tracker.get_current_meta()
            result = self.evaluator.evaluate_video(video_path, trends)
            return {
                "success": result.get("success", False),
                "phase": "evaluate",
                "result": result,
            }
        except Exception as e:
            print(f"❌ Evaluation phase failed: {e}")
            return {"success": False, "phase": "evaluate", "error": str(e)}

    async def improve_phase(self) -> Dict:
        """Phase 5: Updater adjusts rules"""
        print("\n" + "=" * 60)
        print("PHASE 5: SELF-IMPROVEMENT")
        print("=" * 60)
        try:
            result = self.updater.update()
            return {
                "success": result.get("success", False),
                "phase": "improve",
                "result": result,
            }
        except Exception as e:
            print(f"❌ Improvement phase failed: {e}")
            return {"success": False, "phase": "improve", "error": str(e)}

    async def run_full_cycle(self, test_video: Optional[str] = None) -> Dict:
        """Run complete training cycle"""
        print("\n" + "🚀" * 30)
        print("COSMIV EDIT AI - AUTONOMOUS TRAINING CYCLE")
        print("🚀" * 30)
        print(f"Started at: {datetime.now().isoformat()}")

        results = {}

        # Phase 1: Research
        results["train"] = await self.train_phase()
        await asyncio.sleep(1)  # Brief pause between phases

        # Phase 2: Trend Tracking
        results["update"] = await self.update_phase()
        await asyncio.sleep(1)

        # Phase 3: Test Editing
        results["edit"] = await self.edit_phase(test_video)
        await asyncio.sleep(1)

        # Phase 4: Evaluation
        edit_result = results["edit"].get("result", {})
        edited_video = edit_result.get("output_path") if edit_result else None
        results["evaluate"] = await self.evaluate_phase(edited_video)
        await asyncio.sleep(1)

        # Phase 5: Self-Improvement
        results["improve"] = await self.improve_phase()

        # Summary
        print("\n" + "=" * 60)
        print("TRAINING CYCLE COMPLETE")
        print("=" * 60)
        for phase, result in results.items():
            status = "✅" if result.get("success") else "❌"
            print(f"{status} {phase.upper()}: {result.get('success', False)}")

        return results

    async def run_continuous(self, test_video: Optional[str] = None):
        """Run continuous training loop"""
        if not self.auto_train:
            print("Auto-training is disabled in config")
            return

        interval_seconds = self.train_interval_hours * 3600

        print(
            f"🔄 Starting continuous training loop (interval: {self.train_interval_hours} hours)"
        )

        while True:
            try:
                await self.run_full_cycle(test_video)
                print(f"\n⏰ Next cycle in {self.train_interval_hours} hours...")
                await asyncio.sleep(interval_seconds)
            except KeyboardInterrupt:
                print("\n🛑 Training loop stopped by user")
                break
            except Exception as e:
                print(f"\n❌ Training loop error: {e}")
                print("Retrying in 1 hour...")
                await asyncio.sleep(3600)


def main():
    """Main entry point for training loop"""
    import argparse

    parser = argparse.ArgumentParser(description="Cosmiv Edit AI Training Loop")
    parser.add_argument("--once", action="store_true", help="Run one cycle and exit")
    parser.add_argument(
        "--test-video", type=str, help="Path to test video for editing phase"
    )
    parser.add_argument(
        "--config", type=str, default="core/config.json", help="Path to config file"
    )

    args = parser.parse_args()

    loop = TrainingLoop(args.config)

    if args.once:
        # Run once
        asyncio.run(loop.run_full_cycle(args.test_video))
    else:
        # Run continuously
        asyncio.run(loop.run_continuous(args.test_video))


if __name__ == "__main__":
    main()
