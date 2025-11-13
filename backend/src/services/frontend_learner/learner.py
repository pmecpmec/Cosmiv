"""
Pattern Learner for Frontend Learning
Detects design trends and generates design principles
"""

import json
import logging
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

from db import get_session
from models_ai import FrontendPattern, DesignTrend
from sqlmodel import select

logger = logging.getLogger(__name__)


class PatternLearner:
    """
    Learns design trends from extracted patterns
    Generates design principles and trend analytics
    """

    def __init__(
        self,
        principles_file: str = "knowledge/design_principles.json",
        trend_window_days: int = 30,
    ):
        """
        Initialize the learner

        Args:
            principles_file: Path to save design principles JSON
            trend_window_days: Days to look back for trend detection
        """
        self.principles_file = Path(principles_file)
        self.principles_file.parent.mkdir(parents=True, exist_ok=True)
        self.trend_window_days = trend_window_days

    def _load_patterns_from_db(self, limit: Optional[int] = None) -> List[FrontendPattern]:
        """Load patterns from database"""
        try:
            with get_session() as session:
                from sqlmodel import select

                query = select(FrontendPattern)
                if limit:
                    query = query.limit(limit)

                patterns = session.exec(query).all()
                return list(patterns)
        except Exception as e:
            logger.error(f"Failed to load patterns from database: {e}")
            return []

    def _analyze_color_trends(self, patterns: List[FrontendPattern]) -> List[Dict[str, Any]]:
        """Analyze color palette trends"""
        color_combinations: Counter = Counter()
        individual_colors: Counter = Counter()

        for pattern in patterns:
            if pattern.colors:
                try:
                    colors = json.loads(pattern.colors)
                    if isinstance(colors, list) and len(colors) >= 2:
                        # Track color combinations (sorted for consistency)
                        color_key = tuple(sorted(colors[:5]))  # Limit to 5 colors
                        color_combinations[color_key] += 1

                    # Track individual colors
                    for color in colors[:10]:  # Limit per pattern
                        individual_colors[color.upper()] += 1
                except Exception:
                    pass

        # Get top color combinations
        trends = []
        for combo, count in color_combinations.most_common(10):
            popularity = count / max(len(patterns), 1)
            trends.append(
                {
                    "name": f"Color Palette {len(trends) + 1}",
                    "colors": list(combo),
                    "popularity_score": min(popularity, 1.0),
                    "detected_count": count,
                }
            )

        return trends

    def _analyze_font_trends(self, patterns: List[FrontendPattern]) -> List[Dict[str, Any]]:
        """Analyze typography trends"""
        font_pairings: Counter = Counter()
        individual_fonts: Counter = Counter()

        for pattern in patterns:
            if pattern.fonts:
                try:
                    fonts = json.loads(pattern.fonts)
                    if isinstance(fonts, list):
                        # Track font pairings
                        if len(fonts) >= 2:
                            pairing_key = tuple(fonts[:2])  # First two fonts
                            font_pairings[pairing_key] += 1

                        # Track individual fonts
                        for font in fonts:
                            individual_fonts[font] += 1
                except Exception:
                    pass

        # Get top font pairings
        trends = []
        for pairing, count in font_pairings.most_common(5):
            popularity = count / max(len(patterns), 1)
            trends.append(
                {
                    "name": f"{pairing[0]} + {pairing[1]}",
                    "fonts": list(pairing),
                    "popularity_score": min(popularity, 1.0),
                    "detected_count": count,
                }
            )

        return trends

    def _analyze_component_trends(self, patterns: List[FrontendPattern]) -> List[Dict[str, Any]]:
        """Analyze component usage trends"""
        component_usage: Counter = Counter()
        component_combinations: defaultdict = defaultdict(int)

        for pattern in patterns:
            if pattern.components:
                try:
                    components = json.loads(pattern.components)
                    if isinstance(components, list):
                        # Track individual components
                        for component in components:
                            component_usage[component] += 1

                        # Track common combinations
                        if len(components) >= 2:
                            combo_key = tuple(sorted(components))
                            component_combinations[combo_key] += 1
                except Exception:
                    pass

        # Get top components
        trends = []
        for component, count in component_usage.most_common(10):
            popularity = count / max(len(patterns), 1)
            trends.append(
                {
                    "name": component.replace("-", " ").title(),
                    "component_type": component,
                    "popularity_score": min(popularity, 1.0),
                    "detected_count": count,
                }
            )

        return trends

    def _analyze_style_trends(self, patterns: List[FrontendPattern]) -> List[Dict[str, Any]]:
        """Analyze overall style trends (glassmorphism, neon, etc.)"""
        style_indicators: Dict[str, int] = defaultdict(int)

        for pattern in patterns:
            # Check for glassmorphism (blur, transparency)
            if pattern.gradients:
                try:
                    gradients = json.loads(pattern.gradients)
                    if any("rgba" in g.lower() or "transparent" in g.lower() for g in gradients):
                        style_indicators["glassmorphism"] += 1
                except Exception:
                    pass

            # Check for neon (bright colors, glow effects)
            if pattern.colors:
                try:
                    colors = json.loads(pattern.colors)
                    bright_colors = [
                        c
                        for c in colors
                        if any(
                            bright in c.upper()
                            for bright in ["FF", "00", "FF00", "00FF", "FFFF"]
                        )
                    ]
                    if len(bright_colors) >= 2:
                        style_indicators["neon"] += 1
                except Exception:
                    pass

            # Check for gradients
            if pattern.gradients:
                try:
                    gradients = json.loads(pattern.gradients)
                    if len(gradients) > 0:
                        style_indicators["gradient"] += 1
                except Exception:
                    pass

            # Check for dark theme (based on alignment score)
            if pattern.cosmiv_alignment_score and pattern.cosmiv_alignment_score > 0.7:
                style_indicators["dark_cosmic"] += 1

        # Convert to trends
        trends = []
        total = len(patterns)
        for style, count in style_indicators.items():
            popularity = count / max(total, 1)
            trends.append(
                {
                    "name": style.replace("_", " ").title(),
                    "style_type": style,
                    "popularity_score": min(popularity, 1.0),
                    "detected_count": count,
                }
            )

        # Sort by popularity
        trends.sort(key=lambda x: x["popularity_score"], reverse=True)
        return trends

    def _detect_trends(self, patterns: List[FrontendPattern]) -> Dict[str, Any]:
        """Detect all trends from patterns"""
        logger.info(f"Analyzing {len(patterns)} patterns for trends...")

        trends = {
            "colors": self._analyze_color_trends(patterns),
            "fonts": self._analyze_font_trends(patterns),
            "components": self._analyze_component_trends(patterns),
            "styles": self._analyze_style_trends(patterns),
        }

        return trends

    def _save_trends_to_db(self, trends: Dict[str, Any]):
        """Save detected trends to database"""
        try:
            with get_session() as session:
                # Save style trends
                for style_trend in trends.get("styles", []):
                    trend_id = f"trend_{style_trend['style_type']}"
                    existing = session.exec(
                        select(DesignTrend).where(DesignTrend.trend_id == trend_id)
                    ).first()

                    if existing:
                        # Update existing trend
                        existing.popularity_score = style_trend["popularity_score"]
                        existing.detected_count = style_trend["detected_count"]
                        existing.last_detected_at = datetime.utcnow()
                        existing.trend_data = json.dumps(style_trend)
                    else:
                        # Create new trend
                        new_trend = DesignTrend(
                            trend_id=trend_id,
                            trend_name=style_trend["name"],
                            trend_type="style",
                            trend_data=json.dumps(style_trend),
                            popularity_score=style_trend["popularity_score"],
                            detected_count=style_trend["detected_count"],
                        )
                        session.add(new_trend)

                session.commit()
                logger.info("Saved trends to database")
        except Exception as e:
            logger.error(f"Failed to save trends to database: {e}")

    def generate_design_principles(self) -> Dict[str, Any]:
        """
        Generate design principles from learned patterns

        Returns:
            Design principles dictionary
        """
        try:
            # Load patterns from database
            patterns = self._load_patterns_from_db()

            if not patterns:
                logger.warning("No patterns found in database")
                return {
                    "trends": [],
                    "updated_at": datetime.utcnow().isoformat(),
                    "pattern_count": 0,
                }

            # Detect trends
            trends = self._detect_trends(patterns)

            # Build principles document
            principles = {
                "trends": trends,
                "updated_at": datetime.utcnow().isoformat(),
                "pattern_count": len(patterns),
                "cosmiv_recommendations": self._generate_cosmiv_recommendations(trends),
            }

            # Save to file
            with open(self.principles_file, "w", encoding="utf-8") as f:
                json.dump(principles, f, indent=2, ensure_ascii=False)

            # Save trends to database
            self._save_trends_to_db(trends)

            logger.info(f"Generated design principles from {len(patterns)} patterns")
            return principles

        except Exception as e:
            logger.error(f"Failed to generate design principles: {e}")
            return {
                "trends": [],
                "updated_at": datetime.utcnow().isoformat(),
                "error": str(e),
            }

    def _generate_cosmiv_recommendations(self, trends: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate Cosmiv-specific design recommendations"""
        recommendations = []

        # Check for glassmorphism trend
        glassmorphism = next(
            (t for t in trends.get("styles", []) if t.get("style_type") == "glassmorphism"),
            None,
        )
        if glassmorphism and glassmorphism["popularity_score"] > 0.3:
            recommendations.append(
                {
                    "pattern": "Glassmorphism",
                    "recommendation": "Use glassmorphism effects with blur and transparency",
                    "cosmiv_alignment": "high",
                    "colors": ["#ffffff33", "#0f0f1a"],
                    "effects": ["backdrop-filter: blur(10px)", "rgba transparency"],
                }
            )

        # Check for neon trend
        neon = next(
            (t for t in trends.get("styles", []) if t.get("style_type") == "neon"), None
        )
        if neon and neon["popularity_score"] > 0.2:
            recommendations.append(
                {
                    "pattern": "Neon Gradients",
                    "recommendation": "Use neon colors with gradients for vibrant effects",
                    "cosmiv_alignment": "high",
                    "colors": ["#ff0080", "#00ffff", "#667eea"],
                    "effects": ["glow", "gradient", "neon"],
                }
            )

        # Check for dark theme
        dark_cosmic = next(
            (t for t in trends.get("styles", []) if t.get("style_type") == "dark_cosmic"),
            None,
        )
        if dark_cosmic and dark_cosmic["popularity_score"] > 0.4:
            recommendations.append(
                {
                    "pattern": "Dark Cosmic Theme",
                    "recommendation": "Use dark backgrounds with cosmic-inspired colors",
                    "cosmiv_alignment": "very_high",
                    "colors": ["#0f0f1a", "#1a1a2e", "#16213e"],
                    "effects": ["dark", "space", "cosmic"],
                }
            )

        return recommendations

    def load_design_principles(self) -> Dict[str, Any]:
        """Load design principles from file"""
        try:
            if self.principles_file.exists():
                with open(self.principles_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                logger.warning("Design principles file not found, generating new one...")
                return self.generate_design_principles()
        except Exception as e:
            logger.error(f"Failed to load design principles: {e}")
            return {
                "trends": [],
                "updated_at": datetime.utcnow().isoformat(),
                "error": str(e),
            }

