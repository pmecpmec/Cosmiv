# 📋 Asset Analysis Template
## Quick Reference for Scraped Assets

Use this template to document findings from scraped assets. Fill in the values as you analyze each element.

---

## 🎯 Target Website Analysis

**Website:** `[URL]`  
**Date Scraped:** `[Date]`  
**Analyzer:** `[Name]`  
**Status:** `[In Progress/Complete]`

---

## 📸 Screenshot Inventory

### Hero Section
- [ ] Full hero screenshot: `knowledge/scraped_assets/hero/hero-full.png`
- [ ] Hero title close-up: `knowledge/scraped_assets/hero/hero-title.png`
- [ ] Hero buttons: `knowledge/scraped_assets/hero/hero-buttons.png`
- [ ] Hero character/illustration: `knowledge/scraped_assets/hero/hero-character.png`

### Navigation
- [ ] Desktop navigation: `knowledge/scraped_assets/navigation/nav-desktop.png`
- [ ] Mobile navigation: `knowledge/scraped_assets/navigation/nav-mobile.png`
- [ ] Logo: `knowledge/scraped_assets/navigation/logo.svg` or `.png`

### Cards
- [ ] Feature card default: `knowledge/scraped_assets/cards/card-default.png`
- [ ] Feature card hover: `knowledge/scraped_assets/cards/card-hover.png` (or GIF)
- [ ] Content card: `knowledge/scraped_assets/cards/content-card.png`

### Buttons
- [ ] Primary button states: `knowledge/scraped_assets/buttons/button-primary.png`
- [ ] Secondary button states: `knowledge/scraped_assets/buttons/button-secondary.png`
- [ ] Button interactions: `knowledge/scraped_assets/buttons/button-interactions.gif`

### Animations
- [ ] Hero entrance: `knowledge/scraped_assets/animations/hero-entrance.gif`
- [ ] Scroll animations: `knowledge/scraped_assets/animations/scroll-animations.gif`
- [ ] Hover effects: `knowledge/scraped_assets/animations/hover-effects.gif`

---

## 🎨 Color Extraction

### Primary Colors
```css
--color-primary: #XXXXXX;    /* Main brand color */
--color-secondary: #XXXXXX;  /* Accent color */
--color-tertiary: #XXXXXX;   /* Supporting color */
```

### Neutral Colors
```css
--color-bg: #XXXXXX;         /* Background */
--color-surface: #XXXXXX;   /* Cards/surfaces */
--color-text-primary: #XXXXXX; /* Main text */
--color-text-secondary: #XXXXXX; /* Secondary text */
```

### Accent Colors
```css
--color-success: #XXXXXX;
--color-warning: #XXXXXX;
--color-error: #XXXXXX;
--color-glow: #XXXXXX;       /* Glow effects */
```

**Extraction Method:** `[Eye Dropper Tool/Color Picker/Browser DevTools]`

---

## 📐 Layout Measurements

### Hero Section
- **Height:** `[Value]px` or `[Value]vh`
- **Max Width:** `[Value]px` (if constrained)
- **Padding:** `[Top]px [Right]px [Bottom]px [Left]px`
- **Content Alignment:** `[Left/Center/Right]`

### Navigation
- **Height:** `[Value]px`
- **Padding:** `[Horizontal]px [Vertical]px`
- **Logo Size:** `[Width]px × [Height]px`
- **Nav Item Spacing:** `[Value]px`

### Cards
- **Width:** `[Value]px`
- **Height:** `[Value]px` (or `auto`)
- **Border Radius:** `[Value]px`
- **Padding:** `[Value]px`
- **Gap Between Cards:** `[Value]px`
- **Grid:** `[Columns] columns, [Gap]px gap`

### Buttons
- **Height:** `[Value]px`
- **Padding:** `[Horizontal]px [Vertical]px`
- **Border Radius:** `[Value]px`
- **Font Size:** `[Value]px`
- **Font Weight:** `[Value]`

---

## ✍️ Typography

### Font Families
```css
/* Hero Title */
font-family: '[Font Name]', sans-serif;
font-weight: [Weight];
font-size: [Size]px;
line-height: [Line Height];
letter-spacing: [Spacing]px;

/* Headings */
font-family: '[Font Name]', sans-serif;
font-weight: [Weight];
font-size: [Size]px;
line-height: [Line Height];
letter-spacing: [Spacing]px;

/* Body Text */
font-family: '[Font Name]', sans-serif;
font-weight: [Weight];
font-size: [Size]px;
line-height: [Line Height];
letter-spacing: [Spacing]px;
```

