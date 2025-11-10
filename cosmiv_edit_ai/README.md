# Cosmiv Edit AI

**Autonomous self-learning video editor** that studies editing tutorials, tracks viral trends, applies learnings automatically, evaluates results, and continuously improves without manual retraining.

## 🎯 Overview

Cosmiv Edit AI is a self-training subsystem that:

1. **Researches** new video editing tutorials from YouTube
2. **Tracks** current viral trends from social platforms
3. **Edits** videos automatically using learned rules
4. **Evaluates** output quality and performance
5. **Improves** itself by adjusting parameters based on feedback

## 📁 Structure

```
cosmiv_edit_ai/
├── researcher.py          # Knowledge collector (YouTube tutorials)
├── meta_tracker.py         # Trend tracker (Shorts, TikTok, Reels)
├── editor.py               # Video editing automation
├── evaluator.py            # Performance scoring
├── core/
│   ├── config.json         # Configuration
│   ├── updater.py          # Self-improvement logic
│   └── training_loop.py    # Autonomous training cycle
├── data/
│   ├── editing_rules.json  # Learned editing rules
│   ├── trend_patterns.json # Current trends
│   ├── feedback.json       # Evaluation feedback
│   └── versions/           # Versioned checkpoints
├── renders/                # Output videos
└── main.py                 # CLI entry point
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd cosmiv_edit_ai
pip install -r requirements.txt
```

### 2. Configure API Keys

Set environment variables or update `core/config.json`:

```bash
export YOUTUBE_API_KEY="your_youtube_api_key"
export OPENAI_API_KEY="your_openai_api_key"  # Optional but recommended
```

Or edit `core/config.json`:

```json
{
  "youtube_api_key": "your_key_here",
  "openai_api_key": "your_key_here"
}
```

### 3. Run Training Cycle

**One-time cycle:**
```bash
python main.py --train --once
```

**Continuous training (runs every 24 hours):**
```bash
python main.py --train
```

## 📖 Usage

### Individual Components

**Research new tutorials:**
```bash
python main.py --research
```

**Update trend data:**
```bash
python main.py --trends
```

**Edit a video:**
```bash
python main.py --edit input_video.mp4
```

**Evaluate a video:**
```bash
python main.py --evaluate video.mp4
```

**Run self-update:**
```bash
python main.py --update
```

### Training Loop

The training loop orchestrates all phases:

1. **Research** → Downloads and analyzes tutorials
2. **Trend Tracking** → Fetches current viral patterns
3. **Test Editing** → Creates test edits with new rules
4. **Evaluation** → Scores the edits
5. **Self-Improvement** → Adjusts rules based on feedback

## ⚙️ Configuration

Edit `core/config.json` to customize:

```json
{
  "auto_train": true,              # Enable automatic training
  "train_interval_hours": 24,       # Training cycle frequency
  "preferred_editor": "davinci",   # "davinci" or "moviepy"
  "learning_rate": 0.3,            # How aggressively to update rules
  "max_versions": 10,              # Max version checkpoints to keep
  "research_queries": [            # Tutorial search queries
    "viral video editing",
    "DaVinci Resolve tutorial",
    ...
  ],
  "evaluation_metrics": {          # Scoring weights
    "pacing_consistency": 0.25,
    "beat_alignment": 0.25,
    ...
  }
}
```

## 🎬 Editing Capabilities

The editor supports:

- **Beat-synced cuts** - Aligns cuts with audio beats
- **Dynamic pacing** - Adjusts cut timing based on rules
- **Transitions** - Fade, zoom, whip, glitch effects
- **Speed ramps** - Variable speed adjustments
- **Subtitle generation** - Automatic text overlays
- **Trend adherence** - Applies current viral patterns

### Editor Backends

1. **DaVinci Resolve** (preferred) - Full-featured professional editing
2. **MoviePy + FFmpeg** (fallback) - Open-source alternative

## 📊 Evaluation Metrics

Videos are scored on:

- **Pacing Consistency** (25%) - Even timing of cuts
- **Beat Alignment** (25%) - Sync with audio beats
- **Clarity** (20%) - Visual quality and focus
- **Subtitle Rhythm** (15%) - Text timing
- **Trend Adherence** (15%) - Match with viral patterns

## 🔄 Autonomous Learning

The system learns by:

1. **Extracting rules** from tutorial transcripts
2. **Tracking patterns** from trending videos
3. **Testing edits** with new knowledge
4. **Scoring results** objectively
5. **Adjusting parameters** automatically

Each cycle improves the editing quality without manual intervention.

## 📝 Data Files

- `data/editing_rules.json` - Current editing rules (updated by researcher)
- `data/trend_patterns.json` - Current trends (updated by meta tracker)
- `data/feedback.json` - Evaluation history and suggestions
- `data/versions/` - Versioned checkpoints of rules

## 🔧 Requirements

- Python 3.8+
- FFmpeg (for video processing)
- YouTube Data API key (for research)
- OpenAI API key (optional, for better rule extraction)
- DaVinci Resolve (optional, for advanced editing)

## 🎨 Integration

This system can be integrated with the main Cosmiv backend:

```python
from cosmiv_edit_ai.editor import Editor
from cosmiv_edit_ai.evaluator import Evaluator

editor = Editor()
result = editor.edit_video("input.mp4", "output.mp4")

evaluator = Evaluator()
score = evaluator.evaluate_video("output.mp4")
```

## 📈 Future Enhancements

- TikTok API integration for trend tracking
- Instagram Reels trend analysis
- Advanced DaVinci Resolve automation
- Real-time trend monitoring
- Multi-style editing modes
- Collaborative learning across instances

## 🐛 Troubleshooting

**YouTube API errors:**
- Verify API key is set correctly
- Check API quota limits

**Video editing fails:**
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check video file format compatibility

**No transcripts found:**
- Some videos don't have transcripts
- System will skip those videos automatically

## 📄 License

Part of the Cosmiv platform.
