#!/usr/bin/env python3
"""
Script to scrape Epiminds.com for visual and animation recreation
"""

import sys
import os
from pathlib import Path

# Add backend/src to path
backend_src = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_src))

from services.frontend_learner.scraper import FrontendScraper
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Scrape Epiminds.com"""
    logger.info("Starting Epiminds.com scraping...")
    
    # Initialize scraper
    scraper = FrontendScraper(
        snapshot_dir="knowledge/html_snapshots",
        delay=2.0,
        timeout=60,  # Longer timeout for dynamic sites
    )
    
    # Scrape Epiminds.com
    url = "https://epiminds.com"
    logger.info(f"Scraping {url}...")
    
    result = scraper.scrape_url(url, use_dynamic=True)
    
    if result:
        logger.info("✅ Scraping successful!")
        logger.info(f"Snapshot saved: {result.get('snapshot_path', 'N/A')}")
        logger.info(f"Screenshot saved: {result.get('screenshot_path', 'N/A')}")
        logger.info(f"Images found: {len(result.get('images', []))}")
        logger.info(f"CSS length: {len(result.get('css', ''))} characters")
        logger.info(f"HTML length: {len(result.get('html', ''))} characters")
    else:
        logger.error("❌ Scraping failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

