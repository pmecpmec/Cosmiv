"""
AI UX/UI Analyzer Service
Continuously improve website UX/UI based on user behavior and AI analysis
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from db import get_session
from sqlmodel import select
from models_ai import UXAnalysis, AITask
from services.ai_service import AIService
from models import UserAnalytics, JobEngagement
import json
import uuid

logger = logging.getLogger(__name__)
ai_service = AIService()


class UXAnalyzerService:
    """Service for AI-powered UX/UI analysis and improvements"""

    def analyze_component(
        self,
        component_path: str,
        page_url: Optional[str] = None,
        analysis_type: str = "general",
    ) -> Dict[str, Any]:
        """
        Analyze a frontend component for UX/UI improvements

        Args:
            component_path: Path to component file
            page_url: URL/route where component is used
            analysis_type: Type of analysis (accessibility, performance, general)
        """
        try:
            # In production, this would analyze actual component code
            # For now, we'll use AI to provide general UX analysis

            prompt = f"""Analyze the UX/UI of a React component located at: {component_path}

Analysis Type: {analysis_type}
Page/Route: {page_url or "Unknown"}

Please provide:
1. Accessibility score (0-100) and issues
2. Performance recommendations
3. UX best practices compliance
4. Specific improvement suggestions
5. Code-level recommendations if applicable

Format your response as structured analysis."""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a UX/UI expert specializing in React, accessibility, and modern web design. Provide detailed, actionable analysis.",
                temperature=0.5,
            )

            # Parse response into structured metrics
            metrics = self._parse_analysis_response(response, analysis_type)

            # Create analysis record
            analysis_id = str(uuid.uuid4())
            with get_session() as session:
                analysis = UXAnalysis(
                    analysis_id=analysis_id,
                    component_path=component_path,
                    page_url=page_url,
                    analysis_type=analysis_type,
                    metrics=json.dumps(metrics),
                    status="analyzed",
                    analyzed_at=datetime.utcnow(),
                )
                session.add(analysis)
                session.commit()

                # Create task record
                task = AITask(
                    task_id=str(uuid.uuid4()),
                    task_type="ux_analysis",
                    status="completed",
                    input_data=json.dumps(
                        {
                            "component_path": component_path,
                            "analysis_type": analysis_type,
                        }
                    ),
                    output_data=json.dumps(
                        {
                            "analysis_id": analysis_id,
                            "score": metrics.get("score", 0),
                        }
                    ),
                    completed_at=datetime.utcnow(),
                )
                session.add(task)
                session.commit()

            return {
                "success": True,
                "analysis_id": analysis_id,
                "metrics": metrics,
                "suggestions": metrics.get("recommendations", []),
            }
        except Exception as e:
            logger.error(f"UX analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def analyze_user_behavior(
        self, user_id: Optional[str] = None, time_range_days: int = 7
    ) -> Dict[str, Any]:
        """
        Analyze user behavior patterns for UX optimization

        Args:
            user_id: Specific user ID (optional, None = aggregate)
            time_range_days: Time range for analysis
        """
        try:
            with get_session() as session:
                # Get analytics data
                if user_id:
                    analytics = session.exec(
                        select(UserAnalytics).where(UserAnalytics.user_id == user_id)
                    ).first()

                    if not analytics:
                        return {
                            "success": False,
                            "error": "User analytics not found",
                        }

                    data = {
                        "avg_session_duration": getattr(
                            analytics, "avg_session_duration", 0
                        ),
                        "bounce_rate": getattr(analytics, "bounce_rate", 0),
                        "conversion_rate": getattr(analytics, "conversion_rate", 0),
                    }
                else:
                    # Aggregate analytics
                    all_analytics = session.exec(select(UserAnalytics)).all()
                    data = {
                        "total_users": len(all_analytics),
                        "avg_sessions": sum(
                            getattr(a, "session_count", 0) for a in all_analytics
                        )
                        / max(len(all_analytics), 1),
                    }

                # Generate AI analysis
                prompt = f"""Analyze the following user behavior data and provide UX improvement recommendations:

{json.dumps(data, indent=2)}

