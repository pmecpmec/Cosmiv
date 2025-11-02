# Icon Generation Guide

To generate PWA icons, you'll need to create icons in multiple sizes.

## Option 1: Online Tools

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator

   - Upload a 512x512 icon
   - Download all generated sizes

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Upload your icon
   - Configure settings
   - Download package

## Option 2: ImageMagick (Command Line)

```bash
# Create base icon (512x512) first
# Then generate all sizes:

mkdir -p public/icons

# Generate all required sizes
convert icon-512x512.png -resize 72x72 public/icons/icon-72x72.png
convert icon-512x512.png -resize 96x96 public/icons/icon-96x96.png
convert icon-512x512.png -resize 128x128 public/icons/icon-128x128.png
convert icon-512x512.png -resize 144x144 public/icons/icon-144x144.png
convert icon-512x512.png -resize 152x152 public/icons/icon-152x152.png
convert icon-512x512.png -resize 192x192 public/icons/icon-192x192.png
convert icon-512x512.png -resize 384x384 public/icons/icon-384x384.png
convert icon-512x512.png -resize 512x512 public/icons/icon-512x512.png

# Small favicons
convert icon-512x512.png -resize 16x16 public/icons/icon-16x16.png
convert icon-512x512.png -resize 32x32 public/icons/icon-32x32.png
```

## Option 3: Placeholder Icons

For development, you can use simple colored squares or the emoji icon:

```bash
# Using ImageMagick to create placeholder
convert -size 192x192 xc:#7c3aed -pointsize 120 -gravity center -annotate +0+0 "🎬" public/icons/icon-192x192.png
```

## Required Sizes

- 16x16 (favicon)
- 32x32 (favicon)
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (Apple touch icon)
- 192x192 (Android)
- 384x384
- 512x512 (PWA standard)

## Design Tips

- Use a simple, recognizable icon
- Ensure it looks good at small sizes
- Use high contrast for visibility
- Support both light and dark backgrounds
- Consider maskable icons (Android)