**Font Detection:** `[WhatFont/Browser DevTools/Font Squirrel]`

---

## 🎬 Animation Analysis

### Hero Entrance
- **Trigger:** `[On Load/Scroll/Click]`
- **Elements Animated:** `[List elements]`
- **Sequence:**
  1. `[Element]` - `[Animation Type]` - `[Duration]ms` - `[Delay]ms`
  2. `[Element]` - `[Animation Type]` - `[Duration]ms` - `[Delay]ms`
  3. `[Element]` - `[Animation Type]` - `[Duration]ms` - `[Delay]ms`

### Scroll Animations
- **Trigger Point:** `[Value]%` of viewport
- **Animation Type:** `[Fade/Slide/Scale/Parallax]`
- **Duration:** `[Value]ms`
- **Easing:** `[Easing Function]`
- **Stagger:** `[Value]ms` (if staggered)

### Hover Effects
- **Element:** `[Button/Card/Link]`
- **Effect:** `[Scale/Glow/Lift/Rotate/Color Change]`
- **Duration:** `[Value]ms`
- **Easing:** `[Easing Function]`
- **Before State:** `[Description]`
- **After State:** `[Description]`

### Idle Animations
- **Element:** `[Character/Particles/Background]`
- **Animation:** `[Float/Drift/Pulse/Rotate]`
- **Duration:** `[Value]s` (if looping)
- **Loop:** `[Yes/No]`
- **Easing:** `[Easing Function]`

---

## 🔍 CSS/JS Code Snippets

### Extracted CSS
```css
/* Paste relevant CSS from scraped assets */
```

### Extracted JavaScript
```javascript
// Paste relevant JS from scraped assets
```

### Animation Libraries Detected
- [ ] GSAP
- [ ] Framer Motion
- [ ] Three.js
- [ ] Lottie
- [ ] CSS Animations only
- [ ] Other: `[Library Name]`

---

## 📊 Performance Observations

### Load Times
- **First Contentful Paint:** `[Value]s`
- **Time to Interactive:** `[Value]s`
- **Animation Start:** `[Value]s` after page load

### Animation Performance
- **FPS:** `[Value]` (observed)
- **Smoothness:** `[Smooth/Janky]`
- **Heavy Elements:** `[List if any]`

### Asset Sizes
- **Total Page Weight:** `[Value]MB`
- **Images:** `[Value]MB`
- **JavaScript:** `[Value]KB`
- **CSS:** `[Value]KB`

---

## 🎯 Key Findings

### Design Patterns
1. `[Pattern 1]`
2. `[Pattern 2]`
3. `[Pattern 3]`

### Unique Features
1. `[Feature 1]`
2. `[Feature 2]`
3. `[Feature 3]`

### Implementation Challenges
1. `[Challenge 1]`
2. `[Challenge 2]`
3. `[Challenge 3]`

### Recommendations
1. `[Recommendation 1]`
2. `[Recommendation 2]`
3. `[Recommendation 3]`

---

## ✅ Analysis Checklist

### Visual Elements
- [ ] Colors extracted and documented
- [ ] Typography identified
- [ ] Spacing measured
- [ ] Shadows/glows documented
- [ ] Border radius values noted

### Animations
- [ ] Entrance animations analyzed
- [ ] Hover effects documented
- [ ] Scroll animations identified
- [ ] Idle animations noted
- [ ] Timing/easing extracted

### Code
- [ ] CSS snippets saved
- [ ] JavaScript snippets saved
- [ ] Animation libraries identified
- [ ] Implementation approach noted

### Assets
- [ ] Screenshots organized
- [ ] GIFs/videos captured
- [ ] Icons extracted
- [ ] Fonts identified
- [ ] Assets optimized for reference

---

## 📝 Notes

### Additional Observations
`[Any other relevant notes]`

### Questions for Clarification
1. `[Question 1]`
2. `[Question 2]`
3. `[Question 3]`

### Next Steps
1. `[Step 1]`
2. `[Step 2]`
3. `[Step 3]`

---

**Template Version:** 1.0  
**Last Updated:** 2025-01-27

