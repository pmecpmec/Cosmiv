"""
Cosmiv Edit AI - Main Entry Point
Autonomous self-learning video editor system
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from researcher import Researcher
from meta_tracker import MetaTracker
from editor import Editor
from evaluator import Evaluator
from core.updater import Updater
from core.training_loop import TrainingLoop


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(
        description="Cosmiv Edit AI - Autonomous Video Editor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run full training cycle once
  python main.py --train --once

  # Run continuous training
  python main.py --train

  # Edit a video
  python main.py --edit video.mp4

  # Evaluate a video
  python main.py --evaluate video.mp4

  # Research new tutorials
  python main.py --research

  # Update trends
  python main.py --trends
        """,
    )

    parser.add_argument(
        "--config", type=str, default="core/config.json", help="Path to config file"
    )

    # Action flags
    parser.add_argument("--train", action="store_true", help="Run training cycle")
    parser.add_argument(
        "--once", action="store_true", help="Run training cycle once (don't loop)"
    )
    parser.add_argument(
        "--research", action="store_true", help="Research new tutorials only"
    )
    parser.add_argument("--trends", action="store_true", help="Update trends only")
    parser.add_argument("--edit", type=str, metavar="VIDEO", help="Edit a video")
    parser.add_argument(
        "--evaluate", type=str, metavar="VIDEO", help="Evaluate a video"
    )
    parser.add_argument("--update", action="store_true", help="Run self-update only")
    parser.add_argument(
        "--test-video", type=str, help="Test video path for training cycle"
    )

    args = parser.parse_args()

    # If no action specified, show help
    if not any(
        [args.train, args.research, args.trends, args.edit, args.evaluate, args.update]
    ):
        parser.print_help()
        return

    # Research only
    if args.research:
        print("🔍 Research Mode")
        researcher = Researcher(args.config)
        researcher.research_and_update()
        return

    # Trends only
    if args.trends:
        print("📊 Trend Tracking Mode")
        tracker = MetaTracker(args.config)
        tracker.fetch_and_update()
        return

    # Edit only
    if args.edit:
        print("🎬 Edit Mode")
        editor = Editor(args.config)
        result = editor.edit_video(args.edit)
        print(json.dumps(result, indent=2))
        return

    # Evaluate only
    if args.evaluate:
        print("📊 Evaluation Mode")
        evaluator = Evaluator(args.config)
        result = evaluator.evaluate_video(args.evaluate)
        print(json.dumps(result, indent=2))
        return

    # Update only
    if args.update:
        print("🔄 Self-Update Mode")
        updater = Updater(args.config)
        result = updater.update()
        print(json.dumps(result, indent=2))
        return

    # Training cycle
    if args.train:
        import asyncio

        loop = TrainingLoop(args.config)
        if args.once:
            asyncio.run(loop.run_full_cycle(args.test_video))
        else:
            asyncio.run(loop.run_continuous(args.test_video))
        return


if __name__ == "__main__":
    main()