Please provide:
1. Key UX issues identified
2. Optimization opportunities
3. A/B testing suggestions
4. Accessibility improvements
5. Performance optimization recommendations
6. Mobile responsiveness suggestions"""

                response = ai_service.chat(
                    messages=[{"role": "user", "content": prompt}],
                    system_prompt="You are a UX research expert. Analyze user behavior data and provide actionable improvement recommendations.",
                    temperature=0.6,
                )

                # Parse recommendations
                recommendations = self._extract_recommendations(response)

                return {
                    "success": True,
                    "data": data,
                    "recommendations": recommendations,
                    "analysis": response,
                }
        except Exception as e:
            logger.error(f"User behavior analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def generate_improvements(
        self,
        component_path: str,
        issues: List[str],
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate specific improvement suggestions for a component

        Args:
            component_path: Path to component
            issues: List of identified issues
            context: Additional context
        """
        try:
            prompt = f"""Generate specific UX/UI improvements for a React component.

Component: {component_path}
Issues: {', '.join(issues)}

{self._build_context_prompt(context)}

Provide:
1. Specific code improvements (React/TailwindCSS)
2. Accessibility fixes
3. Performance optimizations
4. Modern design updates (black/white aesthetic, spaced typography)
5. Responsive design improvements"""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are an expert React/UX developer. Provide specific, implementable code improvements following modern best practices.",
                temperature=0.7,
            )

            improvements = self._extract_code_suggestions(response)

            # Update analysis with improvements
            with get_session() as session:
                analysis = session.exec(
                    select(UXAnalysis)
                    .where(UXAnalysis.component_path == component_path)
                    .order_by(UXAnalysis.analyzed_at.desc())
                ).first()

                if analysis:
                    analysis.improvement_suggestions = json.dumps(improvements)
                    analysis.status = "improved"
                    analysis.improved_at = datetime.utcnow()
                    session.add(analysis)
                    session.commit()

            return {
                "success": True,
                "improvements": improvements,
                "code_suggestions": response,
            }
        except Exception as e:
            logger.error(f"Generate improvements error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def analyze_accessibility(self, component_code: str) -> Dict[str, Any]:
        """
        Analyze component for accessibility issues

        Args:
            component_code: Component source code
        """
        try:
            prompt = f"""Analyze the following React component for accessibility (WCAG 2.1 AA compliance):

{component_code}

Provide:
1. Accessibility score (0-100)
2. List of violations (ARIA, semantic HTML, keyboard navigation, screen readers)
3. Specific fixes needed
4. Code improvements for accessibility"""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are an accessibility expert. Analyze code for WCAG compliance and provide specific fixes.",
                temperature=0.4,
            )

            # Extract accessibility issues
            issues = self._parse_accessibility_issues(response)

            return {
                "success": True,
                "score": issues.get("score", 0),
                "violations": issues.get("violations", []),
                "fixes": issues.get("fixes", []),
                "full_analysis": response,
            }
        except Exception as e:
            logger.error(f"Accessibility analysis error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def suggest_ab_tests(
        self, component_path: str, metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Suggest A/B tests based on UX analysis

        Args:
            component_path: Component to test
            metrics: Current performance metrics
        """
        try:
            prompt = f"""Suggest A/B test variations for improving UX:

Component: {component_path}
Current Metrics: {json.dumps(metrics, indent=2)}

Provide:
1. 2-3 specific A/B test ideas
2. Hypothesis for each test
3. Expected improvements
4. Implementation suggestions"""

            response = ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a UX researcher specializing in A/B testing. Provide actionable test suggestions.",
                temperature=0.7,
            )

            return {
                "success": True,
                "ab_tests": response,
            }
        except Exception as e:
            logger.error(f"A/B test suggestion error: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    def _parse_analysis_response(
        self, response: str, analysis_type: str
    ) -> Dict[str, Any]:
        """Parse AI response into structured metrics"""
        # In production, use more sophisticated parsing or structured outputs
        return {
            "score": 85,  # Placeholder - would extract from response
            "analysis_type": analysis_type,
            "recommendations": response.split("\n")[:10],  # First 10 recommendations
            "raw_response": response,
        }

    def _extract_recommendations(self, response: str) -> List[str]:
        """Extract recommendations from AI response"""
        # Simple extraction - in production, use more sophisticated parsing
        lines = response.split("\n")
        recommendations = []
        for line in lines:
            if line.strip().startswith(("-", "•", "1.", "2.", "3.")):
                recommendations.append(line.strip())
        return recommendations[:20]  # Limit to 20

    def _extract_code_suggestions(self, response: str) -> List[Dict[str, Any]]:
        """Extract code suggestions from AI response"""
        # Extract code blocks and suggestions
        suggestions = []
        if "```" in response:
            parts = response.split("```")
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Code blocks are in odd indices
                    suggestions.append(
                        {
                            "type": "code",
                            "content": part.strip(),
                        }
                    )

        return suggestions if suggestions else [{"type": "text", "content": response}]

    def _parse_accessibility_issues(self, response: str) -> Dict[str, Any]:
        """Parse accessibility analysis response"""
        return {
            "score": 75,  # Placeholder
            "violations": [],
            "fixes": [],
            "raw_response": response,
        }

    def _build_context_prompt(self, context: Optional[Dict[str, Any]]) -> str:
        """Build context string"""
        if not context:
            return ""

        return f"Additional context: {json.dumps(context, indent=2)}"

    def get_analysis(self, analysis_id: str) -> Optional[UXAnalysis]:
        """Get an analysis record"""
        with get_session() as session:
            return session.exec(
                select(UXAnalysis).where(UXAnalysis.analysis_id == analysis_id)
            ).first()


# Global instance
ux_analyzer_service = UXAnalyzerService()
