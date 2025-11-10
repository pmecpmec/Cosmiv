"""
Create placeholder PWA icons for Cosmiv
Generates simple colored square icons in all required sizes
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Icon sizes required by manifest.json
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Colors (futuristic purple/blue theme)
BG_COLOR = "#7c3aed"  # Purple (theme_color)
TEXT_COLOR = "#ffffff"  # White


def create_icon(size: int, output_path: str):
    """Create a placeholder icon with size x size dimensions"""
    # Create image with rounded corners effect
    img = Image.new("RGB", (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw a simple "A" in the center
    try:
        # Try to use a font (may not be available on all systems)
        font_size = size // 3
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.load_default()
        except:
            font = None

    text = "C"  # Cosmiv initial
    bbox = draw.textbbox((0, 0), text, font=font) if font else (0, 0, 50, 50)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2

    draw.text((x, y), text, fill=TEXT_COLOR, font=font)

    # Save
    img.save(output_path, "PNG")
    print(f"✅ Created {output_path} ({size}x{size})")


def main():
    """Generate all icon sizes"""
    icons_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "public", "icons"
    )
    os.makedirs(icons_dir, exist_ok=True)

    print(f"🎨 Generating placeholder PWA icons...")
    print(f"📁 Output directory: {icons_dir}")
    print()

    for size in SIZES:
        filename = f"icon-{size}x{size}.png"
        output_path = os.path.join(icons_dir, filename)
        create_icon(size, output_path)

    print()
    print("✅ All icons generated!")
    print()
    print("📝 Note: These are placeholder icons. For production, create actual:")
    print("   - App logo with proper branding")
    print("   - Maskable icons (with safe zone)")
    print("   - Multiple sizes for different devices")
    print()
    print("💡 See scripts/generate-icons.md for instructions on creating real icons")


if __name__ == "__main__":
    main()
