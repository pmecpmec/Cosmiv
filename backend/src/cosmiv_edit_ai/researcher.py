"""
Knowledge Collector - Researches editing tutorials and extracts rules
Uses YouTube Data API to find and analyze editing tutorials
"""

import json
import os
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime
import httpx
from .core.brain import AIBrain

logger = logging.getLogger(__name__)


class KnowledgeCollector:
    """Collects and processes editing knowledge from online tutorials"""
    
    def __init__(self, config_path: Optional[str] = None, brain: Optional[AIBrain] = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "core" / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.research_config = self.config.get("research", {})
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY", self.research_config.get("youtube_api_key", ""))
        self.search_queries = self.research_config.get("search_queries", [])
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.rules_file = self.data_dir / "editing_rules.json"
        self.brain = brain or AIBrain(config_path)
        
        # Initialize rules file if it doesn't exist
        if not self.rules_file.exists():
            self._initialize_rules()
    
    def _initialize_rules(self):
        """Initialize empty rules file"""
        initial_rules = {
            "version": 1,
            "last_updated": datetime.now().isoformat(),
            "rules": [],
            "sources": []
        }
        with open(self.rules_file, "w") as f:
            json.dump(initial_rules, f, indent=2)
    
    def _load_rules(self) -> Dict[str, Any]:
        """Load existing editing rules"""
        if not self.rules_file.exists():
            self._initialize_rules()
        
        with open(self.rules_file, "r") as f:
            return json.load(f)
    
    def _save_rules(self, rules: Dict[str, Any]):
        """Save editing rules to file"""
        rules["last_updated"] = datetime.now().isoformat()
        with open(self.rules_file, "w") as f:
            json.dump(rules, f, indent=2)
    
    def _search_youtube(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search YouTube for tutorials"""
        if not self.youtube_api_key:
            logger.warning("YouTube API key not configured, using mock data")
            return self._mock_youtube_results(query, max_results)
        
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "key": self.youtube_api_key,
                "order": "relevance"
            }
            
            with httpx.Client(timeout=30.0) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("items", []):
                    results.append({
                        "video_id": item["id"]["videoId"],
                        "title": item["snippet"]["title"],
                        "description": item["snippet"]["description"],
                        "published_at": item["snippet"]["publishedAt"],
                        "channel": item["snippet"]["channelTitle"]
                    })
                
                return results
        except Exception as e:
            logger.error(f"Error searching YouTube: {e}")
            return self._mock_youtube_results(query, max_results)
    
    def _mock_youtube_results(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """Mock YouTube results for testing"""
        return [
            {
                "video_id": f"mock_{i}",
                "title": f"{query} Tutorial {i}",
                "description": f"Mock tutorial description for {query}",
                "published_at": datetime.now().isoformat(),
                "channel": "Mock Channel"
            }
            for i in range(min(max_results, 3))
        ]
    
    def _get_video_transcript(self, video_id: str) -> str:
        """Get video transcript (simplified - would need YouTube Transcript API)"""
        # In production, use youtube-transcript-api or similar
        # For now, return mock transcript
        logger.warning(f"Transcript extraction not fully implemented for video {video_id}")
        return f"Mock transcript for video {video_id}. This would contain the actual tutorial content."
    
    def collect_tutorials(self) -> List[Dict[str, Any]]:
        """
        Collect tutorials based on search queries
        
        Returns:
            List of tutorial metadata
        """
        all_tutorials = []
        
        for query in self.search_queries:
            logger.info(f"Searching for tutorials: {query}")
            results = self._search_youtube(query, max_results=5)
            all_tutorials.extend(results)
        
        return all_tutorials
    
    def extract_rules_from_tutorials(self, tutorials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract editing rules from tutorial content
        
        Args:
            tutorials: List of tutorial metadata
            
        Returns:
            List of extracted editing rules
        """
        new_rules = []
        
        for tutorial in tutorials:
            try:
                # Get transcript or description
                content = tutorial.get("description", "")
                if not content:
                    content = self._get_video_transcript(tutorial["video_id"])
                
                # Use AI Brain to extract rules
                extracted = self.brain.extract_editing_rules(content)
                
                if extracted:
                    rule_entry = {
                        "source": {
                            "type": "youtube",
                            "video_id": tutorial["video_id"],
                            "title": tutorial["title"],
                            "channel": tutorial.get("channel", ""),
                            "published_at": tutorial.get("published_at", "")
                        },
                        "rules": extracted,
                        "extracted_at": datetime.now().isoformat()
                    }
                    new_rules.append(rule_entry)
                    logger.info(f"Extracted rules from: {tutorial['title']}")
            except Exception as e:
                logger.error(f"Error extracting rules from tutorial {tutorial.get('title', 'unknown')}: {e}")
        
        return new_rules
    
    def update_rules(self) -> bool:
        """
        Main method to collect tutorials and update rules
        
        Returns:
            True if new rules were added, False otherwise
        """
        logger.info("Starting knowledge collection...")
        
        # Collect tutorials
        tutorials = self.collect_tutorials()
        if not tutorials:
            logger.warning("No tutorials found")
            return False
        
        # Extract rules
        new_rules = self.extract_rules_from_tutorials(tutorials)
        if not new_rules:
            logger.warning("No rules extracted from tutorials")
            return False
        
        # Load existing rules
        existing_rules = self._load_rules()
        
        # Add new rules (avoid duplicates)
        existing_video_ids = {
            rule["source"]["video_id"]
            for rule in existing_rules.get("rules", [])
            if rule.get("source", {}).get("video_id")
        }
        
        added_count = 0
        for rule in new_rules:
            video_id = rule.get("source", {}).get("video_id")
            if video_id and video_id not in existing_video_ids:
                existing_rules.setdefault("rules", []).append(rule)
                existing_rules.setdefault("sources", []).append({
                    "type": "youtube",
                    "video_id": video_id,
                    "title": rule["source"]["title"],
                    "added_at": rule["extracted_at"]
                })
                added_count += 1
        
        if added_count > 0:
            existing_rules["version"] = existing_rules.get("version", 1) + 1
            self._save_rules(existing_rules)
            logger.info(f"Added {added_count} new rule sets")
            return True
        else:
            logger.info("No new rules to add")
            return False
