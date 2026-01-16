# PWA Icons Setup

## Current Icons

I've created placeholder SVG icons in the `public/` folder:
- `icon-192.svg` (192x192)
- `icon-512.svg` (512x512)

## Converting SVG to PNG

### Option 1: Online Converter (Easiest)
1. Go to https://svgtopng.com/
2. Upload `public/icon-192.svg`
3. Download as `icon-192.png`
4. Upload `public/icon-512.svg`
5. Download as `icon-512.png`
6. Place both PNG files in the `public/` folder

### Option 2: Using ImageMagick (If installed)
```bash
# Convert SVG to PNG
magick convert public/icon-192.svg public/icon-192.png
magick convert public/icon-512.svg public/icon-512.png
```

### Option 3: Use Your Own Logo
Replace the SVG files with your actual company logo, then convert to PNG.

## Required Icon Sizes

For best PWA support, you need:
- ✅ `icon-192.png` (192x192) - Android
- ✅ `icon-512.png` (512x512) - Android, splash screens
- 📱 `apple-touch-icon.png` (180x180) - iOS (optional but recommended)

## Icon Guidelines

- **Format**: PNG with transparent background preferred
- **Content**: Should be recognizable at small sizes
- **Brand**: Use your company logo/colors
- **Square**: Icons should be square (1:1 ratio)

## After Creating Icons

1. Place PNG files in `public/` folder
2. Update `nuxt.config.ts` if using different names
3. Test on mobile:
   - Android: Look for install banner
   - iOS: Share → Add to Home Screen
   - Check icon appears correctly

## Current Placeholder

The current SVG icons show "EMC" text on blue background. Replace with your actual logo for production!
