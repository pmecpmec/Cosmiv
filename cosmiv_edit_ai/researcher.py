"""
Knowledge Collector - Researches video editing tutorials and extracts actionable rules
"""
import os
import json
import re
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import openai
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound


class Researcher:
    """Collects knowledge from YouTube tutorials and extracts editing rules"""
    
    def __init__(self, config_path: str = "core/config.json"):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY") or self.config.get("youtube_api_key", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY") or self.config.get("openai_api_key", "")
        self.data_dir = Path(self.config.get("data_dir", "data"))
        self.rules_file = self.data_dir / "editing_rules.json"
        
        if self.youtube_api_key:
            self.youtube = build('youtube', 'v3', developerKey=self.youtube_api_key)
        else:
            self.youtube = None
            print("Warning: YouTube API key not set. Research functionality will be limited.")
        
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        else:
            print("Warning: OpenAI API key not set. Will use basic rule extraction.")
    
    def search_tutorials(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search YouTube for tutorial videos"""
        if not self.youtube:
            print("YouTube API not available")
            return []
        
        try:
            request = self.youtube.search().list(
                part="snippet",
                q=query,
                type="video",
                maxResults=max_results,
                order="relevance",
                videoDuration="medium",  # 4-20 minutes
                videoDefinition="high"
            )
            response = request.execute()
            
            videos = []
            for item in response.get('items', []):
                videos.append({
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'channel': item['snippet']['channelTitle'],
                    'published_at': item['snippet']['publishedAt']
                })
            return videos
        except HttpError as e:
            print(f"YouTube API error: {e}")
            return []
    
    def get_transcript(self, video_id: str) -> Optional[str]:
        """Get transcript for a YouTube video"""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get English transcript first
            try:
                transcript = transcript_list.find_transcript(['en'])
            except:
                # Fallback to first available
                transcript = transcript_list.find_generated_transcript(['en'])
            
            transcript_data = transcript.fetch()
            full_text = ' '.join([item['text'] for item in transcript_data])
            return full_text
        except (TranscriptsDisabled, NoTranscriptFound):
            print(f"No transcript available for video {video_id}")
            return None
        except Exception as e:
            print(f"Error getting transcript: {e}")
            return None
    
    def extract_rules_with_llm(self, transcript: str) -> Dict:
        """Use OpenAI to extract actionable editing rules from transcript"""
        if not self.openai_api_key:
            return self._extract_rules_basic(transcript)
        
        try:
            client = openai.OpenAI(api_key=self.openai_api_key)
            prompt = f"""Analyze this video editing tutorial transcript and extract actionable editing rules.
            
Transcript:
{transcript[:4000]}

Extract and return a JSON object with these categories:
- cut_timing: rules about when to cut (thresholds, beat sync, etc.)
- pacing: rules about video pacing (hook duration, action segments, etc.)
- transitions: types of transitions and when to use them
- text_styles: subtitle and text styling rules
- effects: visual effects and their parameters

Return only valid JSON, no markdown formatting."""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert video editing analyst. Extract precise, actionable rules from tutorials."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content.strip()
            # Remove markdown code blocks if present
            content = re.sub(r'```json\n?', '', content)
            content = re.sub(r'```\n?', '', content)
            
            rules = json.loads(content)
            return rules
        except Exception as e:
            print(f"LLM extraction error: {e}, falling back to basic extraction")
            return self._extract_rules_basic(transcript)
    
    def _extract_rules_basic(self, transcript: str) -> Dict:
        """Basic rule extraction using keyword matching"""
        rules = {
            "cut_timing": {},
            "pacing": {},
            "transitions": {},
            "text_styles": {},
            "effects": {}
        }
        
        transcript_lower = transcript.lower()
        
        # Extract cut timing mentions
        if "beat" in transcript_lower and "cut" in transcript_lower:
            rules["cut_timing"]["beat_sync"] = True
        
        # Extract transition mentions
        transitions = ["cut", "fade", "zoom", "whip", "glitch", "dissolve"]
        found_transitions = [t for t in transitions if t in transcript_lower]
        if found_transitions:
            rules["transitions"]["mentioned"] = found_transitions
        
        # Extract subtitle mentions
        if "subtitle" in transcript_lower or "caption" in transcript_lower:
            rules["text_styles"]["enabled"] = True
        
        return rules
    
    def merge_rules(self, new_rules: Dict, existing_rules: Dict) -> Dict:
        """Merge new rules into existing rules with weighted averaging"""
        learning_rate = self.config.get("learning_rate", 0.3)
        
        merged = existing_rules.copy()
        
        for category, rules in new_rules.items():
            if category not in merged.get("rules", {}):
                merged.setdefault("rules", {})[category] = {}
            
            for key, value in rules.items():
                if isinstance(value, (int, float)) and key in merged["rules"][category]:
                    # Weighted average for numeric values
                    old_value = merged["rules"][category][key]
                    merged["rules"][category][key] = old_value * (1 - learning_rate) + value * learning_rate
                elif isinstance(value, bool):
                    # For booleans, use new value if it's True (more permissive)
                    if value:
                        merged["rules"][category][key] = value
                elif isinstance(value, list):
                    # Merge lists
                    existing_list = merged["rules"][category].get(key, [])
                    merged["rules"][category][key] = list(set(existing_list + value))
                else:
                    # Direct assignment for new keys
                    merged["rules"][category][key] = value
        
        return merged
    
    def research_and_update(self) -> Dict:
        """Main research function - searches tutorials and updates rules"""
        print("🔍 Starting research phase...")
        
        queries = self.config.get("research_queries", [])
        all_new_rules = {}
        
        for query in queries:
            print(f"  Searching: {query}")
            videos = self.search_tutorials(query, max_results=5)
            
            for video in videos:
                print(f"    Analyzing: {video['title']}")
                transcript = self.get_transcript(video['video_id'])
                
                if transcript:
                    rules = self.extract_rules_with_llm(transcript)
                    # Merge rules from this video
                    for category, category_rules in rules.items():
                        if category not in all_new_rules:
                            all_new_rules[category] = {}
                        all_new_rules[category].update(category_rules)
        
        # Load existing rules
        if self.rules_file.exists():
            with open(self.rules_file, 'r') as f:
                existing_rules = json.load(f)
        else:
            existing_rules = {"version": "1.0.0", "rules": {}, "last_updated": None}
        
        # Merge new rules
        updated_rules = self.merge_rules(all_new_rules, existing_rules)
        updated_rules["last_updated"] = datetime.now().isoformat()
        updated_rules["version"] = str(float(updated_rules.get("version", "1.0")) + 0.1)
        
        # Save updated rules
        with open(self.rules_file, 'w') as f:
            json.dump(updated_rules, f, indent=2)
        
        print(f"✅ Research complete. Updated {len(all_new_rules)} rule categories.")
        return updated_rules


if __name__ == "__main__":
    researcher = Researcher()
    researcher.research_and_update()
