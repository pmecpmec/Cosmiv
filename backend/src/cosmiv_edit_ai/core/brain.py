"""
AI Brain - Handles communication with hosted LLM models
Supports RunPod, Vast.ai, Lambda Labs, or local models
"""

import json
import os
import httpx
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class AIBrain:
    """Manages API calls to hosted LLM models for editing decisions"""
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config.json"
        
        with open(config_path, "r") as f:
            self.config = json.load(f)
        
        self.model_config = self.config.get("model", {})
        self.api_endpoint = os.getenv("COSMIV_AI_ENDPOINT", self.model_config.get("api_endpoint", ""))
        self.api_key = os.getenv("COSMIV_AI_API_KEY", self.model_config.get("api_key", ""))
        self.provider = self.model_config.get("provider", "runpod")
        self.base_model = self.model_config.get("base_model", "mistral-7b-instruct")
        self.temperature = self.model_config.get("temperature", 0.7)
        self.max_tokens = self.model_config.get("max_tokens", 2048)
        
    def _call_runpod(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Call RunPod API endpoint"""
        if not self.api_endpoint:
            raise ValueError("RunPod API endpoint not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}" if self.api_key else ""
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.base_model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(self.api_endpoint, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                # Handle different response formats
                if "choices" in result:
                    return result["choices"][0]["message"]["content"]
                elif "output" in result:
                    return result["output"]
                elif "text" in result:
                    return result["text"]
                else:
                    return str(result)
        except Exception as e:
            logger.error(f"Error calling RunPod API: {e}")
            raise
    
    def _call_openai_compatible(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Call OpenAI-compatible API (works with Vast.ai, Lambda Labs, etc.)"""
        if not self.api_endpoint:
            raise ValueError("API endpoint not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}" if self.api_key else ""
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.base_model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(self.api_endpoint, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    return str(result)
        except Exception as e:
            logger.error(f"Error calling API: {e}")
            raise
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generate a response from the AI model
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt for context
            
        Returns:
            Generated text response
        """
        if self.provider == "runpod":
            return self._call_runpod(prompt, system_prompt)
        else:
            # Default to OpenAI-compatible format
            return self._call_openai_compatible(prompt, system_prompt)
    
    def extract_editing_rules(self, tutorial_content: str) -> Dict[str, Any]:
        """
        Extract editing rules from tutorial content
        
        Args:
            tutorial_content: Text content from tutorial
            
        Returns:
            Dictionary of extracted editing rules
        """
        system_prompt = """You are an expert video editing analyst. Extract actionable editing rules from tutorial content.
Return a JSON object with the following structure:
{
  "cut_rhythm": "description of cut timing patterns",
  "text_overlays": "description of text/subtitle patterns",
  "color_grading": "description of color grade preferences",
  "sound_transitions": "description of audio transition patterns",
  "pace": "fast/medium/slow",
  "key_techniques": ["list", "of", "techniques"]
}"""
        
        prompt = f"""Analyze this video editing tutorial and extract editing rules:

{tutorial_content}

Extract the key editing principles and return as JSON."""
        
        try:
            response = self.generate(prompt, system_prompt)
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback: return structured response
                return {
                    "cut_rhythm": "extracted from tutorial",
                    "text_overlays": "extracted from tutorial",
                    "color_grading": "extracted from tutorial",
                    "sound_transitions": "extracted from tutorial",
                    "pace": "fast",
                    "key_techniques": ["extracted techniques"]
                }
        except Exception as e:
            logger.error(f"Error extracting editing rules: {e}")
            return {}
    
    def analyze_trends(self, trend_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze trend data and generate insights
        
        Args:
            trend_data: List of trend observations
            
        Returns:
            Dictionary of trend insights
        """
        system_prompt = """You are a video editing trend analyst. Analyze trend data and identify patterns.
Return a JSON object with:
{
  "current_meta": "description of current editing meta",
  "pacing_trend": "description of pacing trends",
  "subtitle_frequency": "description of subtitle patterns",
  "filter_usage": "description of filter trends",
  "recommendations": ["list", "of", "recommendations"]
}"""
        
        prompt = f"""Analyze these video editing trends:

{json.dumps(trend_data, indent=2)}

Identify the current editing meta and provide recommendations."""
        
        try:
            response = self.generate(prompt, system_prompt)
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    "current_meta": "analyzed from trends",
                    "pacing_trend": "analyzed",
                    "subtitle_frequency": "analyzed",
                    "filter_usage": "analyzed",
                    "recommendations": ["recommendations"]
                }
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {}
