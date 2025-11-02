"""
Unified AI Service for Aiditor Platform
Supports multiple AI providers: OpenAI, Anthropic, and local models
"""
import os
import logging
from typing import Optional, Dict, Any, List
from enum import Enum
from config import settings

logger = logging.getLogger(__name__)


class AIProvider(str, Enum):
    """Supported AI providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


class AIService:
    """
    Unified AI service that can use different providers
    Supports: ChatGPT (OpenAI), Claude (Anthropic), or local models
    """
    
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.openai_api_key = settings.OPENAI_API_KEY
        self.anthropic_api_key = settings.ANTHROPIC_API_KEY
        self.default_model = settings.AI_DEFAULT_MODEL
        
        # Initialize provider-specific clients
        self._client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the appropriate AI client"""
        if self.provider == AIProvider.OPENAI:
            try:
                import openai
                if self.openai_api_key:
                    self._client = openai.OpenAI(api_key=self.openai_api_key)
                    logger.info("✅ OpenAI client initialized")
                else:
                    logger.warning("⚠️ OpenAI API key not set, using mock mode")
            except ImportError:
                logger.warning("⚠️ OpenAI package not installed, using mock mode")
        
        elif self.provider == AIProvider.ANTHROPIC:
            try:
                import anthropic
                if self.anthropic_api_key:
                    self._client = anthropic.Anthropic(api_key=self.anthropic_api_key)
                    logger.info("✅ Anthropic client initialized")
                else:
                    logger.warning("⚠️ Anthropic API key not set, using mock mode")
            except ImportError:
                logger.warning("⚠️ Anthropic package not installed, using mock mode")
        
        else:
            logger.info("ℹ️ Using local/mock AI provider")
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        Send a chat message and get AI response
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (overrides default)
            temperature: Creativity level (0.0-1.0)
            max_tokens: Maximum tokens in response
            system_prompt: System instruction for the AI
        
        Returns:
            AI response text
        """
        model = model or self.default_model
        
        # Build messages with system prompt if provided
        chat_messages = []
        if system_prompt:
            chat_messages.append({"role": "system", "content": system_prompt})
        chat_messages.extend(messages)
        
        try:
            if self.provider == AIProvider.OPENAI and self._client:
                response = self._client.chat.completions.create(
                    model=model,
                    messages=chat_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message.content
            
            elif self.provider == AIProvider.ANTHROPIC and self._client:
                # Anthropic uses different message format
                system_msg = system_prompt if system_prompt else ""
                user_messages = [m for m in chat_messages if m["role"] != "system"]
                
                response = self._client.messages.create(
                    model=model or "claude-3-opus-20240229",
                    max_tokens=max_tokens or 1024,
                    system=system_msg,
                    messages=user_messages,
                    temperature=temperature,
                )
                return response.content[0].text
            
            else:
                # Mock response for development
                return self._mock_response(messages[-1].get("content", ""))
        
        except Exception as e:
            logger.error(f"AI chat error: {str(e)}", exc_info=True)
            return f"I apologize, but I encountered an error. Please try again later. ({str(e)})"
    
    def generate_code(
        self,
        prompt: str,
        language: str = "python",
        context: Optional[str] = None,
    ) -> str:
        """
        Generate code based on a natural language prompt
        
        Args:
            prompt: Description of what code to generate
            language: Programming language (python, javascript, typescript, etc.)
            context: Additional context about existing codebase
        
        Returns:
            Generated code
        """
        system_prompt = f"""You are an expert {language} developer. 
