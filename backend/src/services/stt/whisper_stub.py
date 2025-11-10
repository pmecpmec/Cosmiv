from typing import Dict, List

PROFANITY_WORDS = {"damn", "shit", "fuck"}


def transcribe_audio(video_path: str) -> Dict:
    # Stub: pretend we detected some words at times
    words = [
        {"word": "nice", "start": 1.0, "end": 1.3},
        {"word": "shot", "start": 1.3, "end": 1.7},
        {"word": "damn", "start": 2.0, "end": 2.4},
    ]
    profanity_spans: List[Dict] = [
        w for w in words if w["word"].lower() in PROFANITY_WORDS
    ]
    return {"words": words, "profanity": profanity_spans}
