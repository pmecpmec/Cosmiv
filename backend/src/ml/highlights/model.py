from typing import List, Dict
import random

class HighlightModel:
    def __init__(self):
        # Placeholder for real model loading
        pass

    def detect_events(self, video_path: str) -> List[Dict]:
        # Mock: emit random events with timestamps and confidence
        events = []
        t = 0.0
        for _ in range(random.randint(2, 6)):
            t += random.uniform(3.0, 10.0)
            events.append({
                "type": random.choice(["kill", "headshot", "clutch", "multi_kill"]),
                "time": t,
                "confidence": round(random.uniform(0.5, 0.95), 2),
            })
        return events

_model = None

def get_model() -> HighlightModel:
    global _model
    if _model is None:
        _model = HighlightModel()
    return _model
