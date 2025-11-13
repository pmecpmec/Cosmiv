# ⚡ Animation Implementation Guide
## Quick Reference for Developers

This guide provides actionable implementation steps for recreating animations from scraped assets in the Cosmiv project.

---

## 🚀 Quick Start

### 1. Analyze Assets
Use `ASSET_ANALYSIS_TEMPLATE.md` to document scraped assets.

### 2. Review Plan
Reference `VISUAL_ANIMATION_RECREATION_PLAN.md` for comprehensive specifications.

### 3. Implement
Follow this guide for step-by-step implementation.

---

## 📦 Setup

### Install Dependencies
```bash
npm install gsap
# GSAP plugins (if needed)
npm install @gsap/react
```

### Import in Components
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react'; // For React

gsap.registerPlugin(ScrollTrigger);
```

---

## 🎬 Common Animation Patterns

### Pattern 1: Hero Section Entrance

```javascript
// In HeroSection.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroSection() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background fade in
      gsap.from(heroRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Title slide + fade
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out',
      });

      // Subtitle fade
      gsap.from(subtitleRef.current, {
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: 'power2.out',
      });

      // Buttons scale in
      gsap.from(buttonsRef.current.children, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        delay: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="hero-section">
      <h1 ref={titleRef}>Hero Title</h1>
      <p ref={subtitleRef}>Hero Subtitle</p>
      <div ref={buttonsRef}>
        <button>CTA 1</button>
        <button>CTA 2</button>
      </div>
    </section>
  );
}
```

### Pattern 2: Scroll-Triggered Cards

```javascript
// In FeatureCards.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function FeatureCards() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="feature-section">
      {cards.map((card, index) => (
        <div
          key={card.id}
          ref={(el) => (cardsRef.current[index] = el)}
          className="feature-card"
        >
          {/* Card content */}
        </div>
      ))}
    </section>
  );
}
```

### Pattern 3: Hover Effects (CSS)

```css
/* In component CSS or global styles */
.feature-card {
  transition: transform 0.4s ease-out, box-shadow 0.4s ease-out;
  transform-style: preserve-3d;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(139, 92, 246, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.button-primary {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  background: linear-gradient(135deg, #8B5CF6 0%, #1E3A8A 50%, #00FFFF 100%);
  background-size: 200% 200%;
}

.button-primary:hover {
  transform: scale(1.05);
  background-position: 100% 100%;
  box-shadow: 
    0 0 30px rgba(139, 92, 246, 0.6),
    0 0 50px rgba(0, 255, 255, 0.4);
}

.button-primary:active {
  transform: scale(0.98);
}
```

### Pattern 4: Character Cursor Interaction

```javascript
// In HeroCharacter.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HeroCharacter() {
  const characterRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const character = characterRef.current;
    const container = containerRef.current;
    
    if (!character || !container) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) * 0.01;
      mouseY = (e.clientY - rect.top - rect.height / 2) * 0.01;
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;

      gsap.set(character, {
        x: currentX,
        y: currentY,
      });

      requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-character-container">
      <div ref={characterRef} className="hero-character animate-float-cosmic">
        {/* Character content */}
      </div>
    </div>
  );
}
```

### Pattern 5: Navigation Scroll Behavior

```javascript
// In Navigation.jsx
import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        setIsScrolled(true);
        
        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY) {
          gsap.to(navRef.current, {
            y: -100,
            duration: 0.3,
            ease: 'power2.out',
          });
        } else {
          gsap.to(navRef.current, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      } else {
        setIsScrolled(false);
        gsap.to(navRef.current, {
          y: 0,
          duration: 0.3,
        });
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`navigation ${isScrolled ? 'scrolled' : ''}`}
    >
      {/* Navigation content */}
    </nav>
  );
}
```

---

## 🎨 CSS Animation Utilities

### Use Existing Animations
Reference `src/styles/cosmic-animations.css` for pre-built animations:

```css
/* Float animation */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Glow pulse */
.animate-cosmic-glow {
  animation: cosmic-glow 2s ease-in-out infinite;
}

/* Shimmer effect */
.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

### Create Custom Animations
Add to `src/styles/cosmic-animations.css`:

```css
@keyframes custom-animation {
  0% {
    /* Initial state */
  }
  50% {
    /* Mid state */
  }
  100% {
    /* Final state */
  }
}

.custom-element {
  animation: custom-animation 2s ease-in-out infinite;
}
```

---

## 📱 Responsive Considerations

### Mobile Optimizations

```javascript
// Detect device type
const isMobile = window.innerWidth < 640;
const isLowEndDevice = navigator.hardwareConcurrency < 4;

// Conditionally enable animations
useEffect(() => {
  if (isMobile || isLowEndDevice) {
    // Disable heavy animations
    gsap.set('.heavy-animation', { display: 'none' });
  }
}, []);
```

### Reduced Motion Support

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```javascript
// In JavaScript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Disable or simplify animations
  gsap.set('.animated-element', { opacity: 1, y: 0 });
}
```

---

## ⚡ Performance Best Practices

### 1. Use GPU-Accelerated Properties
```css
/* ✅ Good - GPU accelerated */
transform: translateY(-10px);
opacity: 0.8;

/* ❌ Bad - Causes reflow */
top: -10px;
width: 200px;
```

### 2. Debounce Scroll Handlers
```javascript
import { debounce } from 'lodash'; // or implement custom

const handleScroll = debounce(() => {
  // Scroll logic
}, 16); // ~60fps

window.addEventListener('scroll', handleScroll, { passive: true });
```

### 3. Use will-change Sparingly
```css
/* Only for actively animating elements */
.animating-element {
  will-change: transform, opacity;
}

/* Remove after animation */
.animating-element.animation-complete {
  will-change: auto;
}
```

### 4. Lazy Load Heavy Libraries
```javascript
// Lazy load GSAP ScrollTrigger
const initScrollAnimations = async () => {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  // Initialize scroll animations
};
```

### 5. Clean Up GSAP Contexts
```javascript
useEffect(() => {
  const ctx = gsap.context(() => {
    // GSAP animations
  }, containerRef);

  return () => ctx.revert(); // Clean up
}, []);
```

---

## 🧪 Testing Checklist

### Functionality
- [ ] Animations trigger correctly
- [ ] Hover effects work on desktop
- [ ] Touch interactions work on mobile
- [ ] Scroll animations fire at correct points
- [ ] Navigation scroll behavior works

### Performance
- [ ] 60 FPS maintained during animations
- [ ] No janky animations
- [ ] Smooth on mobile devices
- [ ] No memory leaks (check with DevTools)

### Accessibility
- [ ] Reduced motion respected
- [ ] Static fallbacks provided
- [ ] No animations block content
- [ ] Screen reader compatible

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## 🐛 Common Issues & Solutions

### Issue: Animations Not Triggering
**Solution:** Check GSAP plugin registration and ScrollTrigger setup.

### Issue: Janky Animations
**Solution:** Use `transform` and `opacity` only, avoid layout properties.

### Issue: ScrollTrigger Not Working
**Solution:** Ensure ScrollTrigger is registered and trigger element is visible.

### Issue: Performance Issues on Mobile
**Solution:** Disable heavy animations, reduce particle count, use static fallbacks.

### Issue: Memory Leaks
**Solution:** Always clean up GSAP contexts and event listeners in `useEffect` cleanup.

---

## 📚 Resources

- **GSAP Docs:** https://greensock.com/docs/
- **Framer Motion:** https://www.framer.com/motion/
- **CSS Animations:** https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- **Performance:** https://web.dev/animations/

---

**Guide Version:** 1.0  
**Last Updated:** 2025-01-27

