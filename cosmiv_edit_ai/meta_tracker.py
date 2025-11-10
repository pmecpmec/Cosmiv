"""
Meta Tracker - Tracks current viral trends from social platforms
"""

import os
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
import requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class MetaTracker:
    """Tracks trending patterns from YouTube Shorts, TikTok, and Instagram Reels"""

    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY") or self.config.get(
            "youtube_api_key", ""
        )
        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.trends_file = self.data_dir / "trend_patterns.json"
        self.rolling_window_days = self.config.get("rolling_window_days", 30)

        if self.youtube_api_key:
            self.youtube = build("youtube", "v3", developerKey=self.youtube_api_key)
        else:
            self.youtube = None
            print("Warning: YouTube API key not set. Trend tracking will be limited.")

    def fetch_youtube_shorts_trends(self, max_results: int = 50) -> List[Dict]:
        """Fetch trending YouTube Shorts"""
        if not self.youtube:
            return []

        try:
            # Search for popular Shorts
            request = self.youtube.search().list(
                part="snippet,statistics",
                q="#shorts",
                type="video",
                maxResults=max_results,
                order="viewCount",
                videoDuration="short",  # < 4 minutes
                publishedAfter=(datetime.now() - timedelta(days=7)).isoformat() + "Z",
            )
            response = request.execute()

            trends = []
            for item in response.get("items", []):
                video_id = item["id"]["videoId"]

                # Get detailed stats
                stats_request = self.youtube.videos().list(
                    part="statistics,contentDetails", id=video_id
                )
                stats_response = stats_request.execute()

                if stats_response.get("items"):
                    video_data = stats_response["items"][0]
                    trends.append(
                        {
                            "video_id": video_id,
                            "title": item["snippet"]["title"],
                            "view_count": int(
                                video_data["statistics"].get("viewCount", 0)
                            ),
                            "like_count": int(
                                video_data["statistics"].get("likeCount", 0)
                            ),
                            "duration": video_data["contentDetails"]["duration"],
                            "published_at": item["snippet"]["publishedAt"],
                        }
                    )

            return trends
        except HttpError as e:
            print(f"YouTube API error: {e}")
            return []

    def analyze_patterns(self, videos: List[Dict]) -> Dict:
        """Analyze videos to extract meta patterns"""
        patterns = {
            "beat_cuts": 0,
            "speed_ramps": 0,
            "subtitles": 0,
            "zooms": 0,
            "filters": [],
            "common_keywords": [],
        }

        # Analyze titles and descriptions for patterns
        all_text = " ".join([v.get("title", "") for v in videos])
        text_lower = all_text.lower()

        # Pattern detection keywords
        if "beat" in text_lower and "cut" in text_lower:
            patterns["beat_cuts"] = min(100, text_lower.count("beat") * 10)

        if "speed" in text_lower or "ramp" in text_lower:
            patterns["speed_ramps"] = min(
                100, (text_lower.count("speed") + text_lower.count("ramp")) * 10
            )

        if "subtitle" in text_lower or "caption" in text_lower or "text" in text_lower:
            patterns["subtitles"] = min(
                100, (text_lower.count("subtitle") + text_lower.count("caption")) * 10
            )

        if "zoom" in text_lower:
            patterns["zooms"] = min(100, text_lower.count("zoom") * 10)

        # Extract common keywords
        words = re.findall(r"\b\w{4,}\b", text_lower)
        word_freq = {}
        for word in words:
            if word not in ["this", "that", "with", "from", "video", "shorts"]:
                word_freq[word] = word_freq.get(word, 0) + 1

        patterns["common_keywords"] = sorted(
            word_freq.items(), key=lambda x: x[1], reverse=True
        )[:10]

        return patterns

    def update_trends(self, platform: str, new_patterns: Dict):
        """Update trend patterns for a platform"""
        if not self.trends_file.exists():
            trends_data = {
                "version": "1.0.0",
                "last_updated": None,
                "trends": {
                    "youtube_shorts": {
                        "current_meta": [],
                        "trending_patterns": [],
                        "evolution_history": [],
                    },
                    "tiktok": {
                        "current_meta": [],
                        "trending_patterns": [],
                        "evolution_history": [],
                    },
                    "instagram_reels": {
                        "current_meta": [],
                        "trending_patterns": [],
                        "evolution_history": [],
                    },
                },
                "rolling_window_days": self.rolling_window_days,
            }
        else:
            with open(self.trends_file, "r") as f:
                trends_data = json.load(f)

        if platform not in trends_data["trends"]:
            trends_data["trends"][platform] = {
                "current_meta": [],
                "trending_patterns": [],
                "evolution_history": [],
            }

        # Add new patterns to current meta
        timestamp = datetime.now().isoformat()
        meta_entry = {"timestamp": timestamp, "patterns": new_patterns}

        trends_data["trends"][platform]["current_meta"].append(meta_entry)

        # Keep only last N days of data
        cutoff_date = datetime.now() - timedelta(days=self.rolling_window_days)
        trends_data["trends"][platform]["current_meta"] = [
            entry
            for entry in trends_data["trends"][platform]["current_meta"]
            if datetime.fromisoformat(entry["timestamp"]) > cutoff_date
        ]

        # Calculate trending patterns (aggregate recent patterns)
        if trends_data["trends"][platform]["current_meta"]:
            recent_patterns = trends_data["trends"][platform]["current_meta"][-10:]
            aggregated = {
                "beat_cuts": sum(
                    p["patterns"].get("beat_cuts", 0) for p in recent_patterns
                )
                / len(recent_patterns),
                "speed_ramps": sum(
                    p["patterns"].get("speed_ramps", 0) for p in recent_patterns
                )
                / len(recent_patterns),
                "subtitles": sum(
                    p["patterns"].get("subtitles", 0) for p in recent_patterns
                )
                / len(recent_patterns),
                "zooms": sum(p["patterns"].get("zooms", 0) for p in recent_patterns)
                / len(recent_patterns),
            }
            trends_data["trends"][platform]["trending_patterns"] = aggregated

        # Add to evolution history
        trends_data["trends"][platform]["evolution_history"].append(
            {
                "timestamp": timestamp,
                "snapshot": (
                    aggregated
                    if trends_data["trends"][platform]["current_meta"]
                    else {}
                ),
            }
        )

        # Keep evolution history limited
        if len(trends_data["trends"][platform]["evolution_history"]) > 100:
            trends_data["trends"][platform]["evolution_history"] = trends_data[
                "trends"
            ][platform]["evolution_history"][-100:]

        trends_data["last_updated"] = timestamp
        trends_data["version"] = str(float(trends_data.get("version", "1.0")) + 0.01)

        with open(self.trends_file, "w") as f:
            json.dump(trends_data, f, indent=2)

    def fetch_and_update(self) -> Dict:
        """Main function to fetch trends and update data"""
        print("📊 Starting trend tracking...")

        trend_sources = self.config.get("trend_sources", {})
        all_updates = {}

        if trend_sources.get("youtube_shorts", False):
            print("  Fetching YouTube Shorts trends...")
            videos = self.fetch_youtube_shorts_trends(max_results=50)
            if videos:
                patterns = self.analyze_patterns(videos)
                self.update_trends("youtube_shorts", patterns)
                all_updates["youtube_shorts"] = patterns
                print(f"    Found {len(videos)} trending videos")

        # TikTok and Instagram would require their respective APIs
        # Placeholder for future implementation
        if trend_sources.get("tiktok", False):
            print("  TikTok tracking not yet implemented (requires API access)")

        if trend_sources.get("instagram_reels", False):
            print(
                "  Instagram Reels tracking not yet implemented (requires API access)"
            )

        print("✅ Trend tracking complete.")
        return all_updates

    def get_current_meta(self, platform: str = "youtube_shorts") -> Dict:
        """Get current meta patterns for a platform"""
        if not self.trends_file.exists():
            return {}

        with open(self.trends_file, "r") as f:
            trends_data = json.load(f)

        if platform not in trends_data["trends"]:
            return {}

        trending = trends_data["trends"][platform].get("trending_patterns", {})
        return trending


if __name__ == "__main__":
    tracker = MetaTracker()
    tracker.fetch_and_update()
