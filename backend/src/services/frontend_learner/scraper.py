"""
Web Scraper for Frontend Learning
Scrapes websites to extract HTML, CSS, and layout metadata
"""

import json
import logging
import os
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class FrontendScraper:
    """
    Scrapes websites for front-end design patterns
    Supports both static (BeautifulSoup) and dynamic (Playwright) sites
    """

    def __init__(
        self,
        targets_config_path: Optional[str] = None,
        snapshot_dir: str = "knowledge/html_snapshots",
        user_agent: str = "Cosmiv-FrontendLearner/1.0 (+https://cosmiv.com/bot)",
        delay: float = 2.0,
        timeout: int = 30,
        max_retries: int = 3,
    ):
        """
        Initialize the scraper

        Args:
            targets_config_path: Path to frontend_learning_targets.json
            snapshot_dir: Directory to save HTML/CSS snapshots
            user_agent: User agent string for requests
            delay: Delay between requests (seconds)
            timeout: Request timeout (seconds)
            max_retries: Maximum retry attempts
        """
        self.snapshot_dir = Path(snapshot_dir)
        self.snapshot_dir.mkdir(parents=True, exist_ok=True)
        self.user_agent = user_agent
        self.delay = delay
        self.timeout = timeout
        self.max_retries = max_retries

        # Load targets configuration
        if targets_config_path:
            self.targets_config = self._load_config(targets_config_path)
        else:
            # Default config path
            default_path = Path(__file__).parent.parent.parent.parent.parent / "frontend_learning_targets.json"
            if default_path.exists():
                self.targets_config = self._load_config(str(default_path))
            else:
                logger.warning("No targets config found, using empty config")
                self.targets_config = {"targets": [], "scraping_config": {}}

        # Merge config with defaults
        self.scraping_config = {
            "max_pages_per_site": 10,
            "respect_robots_txt": True,
            "delay_between_requests": 2.0,
            "user_agent": user_agent,
            "timeout_seconds": 30,
            "max_retries": 3,
            "save_screenshots": True,
            "extract_css": True,
            "extract_js": False,
            **self.targets_config.get("scraping_config", {}),
        }

        # Initialize Playwright (optional, for dynamic sites)
        self.playwright_available = False
        try:
            from playwright.sync_api import sync_playwright

            self.playwright = sync_playwright
            self.playwright_available = True
            logger.info("✅ Playwright available for dynamic site scraping")
        except ImportError:
            logger.warning("⚠️ Playwright not installed, using BeautifulSoup only")

        # Robot parser cache
        self.robot_parsers: Dict[str, RobotFileParser] = {}

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load targets configuration from JSON file"""
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load config from {config_path}: {e}")
            return {"targets": [], "scraping_config": {}}

    def _check_robots_txt(self, url: str) -> bool:
        """Check if URL is allowed by robots.txt"""
        if not self.scraping_config.get("respect_robots_txt", True):
            return True

        try:
            parsed = urlparse(url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"

            # Cache robot parser
            if base_url not in self.robot_parsers:
                rp = RobotFileParser()
                robots_url = urljoin(base_url, "/robots.txt")
                rp.set_url(robots_url)
                rp.read()
                self.robot_parsers[base_url] = rp

            return self.robot_parsers[base_url].can_fetch(self.user_agent, url)
        except Exception as e:
            logger.warning(f"Error checking robots.txt for {url}: {e}")
            # If we can't check, allow by default
            return True

    def _scrape_static(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape static HTML page using BeautifulSoup"""
        try:
            headers = {"User-Agent": self.user_agent}
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # Extract HTML
            html_content = str(soup)

            # Extract CSS from <style> tags and external stylesheets
            css_content = []
            for style_tag in soup.find_all("style"):
                css_content.append(style_tag.string or "")

            # Extract external stylesheet links
            stylesheet_links = []
            for link in soup.find_all("link", rel="stylesheet"):
                href = link.get("href")
                if href:
                    full_url = urljoin(url, href)
                    stylesheet_links.append(full_url)

            # Try to fetch external stylesheets
            for stylesheet_url in stylesheet_links[:5]:  # Limit to 5
                try:
                    css_response = requests.get(
                        stylesheet_url, headers=headers, timeout=self.timeout
                    )
                    if css_response.status_code == 200:
                        css_content.append(css_response.text)
                except Exception as e:
                    logger.debug(f"Failed to fetch stylesheet {stylesheet_url}: {e}")

            return {
                "url": url,
                "html": html_content,
                "css": "\n".join(css_content),
                "method": "static",
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Failed to scrape static page {url}: {e}")
            return None

    def _scrape_dynamic(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape dynamic page using Playwright"""
        if not self.playwright_available:
            logger.warning(f"Playwright not available, falling back to static scraping for {url}")
            return self._scrape_static(url)

        try:
            with self.playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_extra_http_headers({"User-Agent": self.user_agent})

                # Navigate and wait for page to load
                page.goto(url, wait_until="networkidle", timeout=self.timeout * 1000)

                # Get HTML after JavaScript execution
                html_content = page.content()

                # Extract CSS
                css_content = []
                css_links = page.query_selector_all('link[rel="stylesheet"]')
                for link in css_links:
                    href = link.get_attribute("href")
                    if href:
                        full_url = urljoin(url, href)
                        try:
                            css_response = requests.get(
                                full_url,
                                headers={"User-Agent": self.user_agent},
                                timeout=self.timeout,
                            )
                            if css_response.status_code == 200:
                                css_content.append(css_response.text)
                        except Exception:
                            pass

                # Get inline styles
                style_tags = page.query_selector_all("style")
                for style_tag in style_tags:
                    css_content.append(style_tag.inner_text())

                # Take full page screenshot
                screenshot_path = None
                if self.scraping_config.get("save_screenshots", True):
                    try:
                        parsed = urlparse(url)
                        domain = parsed.netloc.replace(".", "_")
                        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                        screenshot_filename = f"{domain}_{timestamp}_screenshot.png"
                        screenshot_path_full = self.snapshot_dir / screenshot_filename
                        page.screenshot(path=str(screenshot_path_full), full_page=True)
                        screenshot_path = str(screenshot_path_full)
                        logger.info(f"Saved screenshot: {screenshot_path}")
                    except Exception as e:
                        logger.warning(f"Failed to save screenshot: {e}")

                # Extract and save images
                images_data = []
                try:
                    img_elements = page.query_selector_all("img")
                    for img in img_elements[:20]:  # Limit to 20 images
                        src = img.get_attribute("src")
                        if src:
                            full_img_url = urljoin(url, src)
                            images_data.append({
                                "src": full_img_url,
                                "alt": img.get_attribute("alt") or "",
                            })
                except Exception as e:
                    logger.debug(f"Failed to extract images: {e}")

                browser.close()

                return {
                    "url": url,
                    "html": html_content,
                    "css": "\n".join(css_content),
                    "method": "dynamic",
                    "timestamp": datetime.utcnow().isoformat(),
                    "screenshot_path": screenshot_path,
                    "images": images_data,
                }
        except Exception as e:
            logger.error(f"Failed to scrape dynamic page {url}: {e}")
            # Fallback to static scraping
            return self._scrape_static(url)

    def _save_snapshot(self, snapshot_data: Dict[str, Any]) -> str:
        """Save HTML/CSS snapshot to disk"""
        try:
            # Create filename from URL
            parsed = urlparse(snapshot_data["url"])
            domain = parsed.netloc.replace(".", "_")
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"{domain}_{timestamp}_{uuid.uuid4().hex[:8]}.json"

            snapshot_path = self.snapshot_dir / filename

            with open(snapshot_path, "w", encoding="utf-8") as f:
                json.dump(snapshot_data, f, indent=2, ensure_ascii=False)

            logger.info(f"Saved snapshot: {snapshot_path}")
            return str(snapshot_path)
        except Exception as e:
            logger.error(f"Failed to save snapshot: {e}")
            return ""

    def scrape_url(self, url: str, use_dynamic: bool = False) -> Optional[Dict[str, Any]]:
        """
        Scrape a single URL

        Args:
            url: URL to scrape
            use_dynamic: Whether to use Playwright (for JS-heavy sites)

        Returns:
            Snapshot data dict or None if failed
        """
        # Check robots.txt
        if not self._check_robots_txt(url):
            logger.warning(f"URL blocked by robots.txt: {url}")
            return None

        # Rate limiting
        time.sleep(self.delay)

        # Scrape
        if use_dynamic:
            snapshot_data = self._scrape_dynamic(url)
        else:
            snapshot_data = self._scrape_static(url)

        if snapshot_data:
            # Save snapshot
            snapshot_path = self._save_snapshot(snapshot_data)
            snapshot_data["snapshot_path"] = snapshot_path
            return snapshot_data

        return None

    def scrape_targets(self, max_pages: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Scrape all targets from configuration

        Args:
            max_pages: Maximum pages per site (overrides config)

        Returns:
            List of snapshot data dicts
        """
        targets = self.targets_config.get("targets", [])
        max_pages_per_site = max_pages or self.scraping_config.get("max_pages_per_site", 10)
        results = []

        for target in targets:
            url = target.get("url")
            if not url:
                continue

            priority = target.get("priority", "medium")
            target_type = target.get("type", "unknown")

            logger.info(f"Scraping target: {url} (priority: {priority}, type: {target_type})")

            # Determine if we should use dynamic scraping
            use_dynamic = target_type in ["saas_product", "award_showcase"] or target.get(
                "use_dynamic", False
            )

            # Scrape main page
            snapshot = self.scrape_url(url, use_dynamic=use_dynamic)
            if snapshot:
                results.append(snapshot)

            # TODO: Implement pagination/crawling for more pages
            # For now, just scrape the main page

        logger.info(f"Scraped {len(results)} pages from {len(targets)} targets")
        return results

