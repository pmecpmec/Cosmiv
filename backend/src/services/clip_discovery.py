from typing import List, Dict
from datetime import datetime
import random

MOCK_PROVIDERS = ["steam", "xbox", "playstation", "switch"]


def list_providers() -> List[Dict[str, str]]:
    return [{"id": p, "name": p.title()} for p in MOCK_PROVIDERS]


def mock_fetch_recent_clips(provider: str, user_id: str) -> List[Dict[str, str]]:
    # Mock: generate a few clip entries per sync
    now = datetime.utcnow().isoformat()
    return [
        {
            "external_id": f"{provider}-{user_id}-{i}-{random.randint(1000,9999)}",
            "title": f"{provider} clip {i}",
            "url": f"https://example.com/{provider}/{user_id}/{i}.mp4",
            "discovered_at": now,
        }
        for i in range(1, 4)
    ]
