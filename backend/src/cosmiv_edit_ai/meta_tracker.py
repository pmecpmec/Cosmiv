"""
Meta Tracker - Tracks short-form video trends
Monitors TikTok and YouTube Shorts for current editing meta
"""

import json
import os
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime, timedelta
import httpx
from .core.brain import AIBrain

logger = logging.getLogger(__name__)


class MetaTracker:
    """Tracks and analyzes current video editing trends"""
    
    def __init__(self, config_path: Optional[str] = None, brain: Optional[AIBrain] = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "core" / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.meta_config = self.config.get("meta_tracking", {})
        self.tiktok_enabled = self.meta_config.get("tiktok_api_enabled", False)
        self.youtube_shorts_enabled = self.meta_config.get("youtube_shorts_enabled", True)
        self.trend_window_days = self.meta_config.get("trend_window_days", 7)
        self.min_views_threshold = self.meta_config.get("min_views_threshold", 10000)
        
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.patterns_file = self.data_dir / "trend_patterns.json"
        self.brain = brain or AIBrain(config_path)
        
        # Initialize patterns file if it doesn't exist
        if not self.patterns_file.exists():
            self._initialize_patterns()
    
    def _initialize_patterns(self):
        """Initialize empty patterns file"""
        initial_patterns = {
            "version": 1,
            "last_updated": datetime.now().isoformat(),
            "trends": [],
            "meta_summary": {}
        }
        with open(self.patterns_file, "w") as f:
            json.dump(initial_patterns, f, indent=2)
    
    def _load_patterns(self) -> Dict[str, Any]:
        """Load existing trend patterns"""
        if not self.patterns_file.exists():
            self._initialize_patterns()
        
        with open(self.patterns_file, "r") as f:
            return json.load(f)
    
    def _save_patterns(self, patterns: Dict[str, Any]):
        """Save trend patterns to file"""
        patterns["last_updated"] = datetime.now().isoformat()
        with open(self.patterns_file, "w") as f:
            json.dump(patterns, f, indent=2)
    
    def _search_youtube_shorts(self, query: str = "shorts", max_results: int = 20) -> List[Dict[str, Any]]:
        """Search YouTube Shorts for trending videos"""
        youtube_api_key = os.getenv("YOUTUBE_API_KEY", "")
        
        if not youtube_api_key:
            logger.warning("YouTube API key not configured, using mock data")
            return self._mock_shorts_results(max_results)
        
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet,statistics",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "key": youtube_api_key,
                "order": "viewCount",
                "videoDuration": "short",
                "publishedAfter": (datetime.now() - timedelta(days=self.trend_window_days)).isoformat() + "Z"
            }
            
            with httpx.Client(timeout=30.0) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("items", []):
                    stats = item.get("statistics", {})
                    view_count = int(stats.get("viewCount", 0))
                    
                    if view_count >= self.min_views_threshold:
                        results.append({
                            "video_id": item["id"]["videoId"],
                            "title": item["snippet"]["title"],
                            "description": item["snippet"]["description"],
                            "view_count": view_count,
                            "like_count": int(stats.get("likeCount", 0)),
                            "published_at": item["snippet"]["publishedAt"],
                            "channel": item["snippet"]["channelTitle"],
                            "duration": "short"
                        })
                
                return results
        except Exception as e:
            logger.error(f"Error searching YouTube Shorts: {e}")
            return self._mock_shorts_results(max_results)
    
    def _mock_shorts_results(self, max_results: int) -> List[Dict[str, Any]]:
        """Mock YouTube Shorts results for testing"""
        return [
            {
                "video_id": f"shorts_mock_{i}",
                "title": f"Trending Short {i}",
                "description": f"Mock trending short video {i}",
                "view_count": 50000 + (i * 10000),
                "like_count": 5000 + (i * 1000),
                "published_at": (datetime.now() - timedelta(days=i)).isoformat(),
                "channel": f"Channel {i}",
                "duration": "short"
            }
            for i in range(min(max_results, 5))
        ]
    
    def _analyze_video_characteristics(self, videos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze common characteristics of trending videos"""
        if not videos:
            return {}
        
        # Use AI Brain to analyze trends
        trend_analysis = self.brain.analyze_trends(videos)
        
        # Calculate statistics
        avg_views = sum(v.get("view_count", 0) for v in videos) / len(videos) if videos else 0
        avg_likes = sum(v.get("like_count", 0) for v in videos) / len(videos) if videos else 0
        
        return {
            "trend_analysis": trend_analysis,
            "statistics": {
                "sample_size": len(videos),
                "avg_views": avg_views,
                "avg_likes": avg_likes,
                "engagement_rate": (avg_likes / avg_views * 100) if avg_views > 0 else 0
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def track_trends(self) -> Dict[str, Any]:
        """
        Main method to track current trends
        
        Returns:
            Dictionary of current trend patterns
        """
        logger.info("Tracking current editing meta...")
        
        all_videos = []
        
        # Track YouTube Shorts
        if self.youtube_shorts_enabled:
            logger.info("Tracking YouTube Shorts trends...")
            shorts = self._search_youtube_shorts(max_results=20)
            all_videos.extend(shorts)
        
        # Track TikTok (if enabled)
        if self.tiktok_enabled:
            logger.info("TikTok tracking not fully implemented (requires API access)")
            # Would need TikTok API integration here
        
        if not all_videos:
            logger.warning("No trending videos found")
            return {}
        
        # Analyze characteristics
        analysis = self._analyze_video_characteristics(all_videos)
        
        # Load existing patterns
        patterns = self._load_patterns()
        
        # Add new trend entry
        trend_entry = {
            "timestamp": datetime.now().isoformat(),
            "videos_analyzed": len(all_videos),
            "analysis": analysis,
            "window_days": self.trend_window_days
        }
        
        patterns.setdefault("trends", []).append(trend_entry)
        
        # Keep only recent trends (within window)
        cutoff_date = datetime.now() - timedelta(days=self.trend_window_days * 2)
        patterns["trends"] = [
            t for t in patterns["trends"]
            if datetime.fromisoformat(t["timestamp"].replace("Z", "+00:00")) > cutoff_date
        ]
        
        # Update meta summary
        if analysis.get("trend_analysis"):
            patterns["meta_summary"] = analysis["trend_analysis"]
        
        patterns["version"] = patterns.get("version", 1) + 1
        self._save_patterns(patterns)
        
        logger.info(f"Tracked {len(all_videos)} trending videos")
        return patterns
    
    def get_current_meta(self) -> Dict[str, Any]:
        """
        Get current editing meta summary
        
        Returns:
            Current meta summary
        """
        patterns = self._load_patterns()
        return patterns.get("meta_summary", {})
