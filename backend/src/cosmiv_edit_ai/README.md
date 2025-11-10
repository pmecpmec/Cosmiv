# Cosmiv Edit AI - Self-Learning Video Editing Intelligence

A self-learning, cloud-hosted video editing intelligence system that automatically studies editing meta, applies what it learns, improves over time, and powers a commercial editing-as-a-service platform.

## 🧩 System Architecture

### Core Components

1. **AI Brain** (`core/brain.py`)
   - Handles communication with hosted LLM models (RunPod, Vast.ai, Lambda Labs)
   - Supports Mistral 7B, Phi-3, LLaMA 3, or any OpenAI-compatible API
   - Extracts editing rules from tutorials and analyzes trends

2. **Knowledge Collector** (`researcher.py`)
   - Uses YouTube Data API to search for editing tutorials
   - Extracts editing principles using AI Brain
   - Stores rules in `data/editing_rules.json`

3. **Meta Tracker** (`meta_tracker.py`)
   - Tracks short-form video trends (YouTube Shorts, TikTok)
   - Detects current "editing meta": pacing, subtitle frequency, filter usage
   - Saves trends in `data/trend_patterns.json`

4. **Editing Agent** (`editor.py`)
   - Automates video edits based on stored rules
   - Supports DaVinci Resolve (local) and MoviePy/FFmpeg (headless)
   - Applies current editing rules and trend patterns

5. **Evaluator** (`evaluator.py`)
   - Rates finished edits on 0-100 "virality" score
   - Criteria: pace alignment, beat sync, subtitle timing, retention prediction
   - Outputs feedback to `data/feedback.json`

6. **Self-Updater** (`core/updater.py`)
   - Adjusts editing parameters based on evaluator feedback
   - Reinforces high-scoring rule patterns
   - Version-controls data with rollback capability

7. **Training Loop** (`core/training_loop.py`)
   - Continuous autonomous process
   - Cycle: research → trends → edit → evaluate → improve
   - Supports daily self-training

## 🚀 Commercial API

### POST `/api/edit`
Edit a video using Cosmiv Edit AI.

**Request:**
- `file`: Video file (multipart/form-data)
- `edit_style`: Editing style (`fast`, `medium`, `slow`, `viral`, `default`)

**Response:**
- Edited video file (MP4)

### POST `/api/train`
Trigger a training cycle to update the knowledge base.

**Response:**
```json
{
  "success": true,
  "started_at": "2024-01-01T00:00:00",
  "completed_at": "2024-01-01T00:05:00",
  "steps": {
    "research": {...},
    "trends": {...},
    "editing": {...},
    "evaluation": {...},
    "update": {...}
  }
}
```

### GET `/api/status`
Get system status including model version, trend profile, and uptime.

**Response:**
```json
{
  "model_version": 5,
  "trend_profile": {
    "current_meta": "...",
    "pacing_trend": "...",
    "last_updated": "..."
  },
  "uptime": {
    "status": "running",
    "last_training": "...",
    "training_count": 10
  },
  "training": {
    "auto_train": true,
    "running": true,
    "interval_hours": 24
  }
}
```

## ⚙️ Configuration

Edit `cosmiv_edit_ai/core/config.json` to configure:

- **Model Settings**: API endpoint, model type, temperature
- **Training**: Auto-train interval, learning rate, max versions
- **Research**: YouTube API key, search queries
- **Meta Tracking**: TikTok/YouTube Shorts settings
- **Editing**: Default pace, subtitle/color grade preferences
- **Evaluation**: Virality score weights and thresholds

## 📁 Data Structure

```
cosmiv_edit_ai/
├── core/
│   ├── brain.py          # AI model interface
│   ├── config.json       # Configuration
│   ├── updater.py        # Self-updater
│   └── training_loop.py  # Training orchestrator
├── data/
│   ├── editing_rules.json      # Learned editing rules
│   ├── trend_patterns.json      # Current trends
│   ├── feedback.json            # Evaluation feedback
│   └── versions/                # Version history
│       └── rules_v*.json
└── renders/                     # Edited video outputs
```

## 🔧 Setup

1. **Configure API Keys** (environment variables):
   ```bash
   export COSMIV_AI_ENDPOINT="https://your-runpod-endpoint.com"
   export COSMIV_AI_API_KEY="your-api-key"
   export YOUTUBE_API_KEY="your-youtube-api-key"
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Training Loop**:
   - Auto-starts if `auto_train: true` in config
   - Or manually trigger via `POST /api/train`

## 🎯 Usage Example

```python
from cosmiv_edit_ai.editor import EditingAgent

editor = EditingAgent()
result = editor.edit_video(
    video_path="input.mp4",
    edit_style="viral"
)
print(f"Edited video: {result['output_path']}")
```

## 📊 Learning Process

1. **Research**: Fetches tutorials, extracts rules
2. **Track**: Analyzes current trends
3. **Edit**: Applies rules to videos
4. **Evaluate**: Scores edits on virality
5. **Improve**: Updates rules based on feedback

The system continuously improves by reinforcing successful patterns and adjusting parameters based on evaluation feedback.

## 🔄 Version Control

- Each update creates a new version in `data/versions/`
- Keeps up to 10 historical states (configurable)
- Supports rollback to previous versions

## 🌐 Cloud Deployment

Designed for scalability on:
- **RunPod**: GPU hosting for LLM inference
- **Vast.ai**: Alternative GPU provider
- **Lambda Labs**: Cloud GPU infrastructure

The system can run locally or in the cloud, with the AI Brain connecting to remote model endpoints.
