"""
AI Content Renewal Service
Continuously refreshes website content with AI-generated updates
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from db import get_session
from sqlmodel import select
from models_ai import ContentVersion, AITask
from services.ai_service import AIService
import json
import uuid

logger = logging.getLogger(__name__)
ai_service = AIService()


class ContentRenewalService:
    """Service for AI-powered content renewal"""

    def __init__(self):
        self.content_types = [
            "landing_hero",
            "landing_features",
            "landing_testimonials",
            "feature_descriptions",
            "blog_posts",
            "pricing_plans",
        ]

    def generate_content(
        self,
        content_type: str,
        context: Optional[Dict[str, Any]] = None,
        style: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate new content using AI

        Args:
            content_type: Type of content to generate
            context: Additional context for generation
            style: Content style/tonality
        """
        try:
            prompt = self._build_prompt(content_type, context, style)

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a professional content writer creating engaging, modern website content for an AI gaming montage platform called Cosmiv.",
                temperature=0.8,
            )

            # Parse response into structured content
            content_data = self._parse_content_response(response, content_type)

            return {
                "success": True,
                "content": content_data,
                "generated_at": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Content generation error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _build_prompt(
        self, content_type: str, context: Optional[Dict], style: Optional[str]
    ) -> str:
        """Build AI prompt for content generation"""
        base_prompts = {
            "landing_hero": """Create a compelling hero section for Cosmiv - an AI gaming montage platform.
            Include:
            - A catchy headline (10-15 words)
            - A subheadline describing the value proposition
            - A call-to-action text
            
            Make it modern, bold, and appealing to gamers and content creators.""",
            "landing_features": """Create feature descriptions for Cosmiv's main features:
            1. AI-Powered Highlight Detection
            2. Automatic Editing & Transitions
            3. Social Media Auto-Posting
            4. Weekly Montage Compilation
            5. Platform Integrations (Steam, Xbox, etc.)
            6. Real-Time Analytics
            
            For each feature, provide a title (5-10 words) and description (2-3 sentences).""",
            "landing_testimonials": """Generate 3-4 fake testimonials (but make them realistic) for Cosmiv users.
            Each should include:
            - User name and role (e.g., "Alex, Professional Streamer")
            - Quote (2-3 sentences)
            - A rating/impact statement
            
            Keep it authentic-sounding and focused on the platform's benefits.""",
            "blog_posts": """Generate a blog post idea and outline for Cosmiv's blog.
            Topic should be relevant to gaming, video editing, or content creation.
            Include:
            - Title
            - Introduction (3-4 sentences)
            - 3-4 main points with brief descriptions
            - Conclusion (2-3 sentences)""",
        }

        prompt = base_prompts.get(
            content_type, f"Create engaging content for: {content_type}"
        )

        if context:
            prompt += f"\n\nContext: {json.dumps(context, indent=2)}"

        if style:
            prompt += f"\n\nStyle: {style}"

        return prompt

    def _parse_content_response(
        self, response: str, content_type: str
    ) -> Dict[str, Any]:
        """Parse AI response into structured content data"""
        # Simple parsing - in production, use more sophisticated parsing or structured outputs
        return {
            "text": response,
            "content_type": content_type,
            "parsed_at": datetime.utcnow().isoformat(),
        }

    def renew_content(
        self, content_id: str, content_type: str, force: bool = False
    ) -> Dict[str, Any]:
        """
        Renew existing content with AI-generated version

        Args:
            content_id: ID of content to renew
            content_type: Type of content
            force: Force renewal even if recent version exists
        """
        try:
            with get_session() as session:
                # Check if recent version exists
                if not force:
                    recent = session.exec(
                        select(ContentVersion)
                        .where(ContentVersion.content_id == content_id)
                        .where(
                            ContentVersion.created_at
                            > datetime.utcnow() - timedelta(days=7)
                        )
                        .order_by(ContentVersion.version.desc())
                    ).first()

                    if recent:
                        return {
                            "success": True,
                            "message": "Recent version exists, skipping renewal",
                            "version": recent.version,
                        }

                # Get latest version for context
                latest = session.exec(
                    select(ContentVersion)
                    .where(ContentVersion.content_id == content_id)
                    .order_by(ContentVersion.version.desc())
                ).first()

                context = None
                if latest:
                    context = {
                        "previous_version": (
                            json.loads(latest.content_data)
                            if latest.content_data
                            else {}
                        )
                    }

                # Generate new content
                result = self.generate_content(content_type, context)

                if not result.get("success"):
                    return result

                # Create new version
                new_version_num = (latest.version + 1) if latest else 1
                new_version = ContentVersion(
                    content_id=content_id,
                    content_type=content_type,
                    version=new_version_num,
                    content_data=json.dumps(result["content"]),
                    generated_by="ai",
                    status="draft",
                    created_at=datetime.utcnow(),
                )

                session.add(new_version)
                session.commit()
                session.refresh(new_version)

                # Create AI task record
                task_id = str(uuid.uuid4())
                task = AITask(
                    task_id=task_id,
                    task_type="content_renewal",
                    status="completed",
                    input_data=json.dumps(
                        {"content_id": content_id, "content_type": content_type}
                    ),
                    output_data=json.dumps(
                        {"version_id": new_version.id, "version": new_version_num}
                    ),
                    completed_at=datetime.utcnow(),
                )
                session.add(task)
                session.commit()

                return {
                    "success": True,
                    "version": new_version_num,
                    "content": result["content"],
                    "task_id": task_id,
                }
        except Exception as e:
            logger.error(f"Content renewal error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def schedule_renewals(self) -> Dict[str, Any]:
        """Schedule automatic content renewals based on performance"""
        try:
            with get_session() as session:
                # Find content that needs renewal (low performance or old)
                stale_content = session.exec(
                    select(ContentVersion).where(
                        ContentVersion.status == "published",
                        ContentVersion.created_at
                        < datetime.utcnow() - timedelta(days=30),
                    )
                ).all()

                renewed = []
                for content in stale_content:
                    result = self.renew_content(
                        content.content_id, content.content_type
                    )
                    if result.get("success"):
                        renewed.append(content.content_id)

                return {
                    "success": True,
                    "renewed_count": len(renewed),
                    "renewed_content": renewed,
                }
        except Exception as e:
            logger.error(f"Scheduled renewal error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def get_latest_version(self, content_id: str) -> Optional[ContentVersion]:
        """Get the latest version of content"""
        with get_session() as session:
            return session.exec(
                select(ContentVersion)
                .where(ContentVersion.content_id == content_id)
                .order_by(ContentVersion.version.desc())
            ).first()

    def publish_version(self, content_id: str, version: int) -> bool:
        """Publish a content version"""
        try:
            with get_session() as session:
                version_obj = session.exec(
                    select(ContentVersion).where(
                        ContentVersion.content_id == content_id,
                        ContentVersion.version == version,
                    )
                ).first()

                if not version_obj:
                    return False

                # Unpublish other versions
                session.exec(
                    select(ContentVersion).where(
                        ContentVersion.content_id == content_id,
                        ContentVersion.status == "published",
                    )
                ).all()
                # Update all to archived
                for v in session.exec(
                    select(ContentVersion).where(
                        ContentVersion.content_id == content_id,
                        ContentVersion.status == "published",
                    )
                ).all():
                    v.status = "archived"
                    session.add(v)

                # Publish new version
                version_obj.status = "published"
                version_obj.published_at = datetime.utcnow()
                session.add(version_obj)
                session.commit()

                return True
        except Exception as e:
            logger.error(f"Publish version error: {e}")
            return False


# Global instance
content_renewal_service = ContentRenewalService()