Generate clean, production-ready code based on the user's request.
Follow best practices, include proper error handling, and add helpful comments.
"""
        
        if context:
            system_prompt += f"\nContext:\n{context}\n"
        
        user_prompt = f"Generate {language} code for: {prompt}"
        
        return self.chat(
            messages=[{"role": "user", "content": user_prompt}],
            system_prompt=system_prompt,
            temperature=0.3,  # Lower temperature for code generation
        )
    
    def improve_ui(
        self,
        current_ui_description: str,
        improvement_request: str,
    ) -> Dict[str, Any]:
        """
        Suggest UI/UX improvements
        
        Args:
            current_ui_description: Description of current UI
            improvement_request: What to improve
        
        Returns:
            Dict with suggestions, code changes, explanations
        """
        system_prompt = """You are a UX/UI expert specializing in modern web design.
Provide actionable suggestions for improving user interfaces.
Consider accessibility, modern design trends, and user experience best practices.
"""
        
        prompt = f"""
Current UI: {current_ui_description}

Improvement Request: {improvement_request}

Please provide:
1. Specific UI/UX improvements
2. Code suggestions (React/TailwindCSS if applicable)
3. Rationale for each change
"""
        
        response = self.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt=system_prompt,
            temperature=0.7,
        )
        
        return {
            "suggestions": response,
            "raw_response": response,
        }
    
    def renew_content(
        self,
        content_type: str,
        current_content: str,
        style: Optional[str] = None,
    ) -> str:
        """
        Renew/refresh website content automatically
        
        Args:
            content_type: Type of content (landing_page, feature_description, etc.)
            current_content: Current content
            style: Writing style (professional, casual, technical, etc.)
        
        Returns:
            Renewed content
        """
        style = style or "professional and modern"
        
        system_prompt = f"""You are a professional copywriter specializing in {style} web content.
Create engaging, conversion-focused content that maintains brand voice.
"""
        
        prompt = f"""
Content Type: {content_type}
Current Content: {current_content}

Please renew this content to be fresh, engaging, and modern while maintaining the core message.
"""
        
        return self.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt=system_prompt,
            temperature=0.8,
        )
    
    def enhance_video_editing(
        self,
        video_description: str,
        editing_style: str = "cinematic",
    ) -> Dict[str, Any]:
        """
        Provide AI suggestions for video editing
        
        Args:
            video_description: Description of video content
            editing_style: Desired editing style
        
        Returns:
            Dict with editing suggestions, transitions, effects, etc.
        """
        system_prompt = """You are an expert video editor specializing in gaming montages and highlight reels.
Provide detailed editing suggestions including cuts, transitions, effects, pacing, and music sync points.
"""
        
        prompt = f"""
Video Content: {video_description}
Editing Style: {editing_style}

Provide detailed editing suggestions:
1. Optimal cut points
2. Transition recommendations
3. Effect suggestions (speed ramps, color grading, etc.)
4. Music sync moments
5. Pacing recommendations
"""
        
        response = self.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt=system_prompt,
            temperature=0.6,
        )
        
        return {
            "suggestions": response,
            "style": editing_style,
        }
    
    def generate_music_prompt(
        self,
        video_description: str,
        mood: str = "energetic",
        genre: Optional[str] = None,
    ) -> str:
        """
        Generate music generation prompt for AI DJ
        
        Args:
            video_description: Description of video content
            mood: Desired mood (energetic, calm, epic, etc.)
            genre: Music genre (electronic, rock, etc.)
        
        Returns:
            Detailed prompt for music generation
        """
        system_prompt = """You are an AI music producer specializing in gaming montage soundtracks.
Create detailed prompts for generating copyright-free, high-energy music that syncs with gameplay highlights.
"""
        
        prompt = f"""
Video: {video_description}
Mood: {mood}
Genre: {genre or "gaming electronic"}

Generate a detailed music prompt for creating a soundtrack that:
- Matches the energy and mood
- Has clear beat structure for video sync
- Is copyright-free and original
- Fits gaming montage style
"""
        
        return self.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt=system_prompt,
            temperature=0.7,
        )
    
    def _mock_response(self, user_message: str) -> str:
        """Mock AI response for development/testing"""
        return f"[MOCK AI] I understand you're asking about: {user_message[:100]}. " \
               "To enable real AI responses, please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variables."

