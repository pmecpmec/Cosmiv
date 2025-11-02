# ⚫⚪ Aiditor Black/White Aesthetic Design System

## Design Philosophy

Inspired by:

- **Tyler the Creator's album aesthetics** (IGOR, CALL ME IF YOU GET LOST)
- **Poppr.be minimalism** ([Poppr](https://www.poppr.be/en)) - sophisticated spacing, bold typography, immersive scroll experiences

- **Pure minimalism** - Black and white only
- **High contrast** - Bold, striking visuals
- **Premium feel** - Expensive, sophisticated look
- **Clean lines** - Sharp edges, no unnecessary elements
- **Bold typography** - Strong, confident text

---

## Color Palette

### Core Colors

```css
/* Pure Colors */
--black: #000000;
--white: #ffffff;

/* Gray Scale (for subtle depth) */
--gray-1: #1a1a1a;
--gray-2: #2a2a2a;
--gray-3: #3a3a3a;
--gray-4: #4a4a4a;

/* Utility */
--border: rgba(255, 255, 255, 0.1);
--border-strong: rgba(255, 255, 255, 0.2);
```

### Usage Rules

- **Background:** Pure black (`#000000`)
- **Text:** Pure white (`#FFFFFF`)
- **Borders:** White with low opacity (10-20%)
- **Hover states:** Subtle white opacity increase
- **Accents:** Minimal gray scale only when depth needed

---

## Typography

### Font Stack

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Scale

- **H1:** `font-size: 4rem; font-weight: 900;` (Bold, massive)
- **H2:** `font-size: 3rem; font-weight: 800;`
- **H3:** `font-size: 2rem; font-weight: 700;`
- **Body:** `font-size: 1rem; font-weight: 400;`
- **Small:** `font-size: 0.875rem; font-weight: 400;`

### Letter Spacing (Poppr-inspired)

- **Display Headlines:** `letter-spacing: 0.1em` (spaced, like "P o p p r")
- **Headlines:** `letter-spacing: -0.02em` (tighter)
- **Body:** `letter-spacing: 0` (normal)
- **Labels/Nav:** `letter-spacing: 0.05em` (subtle spacing)

---

## Component Styles

### Buttons

**Primary:**

```css
background: white;
color: black;
border: 2px solid white;
font-weight: 700;
padding: 12px 24px;
transition: all 0.2s;
```

**Secondary:**

```css
background: transparent;
color: white;
border: 2px solid white;
font-weight: 600;
```

**Hover:**

- Primary: `opacity: 0.9`
- Secondary: `background: white; color: black;`

### Cards

```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: none; /* No blur in B/W aesthetic */
```

### Input Fields

```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.2);
color: white;
```

**Focus:**

```css
border-color: white;
outline: 2px solid white;
outline-offset: 2px;
```

---

## Layout Principles (Poppr-inspired)

1. **Extremely generous whitespace** - Much more breathing room than typical sites
2. **Sharp corners** - No rounded corners (or minimal, like 2px)
3. **Grid-based** - Clean alignment with precise spacing
4. **No shadows** - Flat design
5. **High contrast** - Always ensure readability
6. **Scroll-based reveals** - Content appears on scroll (scrollytelling)
7. **Section transitions** - Smooth transitions between sections
8. **Vertical rhythm** - Consistent spacing using multiples (e.g., 8px grid)
9. **Large display typography** - Hero text can be massive with letter spacing
10. **Minimal navigation** - Clean, unobtrusive header

---

## UI Components Redesign

### Header

- Pure black background
- White text
- White border bottom
- Bold logo/text
- Sharp edges

### Feed Posts

- White card on black
- Sharp corners
- Bold captions
- High contrast video thumbnails
- Clean action buttons

### Navigation

- Sidebar: Black with white text
- Active state: White background, black text
- No gradients, no colors

### Forms

- White input borders
- Black backgrounds
- White text
- Sharp focus states

---

## Implementation Guide

### Step 1: Update Tailwind Config

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        "pure-black": "#000000",
        "pure-white": "#FFFFFF",
        "bw-gray": {
          1: "#1a1a1a",
          2: "#2a2a2a",
          3: "#3a3a3a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontWeight: {
        black: 900,
      },
    },
  },
};
```

### Step 2: Global CSS Override

Replace gradient backgrounds with:

```css
body {
  background: #000000;
  color: #ffffff;
}
```

### Step 3: Component Updates

Update all components to use:

- `bg-black` / `bg-white` instead of gradients
- `border-white/10` for borders
- `text-white` / `text-black` for text
- Remove purple/blue color schemes
- Remove rounded corners (or minimal)
- Remove shadows
- Remove backdrop blur

---

## Examples

### Button

```jsx
<button className="bg-white text-black font-black px-6 py-3 border-2 border-white hover:opacity-90">
  Click Me
</button>
```

### Card

```jsx
<div className="bg-white/5 border border-white/10 p-6">
  <h2 className="text-white font-black text-2xl mb-4">Title</h2>
  <p className="text-white/80">Content</p>
</div>
```

### Input

```jsx
<input
  className="bg-black border-2 border-white/20 text-white px-4 py-2 focus:border-white focus:outline-none"
  type="text"
/>
```

---

## Tyler the Creator Album Inspiration

**Key Visual Elements:**

- Bold, sans-serif typography
- High contrast black/white photography
- Clean geometric shapes
- Minimal color usage
- Premium, luxury aesthetic
- Striking simplicity

**Aiditor Implementation:**

- Black background with white elements
- Bold, heavy fonts
- Sharp, clean UI components
- No color distractions
- Expensive, premium feel
- Minimal but impactful

---

## Component Checklist

- [ ] Header (black bg, white text)
- [ ] Navigation (clean tabs)
- [ ] Feed (white cards on black)
- [ ] Buttons (white/black contrast)
- [ ] Forms (black bg, white borders)
- [ ] Cards (white/5 opacity)
- [ ] Modals (black bg, white borders)
- [ ] Landing page (black/white only)
- [ ] Remove all gradients
- [ ] Remove all purple/blue colors
- [ ] Remove rounded corners (or minimal)
- [ ] Remove shadows
- [ ] Remove backdrop blur
- [ ] Update all icons (monochrome)
