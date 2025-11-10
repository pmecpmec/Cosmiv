from typing import List, Dict
from datetime import datetime
import random
from config import settings

MOCK_PROVIDERS = ["steam", "xbox", "playstation", "switch"]


def list_providers() -> List[Dict[str, str]]:
    """List available gaming platforms"""
    providers_list = [{"id": p, "name": p.title()} for p in MOCK_PROVIDERS]
    return providers_list


def fetch_recent_clips(
    provider: str, user_id: str, access_token: str
) -> List[Dict[str, str]]:
    """
    Fetch recent clips from gaming platform.
    Mock mode by default, real API when enabled.
    """
    if provider not in MOCK_PROVIDERS:
        return []

    # Check if real API is enabled for this provider
    if provider == "steam" and not settings.STEAM_API_ENABLED:
        return mock_fetch_recent_clips(provider, user_id)
    elif provider == "xbox" and not settings.XBOX_API_ENABLED:
        return mock_fetch_recent_clips(provider, user_id)
    elif provider == "playstation" and not settings.PLAYSTATION_API_ENABLED:
        return mock_fetch_recent_clips(provider, user_id)
    elif provider == "switch" and not settings.NINTENDO_API_ENABLED:
        return mock_fetch_recent_clips(provider, user_id)

    # Real API implementation would go here
    # For now, return mock even if enabled (would need actual API implementation)
    return mock_fetch_recent_clips(provider, user_id)


def mock_fetch_recent_clips(provider: str, user_id: str) -> List[Dict[str, str]]:
    """Mock: generate a few clip entries per sync"""
    now = datetime.utcnow().isoformat()
    return [
        {
            "external_id": f"{provider}-{user_id}-{i}-{random.randint(1000,9999)}",
            "title": f"{provider.title()} Highlight {i}",
            "url": f"https://example.com/{provider}/{user_id}/{i}.mp4",
            "discovered_at": now,
        }
        for i in range(1, 4 + random.randint(0, 3))  # 1-7 clips per sync
    ]
