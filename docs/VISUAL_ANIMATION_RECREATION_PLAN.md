# 🎨 Visual & Animation Recreation Plan
## From Scraped Assets Analysis

**Target Website:** [To be specified]  
**Project:** Cosmiv - AI Gaming Montage Platform  
**Aesthetic:** Futuristic, Cosmic, Dark Space-Tech, Broken Planet Streetwear  
**Date:** 2025-01-27

---

## 📋 Table of Contents

1. [Asset Inventory](#asset-inventory)
2. [Visual Design System](#visual-design-system)
3. [Section-by-Section Analysis](#section-by-section-analysis)
4. [Animation Specifications](#animation-specifications)
5. [Character/Hero Animations](#characterhero-animations)
6. [Implementation Recommendations](#implementation-recommendations)
7. [Performance Optimizations](#performance-optimizations)
8. [Responsive Adaptation](#responsive-adaptation)

---

## 📦 Asset Inventory

### Scraped Assets Categorization

#### **Hero Section**
- [ ] Hero background (image/video/GIF)
- [ ] Hero title text (screenshot/HTML)
- [ ] Hero subtitle/description
- [ ] CTA buttons (primary/secondary)
- [ ] Hero character/illustration (if applicable)
- [ ] Decorative elements (particles, shapes, gradients)

**Asset Files:**
```
knowledge/scraped_assets/hero/
├── hero-background.png
├── hero-title.png
├── hero-cta-buttons.png
└── hero-character.png (if applicable)
```

#### **Navigation**
- [ ] Logo/wordmark
- [ ] Navigation menu items
- [ ] Mobile menu toggle
- [ ] Navigation hover states
- [ ] Active state indicators

**Asset Files:**
```
knowledge/scraped_assets/navigation/
├── logo.svg
├── nav-desktop.png
├── nav-mobile.png
└── nav-hover-states.png
```

#### **Cards/Content Sections**
- [ ] Feature cards
- [ ] Content cards
- [ ] Testimonial cards
- [ ] Product/service cards
- [ ] Card hover states
- [ ] Card shadows/glows

**Asset Files:**
```
knowledge/scraped_assets/cards/
├── feature-card-default.png
├── feature-card-hover.png
├── content-card.png
└── card-shadows.png
```

#### **Buttons & Interactive Elements**
- [ ] Primary button (default/hover/active)
- [ ] Secondary button
- [ ] Icon buttons
- [ ] Link buttons
- [ ] Loading states
- [ ] Disabled states

**Asset Files:**
```
knowledge/scraped_assets/buttons/
├── button-primary-states.png
├── button-secondary-states.png
└── button-interactions.gif
```

#### **Icons & Graphics**
- [ ] Social media icons
- [ ] Feature icons
- [ ] Decorative icons
- [ ] Loading spinners
- [ ] Status indicators

**Asset Files:**
```
knowledge/scraped_assets/icons/
├── social-icons.svg
├── feature-icons.svg
└── decorative-elements.svg
```

#### **Footer**
- [ ] Footer layout
- [ ] Footer links
- [ ] Footer branding
- [ ] Footer decorative elements

**Asset Files:**
```
knowledge/scraped_assets/footer/
├── footer-layout.png
└── footer-links.png
```

#### **Background Effects**
- [ ] Particle systems
- [ ] Gradient overlays
- [ ] Animated backgrounds
- [ ] Parallax layers

**Asset Files:**
```
knowledge/scraped_assets/backgrounds/
├── particles-config.json
├── gradient-overlays.png
└── animated-bg.gif
```

---

## 🎨 Visual Design System

### Color Palette Analysis

#### **Primary Colors**
| Color | Hex | Usage | Cosmiv Equivalent |
|-------|-----|-------|-------------------|
| Primary | `#XXXXXX` | Main brand color | `#8B5CF6` (cosmic-violet) |
| Secondary | `#XXXXXX` | Accent color | `#00FFFF` (neon-cyan) |
| Tertiary | `#XXXXXX` | Supporting color | `#1E3A8A` (deep-blue) |

#### **Neutral Colors**
| Color | Hex | Usage | Cosmiv Equivalent |
|-------|-----|-------|-------------------|
| Background | `#XXXXXX` | Main background | `#000000` (pure-black) |
| Surface | `#XXXXXX` | Card backgrounds | `#1a1a1a` (bw-gray-1) |
| Text Primary | `#XXXXXX` | Main text | `#FFFFFF` (pure-white) |
| Text Secondary | `#XXXXXX` | Secondary text | `#CCCCCC` |

#### **Accent Colors**
| Color | Hex | Usage | Cosmiv Equivalent |
|-------|-----|-------|-------------------|
| Success | `#XXXXXX` | Success states | `#00FFFF` (neon-cyan) |
| Warning | `#XXXXXX` | Warning states | `#EC4899` (pink) |
| Error | `#XXXXXX` | Error states | `#FF0080` (glitch-pink) |
| Glow | `#XXXXXX` | Glow effects | `#00FFFF` (neon-cyan) |

### Typography Analysis

#### **Font Families**
| Element | Font Family | Weight | Size | Letter Spacing | Cosmiv Equivalent |
|---------|-------------|--------|------|----------------|-------------------|
| Hero Title | `[Font Name]` | `[Weight]` | `[Size]` | `[Spacing]` | `font-display` (Orbitron/Michroma) |
| Headings | `[Font Name]` | `[Weight]` | `[Size]` | `[Spacing]` | `font-orbitron` |
| Body Text | `[Font Name]` | `[Weight]` | `[Size]` | `[Spacing]` | `font-sans` (Inter) |
| Buttons | `[Font Name]` | `[Weight]` | `[Size]` | `[Spacing]` | `font-display` |

#### **Type Scale**
```
Hero: [Size]px / [Line Height]
H1: [Size]px / [Line Height]
H2: [Size]px / [Line Height]
H3: [Size]px / [Line Height]
Body: [Size]px / [Line Height]
Small: [Size]px / [Line Height]
```

### Spacing System

#### **Spacing Scale**
| Name | Value | Usage |
|------|-------|-------|
| xs | `[Value]px` | Tight spacing |
| sm | `[Value]px` | Small gaps |
| md | `[Value]px` | Default spacing |
| lg | `[Value]px` | Large gaps |
| xl | `[Value]px` | Section spacing |
| 2xl | `[Value]px` | Hero spacing |

### Depth & Shadows

#### **Shadow System**
| Level | Shadow | Usage | Cosmiv Equivalent |
|-------|--------|-------|-------------------|
| None | `none` | Flat elements | - |
| Sm | `[Shadow]` | Subtle elevation | `shadow-cosmic-sm` |
| Md | `[Shadow]` | Cards | `shadow-cosmic-md` |
| Lg | `[Shadow]` | Modals | `shadow-cosmic-lg` |
| Glow | `[Shadow]` | Interactive elements | `shadow-neon-glow` |

#### **Glassmorphism**
- **Backdrop Blur:** `[Value]px`
- **Background Opacity:** `[Value]%`
- **Border:** `[Width]px solid [Color]`
- **Border Opacity:** `[Value]%`

---

## 📐 Section-by-Section Analysis

### 1. Hero Section

#### **Wireframe Layout**
```
┌─────────────────────────────────────────────────┐
│                    Navigation                    │
├─────────────────────────────────────────────────┤
│                                                   │
│              [Hero Character/Image]               │
│                      (Floating)                  │
│                                                   │
│              [Hero Title Text]                    │
│            (Animated Entrance)                   │
│                                                   │
│            [Hero Subtitle/Description]           │
│            (Fade-in with Delay)                 │
│                                                   │
│         [CTA Button 1]  [CTA Button 2]          │
│         (Hover Glow)    (Hover Glow)            │
│                                                   │
│            [Background Particles]                │
│            (Continuous Animation)                │
│                                                   │
└─────────────────────────────────────────────────┘
```

#### **Visual Specifications**
- **Height:** `[Value]vh` (Full viewport or specific height)
- **Background:** `[Gradient/Image/Video]`
- **Content Alignment:** `[Center/Left/Right]`
- **Max Width:** `[Value]px` (if constrained)
- **Padding:** `[Top/Bottom]px [Left/Right]px`

#### **Interactive Elements**
| Element | Default State | Hover State | Active State | Click Feedback |
|---------|---------------|-------------|--------------|----------------|
| CTA Primary | `[Description]` | `[Description]` | `[Description]` | `[Description]` |
| CTA Secondary | `[Description]` | `[Description]` | `[Description]` | `[Description]` |
| Hero Character | `[Description]` | `[Description]` | `[Description]` | `[Description]` |

#### **Animation Sequence**
1. **Background:** Fade in (0-500ms)
2. **Particles:** Start animation (500ms)
3. **Hero Character:** Float in from [Direction] (500-1000ms)
4. **Title:** Slide in from [Direction] + Fade (600-1200ms)
5. **Subtitle:** Fade in (1000-1500ms)
6. **Buttons:** Scale in + Fade (1200-1800ms)

---

### 2. Navigation

#### **Wireframe Layout**
```
┌─────────────────────────────────────────────────┐
│  [Logo]  [Nav Item 1] [Nav Item 2] [Nav Item 3] [CTA Button] │
│   (Glow)   (Hover)     (Hover)      (Hover)     (Hover Glow)  │
└─────────────────────────────────────────────────┘
```

#### **Visual Specifications**
- **Height:** `[Value]px`
- **Background:** `[Color/Gradient/Glass]`
- **Position:** `[Fixed/Sticky/Static]`
- **Backdrop Blur:** `[Value]px` (if glassmorphism)

#### **Interactive States**
| Element | Default | Hover | Active | Mobile |
|---------|---------|-------|--------|--------|
| Logo | `[State]` | `[State]` | `[State]` | `[State]` |
| Nav Items | `[State]` | `[State]` | `[State]` | `[State]` |
| CTA Button | `[State]` | `[State]` | `[State]` | `[State]` |
| Mobile Menu | `[State]` | `[State]` | `[State]` | `[State]` |

#### **Scroll Behavior**
- **On Scroll Down:** `[Behavior - e.g., Hide/Shrink/Change Background]`
- **On Scroll Up:** `[Behavior - e.g., Show/Expand]`
- **Scroll Threshold:** `[Value]px`

---

### 3. Feature Cards Section

#### **Wireframe Layout**
```
┌─────────────────────────────────────────────────┐
│              [Section Title]                     │
│            (Scroll-triggered)                   │
├─────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Card 1 │  │  Card 2 │  │  Card 3 │         │
│  │  (Icon) │  │  (Icon) │  │  (Icon) │         │
│  │  Title  │  │  Title  │  │  Title  │         │
│  │  Desc   │  │  Desc   │  │  Desc   │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│   (Hover)      (Hover)      (Hover)            │
└─────────────────────────────────────────────────┘
```

#### **Card Specifications**
- **Dimensions:** `[Width]px × [Height]px`
- **Border Radius:** `[Value]px`
- **Background:** `[Color/Glass/Gradient]`
- **Padding:** `[Value]px`
- **Gap Between Cards:** `[Value]px`

#### **Card Hover Effects**
- **Transform:** `[Scale/Rotate/Translate]`
- **Shadow:** `[Glow/Depth]`
- **Border:** `[Glow/Color Change]`
- **Background:** `[Brightness/Gradient Shift]`

#### **Animation Sequence**
1. **Cards Enter:** Staggered fade-in + slide-up (0-800ms, 200ms delay between)
2. **On Scroll:** Parallax effect (if applicable)
3. **On Hover:** Scale + Glow (300ms ease-out)

---

### 4. Content Sections

#### **Text + Image Layouts**
```
┌─────────────────────────────────────────────────┐
│  [Image/Video]        [Text Content]            │
│   (Parallax)          (Fade-in)                 │
│                                                 │
│  [Text Content]        [Image/Video]            │
│   (Fade-in)             (Parallax)               │
└─────────────────────────────────────────────────┘
```

#### **Animation Triggers**
- **Scroll Position:** `[Value]%` of viewport
- **Animation Type:** `[Fade/Slide/Scale/Parallax]`
- **Duration:** `[Value]ms`
- **Easing:** `[Easing Function]`

---

### 5. Footer

#### **Wireframe Layout**
```
┌─────────────────────────────────────────────────┐
│  [Logo]              [Links Column 1]            │
│                      [Links Column 2]            │
│                      [Links Column 3]            │
│                                                 │
│              [Social Icons]                      │
│              (Hover Glow)                        │
│                                                 │
│              [Copyright Text]                    │
└─────────────────────────────────────────────────┘
```

#### **Visual Specifications**
- **Background:** `[Color/Gradient]`
- **Text Color:** `[Color]`
- **Link Hover:** `[Glow/Color Change]`

---

## 🎬 Animation Specifications

### Animation Types Identified

#### **1. Scroll-Triggered Animations**
| Element | Trigger | Animation | Duration | Easing | Delay |
|---------|---------|-----------|----------|--------|-------|
| Hero Title | On Load | Fade + Slide | 600ms | ease-out | 0ms |
| Feature Cards | 50% viewport | Fade + Slide Up | 800ms | ease-out | Staggered |
| Content Sections | 30% viewport | Fade In | 600ms | ease-out | 0ms |
| Images | 40% viewport | Parallax | Continuous | linear | 0ms |

#### **2. Hover Animations**
| Element | Hover Effect | Duration | Easing |
|---------|--------------|----------|--------|
| Buttons | Scale + Glow | 300ms | ease-out |
| Cards | Lift + Shadow | 400ms | ease-out |
| Links | Underline + Color | 200ms | ease-in-out |
| Icons | Rotate + Glow | 300ms | ease-out |

#### **3. Entrance Animations**
| Element | Animation | Duration | Easing | Delay |
|---------|-----------|----------|--------|-------|
| Page Load | Fade In | 500ms | ease-in | 0ms |
| Hero Section | Sequential Fade | 1500ms | ease-out | 0ms |
| Navigation | Slide Down | 400ms | ease-out | 0ms |

#### **4. Idle Animations**
| Element | Animation | Duration | Loop | Easing |
|---------|-----------|----------|------|--------|
| Hero Character | Float | 4s | Infinite | ease-in-out |
| Particles | Drift | Continuous | Infinite | linear |
| Background Gradient | Shift | 10s | Infinite | ease |

#### **5. Looping Animations**
| Element | Animation | Duration | Loop | Easing |
|---------|-----------|----------|------|--------|
| Loading Spinner | Rotate | 1.5s | Infinite | linear |
| Glow Pulse | Pulse | 2s | Infinite | ease-in-out |
| Particle System | Continuous | N/A | Infinite | linear |

### Timing & Easing Reference

#### **Easing Functions**
```css
/* Standard Easings */
ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
ease-out: cubic-bezier(0, 0, 0.58, 1)
ease-in: cubic-bezier(0.42, 0, 1, 1)

/* Custom Cosmiv Easings */
cosmic-smooth: cubic-bezier(0.23, 1, 0.32, 1)
cosmic-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
cosmic-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6)
```

#### **Duration Guidelines**
- **Micro-interactions:** 150-300ms
- **Hover effects:** 200-400ms
- **Entrance animations:** 400-800ms
- **Page transitions:** 500-1000ms
- **Idle animations:** 2-10s (looping)

---

## 🎭 Character/Hero Animations

### Character Description
- **Type:** `[3D Model/2D Illustration/SVG/Image]`
- **Style:** `[Description]`
- **Position:** `[Location in Hero]`
- **Size:** `[Width]px × [Height]px`

### Animation Behaviors

#### **1. Floating Animation**
- **Type:** Vertical + Horizontal drift
- **Duration:** 4-6s (loop)
- **Easing:** `ease-in-out`
- **Range:** `±15px` vertical, `±10px` horizontal
- **Rotation:** `±2deg` (subtle)

**Implementation:**
```css
@keyframes float-cosmic {
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25% { transform: translateY(-15px) translateX(10px) rotate(1deg); }
  50% { transform: translateY(-25px) translateX(-5px) rotate(-2deg); }
  75% { transform: translateY(-10px) translateX(8px) rotate(1deg); }
}
```

#### **2. Cursor-Interactive Movement**
- **Type:** Subtle follow/magnetic effect
- **Sensitivity:** `[Value]px` per cursor movement
- **Max Displacement:** `[Value]px`
- **Smoothing:** `[Value]ms` (damping)

**Implementation:**
- **Library:** GSAP with `MousePlugin` or custom JS
- **Trigger:** Mouse move within hero section
- **Fallback:** Static position if JS disabled

#### **3. Entrance Animation**
- **Type:** `[Fade/Slide/Scale/3D Rotate]`
- **Duration:** `[Value]ms`
- **Easing:** `[Easing Function]`
- **Delay:** `[Value]ms` (after page load)

#### **4. Idle States**
- **Breathing:** Subtle scale pulse (2s loop)
- **Blink:** Eye/antenna blink (random, 3-5s intervals)
- **Glow Pulse:** Soft glow intensity change (3s loop)

### Implementation Recommendations

#### **Option 1: CSS Animations (Simple)**
- **Best for:** 2D illustrations, SVGs
- **Performance:** Excellent
- **Interactivity:** Limited
- **Fallback:** Static image/GIF

#### **Option 2: GSAP (Advanced)**
- **Best for:** Complex animations, cursor interaction
- **Performance:** Excellent (GPU-accelerated)
- **Interactivity:** Full control
- **Fallback:** CSS animations

#### **Option 3: Three.js (3D)**
- **Best for:** 3D models, complex scenes
- **Performance:** Good (requires GPU)
- **Interactivity:** Full 3D control
- **Fallback:** Static image or 2D version

#### **Option 4: Lottie (After Effects)**
- **Best for:** Complex 2D animations, character rigs
- **Performance:** Good (JSON-based)
- **Interactivity:** Limited (playback control)
- **Fallback:** Static image or GIF

### Recommended Approach for Cosmiv
**Primary:** GSAP for hero character (cursor interaction + smooth animations)  
**Fallback:** CSS animations for basic floating  
**Static Fallback:** Optimized PNG/GIF for performance-critical scenarios

---

## 🛠️ Implementation Recommendations

### Technology Stack

#### **Animation Libraries**
| Library | Use Case | Performance | Bundle Size |
|---------|----------|-------------|-------------|
| **GSAP** | Complex animations, scroll triggers, cursor interaction | ⭐⭐⭐⭐⭐ | ~45KB (gzipped) |
| **Framer Motion** | React component animations | ⭐⭐⭐⭐ | ~25KB (gzipped) |
| **Three.js** | 3D backgrounds, particles | ⭐⭐⭐⭐ | ~600KB (large) |
| **Lottie** | Complex 2D character animations | ⭐⭐⭐⭐ | ~50KB (gzipped) |
| **CSS Animations** | Simple hover, fade, float | ⭐⭐⭐⭐⭐ | 0KB (native) |

#### **Recommended Stack for Cosmiv**
1. **GSAP** - Primary animation engine (scroll triggers, complex sequences)
2. **CSS Animations** - Simple hover effects, idle animations
3. **Three.js** - Background effects (already in use via Planet3DBackground)
4. **Framer Motion** - React component transitions (already in use)

### Implementation Structure

#### **File Organization**
```
src/
├── animations/
│   ├── hero.js              # Hero section animations
│   ├── scroll.js            # Scroll-triggered animations
│   ├── hover.js             # Hover effects
│   └── character.js         # Character/hero animations
├── components/
│   ├── HeroSection.jsx      # Hero component
│   ├── FeatureCards.jsx     # Feature cards
│   └── [Other Components]
└── styles/
    ├── animations.css        # CSS keyframes
    └── [Component Styles]
```

#### **Animation Patterns**

**Pattern 1: Scroll-Triggered (GSAP)**
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.from('.feature-card', {
  scrollTrigger: {
    trigger: '.feature-section',
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2,
  ease: 'power2.out',
});
```

**Pattern 2: Hover Effects (CSS)**
```css
.feature-card {
  transition: transform 0.4s ease-out, box-shadow 0.4s ease-out;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(139, 92, 246, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}
```

**Pattern 3: Character Animation (GSAP + CSS)**
```javascript
// Cursor interaction
const heroCharacter = document.querySelector('.hero-character');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) * 0.01;
  mouseY = (e.clientY - window.innerHeight / 2) * 0.01;
  
  gsap.to(heroCharacter, {
    x: mouseX,
    y: mouseY,
    duration: 1,
    ease: 'power2.out',
  });
});
```

### Section Implementation Guide

#### **Hero Section**
1. **Background:** CSS gradient or Three.js particle system
2. **Title:** GSAP fade + slide on load
3. **Subtitle:** GSAP fade with delay
4. **Buttons:** CSS hover + GSAP click feedback
5. **Character:** GSAP cursor interaction + CSS float idle

#### **Navigation**
1. **Scroll Behavior:** GSAP ScrollTrigger (hide/show on scroll)
2. **Hover Effects:** CSS transitions
3. **Active States:** CSS + React state management

#### **Feature Cards**
1. **Entrance:** GSAP ScrollTrigger (staggered fade + slide)
2. **Hover:** CSS transforms + shadows
3. **Click:** GSAP scale animation

#### **Content Sections**
1. **Parallax:** GSAP ScrollTrigger parallax
2. **Fade-in:** GSAP ScrollTrigger fade
3. **Image Effects:** CSS filters + GSAP transforms

---

## ⚡ Performance Optimizations

### Animation Performance Checklist

#### **CSS Optimizations**
- ✅ Use `transform` and `opacity` (GPU-accelerated)
- ✅ Use `will-change` sparingly (only for active animations)
- ✅ Avoid animating `width`, `height`, `top`, `left` (causes reflow)
- ✅ Use `contain` for isolated animations
- ✅ Reduce motion for `prefers-reduced-motion`

#### **JavaScript Optimizations**
- ✅ Use `requestAnimationFrame` for smooth animations
- ✅ Debounce scroll/resize handlers
- ✅ Use GSAP's `will-change` auto-management
- ✅ Lazy load animation libraries
- ✅ Disable animations on low-end devices

#### **Asset Optimizations**
- ✅ Optimize images (WebP, compressed PNG)
- ✅ Use SVG for icons (scalable, small file size)
- ✅ Compress Lottie JSON files
- ✅ Use sprite sheets for multiple images
- ✅ Lazy load heavy assets

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **FPS** | 60 FPS | Chrome DevTools Performance |
| **First Paint** | < 1s | Lighthouse |
| **Time to Interactive** | < 3s | Lighthouse |
| **Animation Smoothness** | 60 FPS | Chrome DevTools Rendering |
| **Bundle Size** | < 200KB (gzipped) | Webpack Bundle Analyzer |

### Device-Specific Optimizations

#### **Desktop (High-End)**
- Full animations enabled
- 3D effects active
- Particle systems at full density
- Cursor interactions enabled

#### **Desktop (Mid-Range)**
- Animations enabled
- Reduced particle density
- Simplified 3D effects
- Cursor interactions enabled

#### **Mobile (High-End)**
- Animations enabled (reduced complexity)
- No 3D effects
- Minimal particles
- No cursor interactions
- Touch-optimized hover states

#### **Mobile (Low-End)**
- Essential animations only
- No 3D effects
- No particles
- Static fallbacks
- Reduced motion support

### Code Splitting Strategy
```javascript
// Lazy load GSAP ScrollTrigger
const { gsap } = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');

// Lazy load Three.js for 3D effects
const ThreeJSBackground = lazy(() => import('./components/ThreeJSBackground'));

// Conditional loading based on device
if (isHighEndDevice) {
  await import('./animations/advanced');
}
```

---

## 📱 Responsive Adaptation

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes | Animation Adjustments |
|------------|-------|----------------|----------------------|
| **Mobile** | < 640px | Single column, stacked | Simplified animations, no parallax |
| **Tablet** | 640px - 1024px | 2-column grid | Reduced parallax, simplified effects |
| **Desktop** | > 1024px | Full layout | All animations enabled |

### Mobile-Specific Considerations

#### **Touch Interactions**
- Replace hover with tap
- Larger touch targets (min 44×44px)
- Swipe gestures for carousels
- Pull-to-refresh (if applicable)

#### **Performance**
- Disable heavy animations
- Reduce particle count
- Static fallbacks for 3D
- Lazy load below-the-fold content

#### **Layout Adaptations**
- Stack cards vertically
- Full-width hero
- Simplified navigation (hamburger menu)
- Reduced spacing

### Tablet-Specific Considerations
- 2-column layouts where appropriate
- Moderate animation complexity
- Touch + mouse support
- Optimized font sizes

### Desktop-Specific Considerations
- Full animation suite
- Cursor interactions
- Hover states
- Multi-column layouts
- Parallax effects

---

## 📊 Animation Map

### Complete Animation Timeline

#### **Page Load Sequence**
```
0ms     → Background fade in
200ms   → Navigation slide down
500ms   → Hero background particles start
600ms   → Hero character float in
800ms   → Hero title slide + fade
1000ms  → Hero subtitle fade
1200ms  → CTA buttons scale in
1500ms  → Page fully loaded
```

#### **Scroll Sequence**
```
0%      → Hero section visible
25%     → Feature section enters viewport
30%     → Feature cards animate in (staggered)
50%     → Content section 1 fades in
70%     → Content section 2 fades in
90%     → Footer enters viewport
```

#### **Interaction Map**
```
Hover:
  - Buttons: Scale (1.0 → 1.05) + Glow
  - Cards: Lift (-8px) + Shadow increase
  - Links: Underline + Color change
  - Icons: Rotate (0deg → 5deg) + Glow

Click:
  - Buttons: Scale (1.05 → 0.95 → 1.0) + Ripple
  - Cards: Scale (1.0 → 0.98 → 1.0)
  - Links: Color flash

Scroll:
  - Navigation: Hide/Show based on direction
  - Parallax: Background layers move at different speeds
  - Sections: Fade in on enter viewport
```

---

## 🎯 Implementation Priority

### Phase 1: Core Animations (MVP)
- [ ] Hero section entrance animations
- [ ] Button hover effects
- [ ] Card hover effects
- [ ] Basic scroll-triggered fades
- [ ] Navigation scroll behavior

### Phase 2: Enhanced Interactions
- [ ] Character cursor interaction
- [ ] Parallax effects
- [ ] Staggered card animations
- [ ] Advanced hover states
- [ ] Loading animations

### Phase 3: Polish & Performance
- [ ] Particle systems
- [ ] Advanced 3D effects
- [ ] Micro-interactions
- [ ] Performance optimizations
- [ ] Mobile adaptations

---

## 📝 Notes & Considerations

### Design Alignment
- All animations should align with Cosmiv's futuristic, cosmic aesthetic
- Use brand colors (violet, cyan, deep blue) for glows and accents
- Maintain dark space-tech theme throughout
- Broken Planet streetwear influences in typography and edge effects

### Accessibility
- Respect `prefers-reduced-motion` media query
- Provide static fallbacks for all animations
- Ensure animations don't interfere with content readability
- Test with screen readers

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge) - Full support
- Older browsers - Graceful degradation
- Mobile browsers - Optimized experience

### Testing Checklist
- [ ] Test on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile (iOS Safari, Chrome Mobile)
- [ ] Test with reduced motion enabled
- [ ] Test performance on low-end devices
- [ ] Test with slow network (lazy loading)
- [ ] Test with JavaScript disabled (fallbacks)

---

## 🔗 References & Resources

### Design Inspiration
- Target website: [URL]
- Cosmiv design system: `tailwind.config.js`
- Existing animations: `src/styles/cosmic-animations.css`

### Documentation
- GSAP: https://greensock.com/docs/
- Framer Motion: https://www.framer.com/motion/
- Three.js: https://threejs.org/docs/
- Lottie: https://airbnb.io/lottie/

### Tools
- Chrome DevTools Performance
- Lighthouse
- WebPageTest
- GSAP DevTools

---

**Document Status:** Framework Ready  
**Next Steps:** Add scraped assets and fill in specific values  
**Last Updated:** 2025-01-27

