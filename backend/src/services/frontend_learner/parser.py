"""
Pattern Parser for Frontend Learning
Extracts design patterns from HTML/CSS snapshots
"""

import json
import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
from urllib.parse import urlparse

from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class PatternParser:
    """
    Parses HTML/CSS to extract design patterns:
    - Layout types (flex, grid, absolute)
    - Color palettes
    - Typography
    - Components
    - Animations
    - Gradients
    """

    def __init__(self, cosmiv_brand_colors: Optional[List[str]] = None):
        """
        Initialize the parser

        Args:
            cosmiv_brand_colors: Preferred colors for brand alignment scoring
        """
        self.cosmiv_brand_colors = cosmiv_brand_colors or [
            "#0f0f1a",
            "#1a1a2e",
            "#16213e",
            "#ff0080",
            "#00ffff",
            "#667eea",
            "#764ba2",
        ]

        # Color regex patterns
        self.hex_pattern = re.compile(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b")
        self.rgb_pattern = re.compile(r"rgb\((\d+),\s*(\d+),\s*(\d+)\)")
        self.rgba_pattern = re.compile(r"rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)")
        self.hsl_pattern = re.compile(r"hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)")

        # Layout detection patterns
        self.flex_pattern = re.compile(r"display\s*:\s*flex", re.IGNORECASE)
        self.grid_pattern = re.compile(r"display\s*:\s*grid", re.IGNORECASE)
        self.absolute_pattern = re.compile(r"position\s*:\s*absolute", re.IGNORECASE)

        # Gradient patterns
        self.gradient_pattern = re.compile(
            r"(linear|radial|conic)-gradient\([^)]+\)", re.IGNORECASE
        )

        # Animation patterns
        self.animation_pattern = re.compile(r"@keyframes\s+(\w+)", re.IGNORECASE)
        self.transition_pattern = re.compile(r"transition\s*:", re.IGNORECASE)

    def _extract_colors(self, css: str) -> List[str]:
        """Extract all color values from CSS"""
        colors: Set[str] = set()

        # Hex colors
        for match in self.hex_pattern.finditer(css):
            hex_color = match.group(0).upper()
            colors.add(hex_color)

        # RGB colors
        for match in self.rgb_pattern.finditer(css):
            r, g, b = match.groups()
            hex_color = f"#{int(r):02x}{int(g):02x}{int(b):02x}".upper()
            colors.add(hex_color)

        # RGBA colors (convert to hex, ignoring alpha)
        for match in self.rgba_pattern.finditer(css):
            r, g, b = match.groups()
            hex_color = f"#{int(r):02x}{int(g):02x}{int(b):02x}".upper()
            colors.add(hex_color)

        # HSL colors (simplified - just extract, don't convert)
        for match in self.hsl_pattern.finditer(css):
            colors.add(match.group(0))

        return sorted(list(colors))

    def _extract_gradients(self, css: str) -> List[str]:
        """Extract gradient definitions from CSS"""
        gradients = []
        for match in self.gradient_pattern.finditer(css):
            gradients.append(match.group(0))
        return gradients

    def _detect_layout_type(self, html: str, css: str) -> str:
        """Detect primary layout type"""
        layout_scores = {
            "flex": len(self.flex_pattern.findall(css)),
            "grid": len(self.grid_pattern.findall(css)),
            "absolute": len(self.absolute_pattern.findall(css)),
        }

        # Check HTML structure
        soup = BeautifulSoup(html, "html.parser")
        if soup.find(class_=re.compile(r"grid", re.IGNORECASE)):
            layout_scores["grid"] += 2
        if soup.find(class_=re.compile(r"flex", re.IGNORECASE)):
            layout_scores["flex"] += 2

        if max(layout_scores.values()) == 0:
            return "unknown"

        return max(layout_scores, key=layout_scores.get)  # type: ignore

    def _extract_fonts(self, html: str, css: str) -> List[str]:
        """Extract font families"""
        fonts: Set[str] = set()

        # From CSS
        font_family_pattern = re.compile(
            r"font-family\s*:\s*([^;]+)", re.IGNORECASE
        )
        for match in font_family_pattern.finditer(css):
            font_list = match.group(1).strip()
            # Extract first font (before comma)
            font = font_list.split(",")[0].strip().strip("'\"")
            if font and font not in ["serif", "sans-serif", "monospace", "cursive", "fantasy"]:
                fonts.add(font)

        # From HTML
        soup = BeautifulSoup(html, "html.parser")
        for link in soup.find_all("link", href=re.compile(r"fonts\.(googleapis|gstatic)")):
            href = link.get("href", "")
            # Extract font name from Google Fonts URL
            font_match = re.search(r"family=([^&:]+)", href)
            if font_match:
                font_name = font_match.group(1).replace("+", " ")
                fonts.add(font_name)

        return sorted(list(fonts))

    def _detect_components(self, html: str) -> List[str]:
        """Detect common UI components"""
        soup = BeautifulSoup(html, "html.parser")
        components: Set[str] = set()

        # Hero section
        if (
            soup.find(class_=re.compile(r"hero", re.IGNORECASE))
            or soup.find(id=re.compile(r"hero", re.IGNORECASE))
            or soup.find("section", class_=re.compile(r"hero", re.IGNORECASE))
        ):
            components.add("hero")

        # Navbar
        if (
            soup.find("nav")
            or soup.find(class_=re.compile(r"nav", re.IGNORECASE))
            or soup.find("header")
        ):
            components.add("navbar")

        # Cards
        if soup.find_all(class_=re.compile(r"card", re.IGNORECASE)):
            components.add("card")

        # Pricing table
        if (
            soup.find(class_=re.compile(r"pricing", re.IGNORECASE))
            or soup.find(class_=re.compile(r"price", re.IGNORECASE))
        ):
            components.add("pricing-table")

        # Forms
        if soup.find("form"):
            components.add("form")

        # Testimonials
        if soup.find(class_=re.compile(r"testimonial", re.IGNORECASE)):
            components.add("testimonial-section")

        # Footer
        if soup.find("footer"):
            components.add("footer")

        # Buttons
        if soup.find_all("button") or soup.find_all(class_=re.compile(r"btn", re.IGNORECASE)):
            components.add("button")

        return sorted(list(components))

    def _extract_animations(self, css: str) -> List[str]:
        """Extract animation types"""
        animations: Set[str] = set()

        # Keyframe animations
        for match in self.animation_pattern.finditer(css):
            animations.add(f"keyframe-{match.group(1)}")

        # Transitions
        if self.transition_pattern.search(css):
            animations.add("transition")

        # Common animation keywords
        if re.search(r"transform\s*:", css, re.IGNORECASE):
            animations.add("transform")

        if re.search(r"opacity\s*:", css, re.IGNORECASE):
            animations.add("fade")

        if re.search(r"translate|translateX|translateY", css, re.IGNORECASE):
            animations.add("slide")

        return sorted(list(animations))

    def _calculate_brand_alignment(self, colors: List[str]) -> float:
        """Calculate alignment score with Cosmiv brand colors (0-1)"""
        if not colors:
            return 0.0

        # Normalize brand colors to hex
        brand_hex = set()
        for color in self.cosmiv_brand_colors:
            if color.startswith("#"):
                brand_hex.add(color.upper())

        # Check overlap
        extracted_hex = set()
        for color in colors:
            if color.startswith("#"):
                extracted_hex.add(color.upper())

        if not extracted_hex:
            return 0.0

        # Calculate similarity score
        overlap = len(brand_hex.intersection(extracted_hex))
        similarity = overlap / max(len(extracted_hex), 1)

        # Bonus for dark colors (Cosmiv aesthetic)
        dark_colors = sum(1 for c in extracted_hex if self._is_dark_color(c))
        dark_bonus = min(dark_colors / len(extracted_hex), 0.3)

        return min(similarity + dark_bonus, 1.0)

    def _is_dark_color(self, hex_color: str) -> bool:
        """Check if color is dark (for Cosmiv aesthetic)"""
        try:
            hex_color = hex_color.lstrip("#")
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            # Calculate luminance
            luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            return luminance < 0.5
        except Exception:
            return False

    def parse_snapshot(self, snapshot_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Parse a single snapshot to extract patterns

        Args:
            snapshot_data: Snapshot data from scraper

        Returns:
            Parsed pattern data or None if failed
        """
        try:
            url = snapshot_data.get("url", "")
            html = snapshot_data.get("html", "")
            css = snapshot_data.get("css", "")

            if not html:
                logger.warning(f"No HTML content in snapshot for {url}")
                return None

            # Extract patterns
            colors = self._extract_colors(css)
            fonts = self._extract_fonts(html, css)
            layout_type = self._detect_layout_type(html, css)
            components = self._detect_components(html)
            animations = self._extract_animations(css)
            gradients = self._extract_gradients(css)

            # Calculate brand alignment
            brand_alignment = self._calculate_brand_alignment(colors)

            # Build pattern data
            pattern_data = {
                "url": url,
                "layout": layout_type,
                "colors": colors,
                "fonts": fonts,
                "components": components,
                "animations": animations,
                "gradients": gradients,
                "cosmiv_alignment_score": brand_alignment,
                "timestamp": snapshot_data.get("timestamp", ""),
            }

            logger.info(
                f"Parsed {url}: {len(colors)} colors, {len(fonts)} fonts, "
                f"{len(components)} components, alignment: {brand_alignment:.2f}"
            )

            return pattern_data
        except Exception as e:
            logger.error(f"Failed to parse snapshot: {e}")
            return None

    def parse_snapshot_file(self, snapshot_path: str) -> Optional[Dict[str, Any]]:
        """Parse a snapshot from file path"""
        try:
            with open(snapshot_path, "r", encoding="utf-8") as f:
                snapshot_data = json.load(f)
            return self.parse_snapshot(snapshot_data)
        except Exception as e:
            logger.error(f"Failed to parse snapshot file {snapshot_path}: {e}")
            return None

    def parse_directory(self, snapshot_dir: str) -> List[Dict[str, Any]]:
        """
        Parse all snapshots in a directory

        Args:
            snapshot_dir: Directory containing snapshot JSON files

        Returns:
            List of parsed pattern data
        """
        snapshot_path = Path(snapshot_dir)
        if not snapshot_path.exists():
            logger.warning(f"Snapshot directory does not exist: {snapshot_dir}")
            return []

        patterns = []
        for snapshot_file in snapshot_path.glob("*.json"):
            pattern = self.parse_snapshot_file(str(snapshot_file))
            if pattern:
                patterns.append(pattern)

        logger.info(f"Parsed {len(patterns)} patterns from {len(list(snapshot_path.glob('*.json')))} snapshots")
        return patterns

