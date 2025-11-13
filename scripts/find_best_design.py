"""
Script to find the best trending design inspiration for Cosmiv
Scrapes target sites and identifies the best aesthetic match
"""

import json
import sys
from pathlib import Path

# Add backend src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend" / "src"))

from services.frontend_learner.scraper import FrontendScraper
from services.frontend_learner.parser import PatternParser
from services.frontend_learner.vectorizer import PatternVectorizer

def find_best_design():
    """Find the best design inspiration for Cosmiv"""
    print("🎨 Finding best design inspiration for Cosmiv...")
    print("=" * 60)
    
    # Initialize services
    scraper = FrontendScraper()
    parser = PatternParser()
    vectorizer = PatternVectorizer()
    
    # Cosmiv brand colors for matching
    cosmiv_colors = ["#0f0f1a", "#1a1a2e", "#16213e", "#ff0080", "#00ffff", "#667eea", "#764ba2"]
    
    print("\n📡 Phase 1: Scraping target websites...")
    snapshots = scraper.scrape_targets()
    print(f"✅ Scraped {len(snapshots)} pages")
    
    if not snapshots:
        print("❌ No snapshots found. Check your internet connection and targets config.")
        return None
    
    print("\n🔍 Phase 2: Analyzing patterns...")
    best_pattern = None
    best_score = 0.0
    all_patterns = []
    
    for snapshot in snapshots:
        try:
            pattern_data = parser.parse_snapshot(snapshot)
            if not pattern_data:
                continue
            
            # Calculate overall score
            alignment_score = pattern_data.get("cosmiv_alignment_score", 0.0)
            
            # Bonus for having gradients (Cosmiv aesthetic)
            has_gradients = len(pattern_data.get("gradients", [])) > 0
            gradient_bonus = 0.1 if has_gradients else 0.0
            
            # Bonus for dark colors
            colors = pattern_data.get("colors", [])
            dark_colors = sum(1 for c in colors if any(dark in c.upper() for dark in ["0F", "1A", "16", "00"]))
            dark_bonus = min(dark_colors / max(len(colors), 1) * 0.2, 0.2)
            
            # Bonus for modern fonts
            fonts = pattern_data.get("fonts", [])
            modern_fonts = ["Inter", "Poppins", "Space", "Orbitron", "Exo", "Rajdhani"]
            has_modern_font = any(font in " ".join(fonts) for font in modern_fonts)
            font_bonus = 0.1 if has_modern_font else 0.0
            
            # Bonus for animations (modern feel)
            animations = pattern_data.get("animations", [])
            animation_bonus = min(len(animations) * 0.05, 0.1)
            
            total_score = alignment_score + gradient_bonus + dark_bonus + font_bonus + animation_bonus
            
            pattern_data["total_score"] = total_score
            all_patterns.append(pattern_data)
            
            if total_score > best_score:
                best_score = total_score
                best_pattern = pattern_data
                
        except Exception as e:
            print(f"⚠️  Error analyzing {snapshot.get('url', 'unknown')}: {e}")
            continue
    
    if not best_pattern:
        print("❌ No suitable patterns found")
        return None
    
    # Sort all patterns by score
    all_patterns.sort(key=lambda x: x.get("total_score", 0), reverse=True)
    
    print(f"\n🏆 Best Design Found:")
    print("=" * 60)
    print(f"URL: {best_pattern['url']}")
    print(f"Score: {best_score:.2f}/1.0")
    print(f"Alignment: {best_pattern.get('cosmiv_alignment_score', 0):.2f}")
    print(f"\n🎨 Colors ({len(best_pattern.get('colors', []))}):")
    for color in best_pattern.get("colors", [])[:10]:
        print(f"  • {color}")
    print(f"\n📝 Fonts ({len(best_pattern.get('fonts', []))}):")
    for font in best_pattern.get("fonts", [])[:5]:
        print(f"  • {font}")
    print(f"\n🧩 Components ({len(best_pattern.get('components', []))}):")
    for component in best_pattern.get("components", []):
        print(f"  • {component}")
    print(f"\n✨ Animations ({len(best_pattern.get('animations', []))}):")
    for anim in best_pattern.get("animations", [])[:5]:
        print(f"  • {anim}")
    print(f"\n🌈 Gradients ({len(best_pattern.get('gradients', []))}):")
    for grad in best_pattern.get("gradients", [])[:3]:
        print(f"  • {grad[:80]}...")
    
    # Save best pattern to file
    output_file = Path("knowledge/best_design_inspiration.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "best_pattern": best_pattern,
            "top_5_patterns": all_patterns[:5],
            "analysis_date": str(Path(__file__).parent.parent),
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to: {output_file}")
    
    return best_pattern

if __name__ == "__main__":
    best = find_best_design()
    if best:
        print("\n✅ Analysis complete! Ready to recreate frontend.")
    else:
        print("\n❌ Analysis failed. Check logs above.")
        sys.exit(1)

