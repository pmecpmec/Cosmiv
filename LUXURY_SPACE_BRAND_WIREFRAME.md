# 🌌 Luxury Space Brand Website - Complete Wireframe & Design System

## 🎨 **Design Philosophy**
Premium, cinematic, emotionally engaging. Think Rolex meets Ferrari meets Cosmiv. Every element should feel expensive, rare, and cosmic.

---

## 📐 **SECTION-BY-SECTION WIREFRAME**

### **1. HEADER / NAVIGATION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]          NAV  NAV  NAV  NAV          [CTA BTN] │
│  (thin serif)    (uppercase, spaced)                    │
│  letter-spaced                                          │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Height:** 80px (desktop), 60px (mobile)
- **Background:** Transparent → `rgba(11, 12, 16, 0.8)` on scroll
- **Backdrop:** `backdrop-blur-xl`
- **Logo:** 
  - Font: Thin serif (Playfair Display / Cormorant Garamond)
  - Size: 28px (desktop), 24px (mobile)
  - Letter-spacing: 0.15em
  - Color: `#F5F5F5`
- **Navigation Links:**
  - Font: Sans-serif (Inter / Exo 2)
  - Size: 14px
  - Weight: 500
  - Letter-spacing: 0.1em
  - Uppercase
  - Color: `#C0C0C0` → `#00FFF7` on hover
  - Hover: Subtle underline (2px, `#00FFF7`) or glow
- **CTA Button:**
  - Text: "RESERVE NOW"
  - Padding: 12px 32px
  - Border: 1px solid `#00FFF7`
  - Background: Transparent → `rgba(0, 255, 247, 0.1)` on hover
  - Glow: `0 0 20px rgba(0, 255, 247, 0.5)` on hover

**Tailwind Classes:**
```jsx
<header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(11,12,16,0.8)] backdrop-blur-xl border-b border-[rgba(0,255,247,0.1)]">
  <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
    <div className="font-serif text-2xl tracking-[0.15em] text-[#F5F5F5]">BRAND</div>
    <div className="hidden md:flex gap-8">
      <a className="text-sm font-medium tracking-[0.1em] uppercase text-[#C0C0C0] hover:text-[#00FFF7] transition-all hover:underline hover:underline-offset-4">COLLECTIONS</a>
      {/* ... more nav items */}
    </div>
    <button className="px-8 py-3 border border-[#00FFF7] text-[#00FFF7] hover:bg-[rgba(0,255,247,0.1)] hover:shadow-[0_0_20px_rgba(0,255,247,0.5)] transition-all">RESERVE NOW</button>
  </nav>
</header>
```

---

### **2. HERO SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Cinematic Image/Video]            │
│                    Dark gradient overlay                │
│                    Subtle light rays                    │
│                                                         │
│                    CENTERED TAGLINE                    │
│                    (Large serif, bold)                  │
│                                                         │
│                    Subline text                        │
│                    (Medium sans-serif)                 │
│                                                         │
│                    [CTA BUTTON]                        │
│                    (Glowing accent)                     │
│                                                         │
│                    [Scroll Indicator]                  │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Height:** 100vh (fullscreen)
- **Background:** 
  - Image/Video with dark gradient overlay
  - Gradient: `linear-gradient(180deg, rgba(11,12,16,0.4) 0%, rgba(16,18,43,0.6) 50%, rgba(0,255,247,0.1) 100%)`
  - Subtle cinematic light rays (CSS or image overlay)
- **Tagline:**
  - Font: Serif (Playfair Display / Cormorant)
  - Size: `clamp(3rem, 8vw, 7rem)` (responsive)
  - Weight: 700 (bold)
  - Color: `#F5F5F5`
  - Letter-spacing: 0.05em
  - Text-shadow: `0 0 40px rgba(255, 215, 0, 0.3), 0 0 80px rgba(0, 255, 247, 0.2)`
  - Animation: Fade-in from bottom (1s ease-out, delay 0.3s)
- **Subline:**
  - Font: Sans-serif (Inter / Exo 2)
  - Size: `clamp(1.25rem, 2vw, 1.75rem)`
  - Weight: 300 (light)
  - Color: `#C0C0C0`
  - Letter-spacing: 0.05em
  - Animation: Fade-in (1s ease-out, delay 0.6s)
- **CTA Button:**
  - Text: "EXPLORE COLLECTION"
  - Padding: 20px 48px
  - Font: Sans-serif, uppercase, letter-spaced
  - Border: 2px solid `#00FFF7`
  - Background: Transparent → `rgba(0, 255, 247, 0.15)` on hover
  - Glow: `0 0 30px rgba(0, 255, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)`
  - Animation: Fade-in + scale (1s ease-out, delay 0.9s)
- **Particles/Shimmer:**
  - Slow-moving particles (CSS or Three.js)
  - Subtle light shimmer effect
  - Parallax on scroll

**Tailwind Classes:**
```jsx
<section className="relative h-screen flex items-center justify-center overflow-hidden">
  {/* Background Image/Video */}
  <div className="absolute inset-0 bg-gradient-to-b from-[rgba(11,12,16,0.4)] via-[rgba(16,18,43,0.6)] to-[rgba(0,255,247,0.1)]">
    <img src="hero-image.jpg" className="w-full h-full object-cover opacity-50" />
  </div>
  
  {/* Content */}
  <div className="relative z-10 text-center px-6">
    <h1 className="font-serif text-[clamp(3rem,8vw,7rem)] font-bold tracking-[0.05em] text-[#F5F5F5] mb-6 animate-fade-in-up">
      ELEVATE BEYOND EARTH
    </h1>
    <p className="font-sans text-[clamp(1.25rem,2vw,1.75rem)] font-light tracking-[0.05em] text-[#C0C0C0] mb-12 animate-fade-in delay-300">
      Where luxury meets the cosmos
    </p>
    <button className="px-12 py-5 border-2 border-[#00FFF7] text-[#00FFF7] uppercase tracking-[0.1em] hover:bg-[rgba(0,255,247,0.15)] hover:shadow-[0_0_30px_rgba(0,255,247,0.6)] transition-all animate-fade-in delay-600">
      EXPLORE COLLECTION
    </button>
  </div>
  
  {/* Scroll Indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <div className="w-6 h-10 border-2 border-[#00FFF7] rounded-full flex items-start justify-center p-2">
      <div className="w-1.5 h-3 bg-[#00FFF7] rounded-full"></div>
    </div>
  </div>
</section>
```

---

### **3. FEATURE HIGHLIGHTS / USP SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              SECTION TITLE (Uppercase Serif)           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ [Image]  │  │ [Image]  │  │ [Image]  │  │[Image] ││
│  │   Icon   │  │   Icon   │  │   Icon   │  │  Icon  ││
│  │  TITLE   │  │  TITLE   │  │  TITLE   │  │ TITLE  ││
│  │  Desc    │  │  Desc    │  │  Desc    │  │  Desc  ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Padding:** 120px vertical, 80px horizontal (desktop)
- **Background:** `#0B0C10` (Deep Space Black)
- **Section Title:**
  - Font: Serif, uppercase
  - Size: `clamp(2.5rem, 5vw, 4rem)`
  - Color: `#F5F5F5`
  - Letter-spacing: 0.1em
  - Margin-bottom: 80px
- **Cards (4 columns desktop, 1 column mobile):**
  - **Spacing:** 32px gap
  - **Card:**
    - Background: `#1C1E26` (Dark Charcoal)
    - Border: 1px solid `rgba(0, 255, 247, 0.1)`
    - Border-radius: 8px
    - Padding: 40px
    - Height: 500px
    - Overflow: hidden
  - **Image:**
    - Height: 60% of card
    - Object-fit: cover
    - Border-radius: 4px
    - Hover: Scale 1.1, transition 0.6s ease
  - **Icon:**
    - Size: 48px
    - Color: `#00FFF7`
    - Margin: 24px 0
  - **Title:**
    - Font: Serif, uppercase
    - Size: 24px
    - Weight: 600
    - Color: `#F5F5F5`
    - Letter-spacing: 0.1em
    - Margin-bottom: 12px
  - **Description:**
    - Font: Sans-serif
    - Size: 16px
    - Color: `#C0C0C0`
    - Line-height: 1.6
  - **Hover Effects:**
    - Card: Border color → `#00FFF7`, shadow `0 0 30px rgba(0, 255, 247, 0.3)`
    - Image: Zoom 1.1
    - Light reflection overlay

**Tailwind Classes:**
```jsx
<section className="py-32 px-20 bg-[#0B0C10]">
  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20">
    EXCEPTIONAL FEATURES
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {features.map((feature, i) => (
      <div key={i} className="bg-[#1C1E26] border border-[rgba(0,255,247,0.1)] rounded-lg p-10 h-[500px] overflow-hidden hover:border-[#00FFF7] hover:shadow-[0_0_30px_rgba(0,255,247,0.3)] transition-all group">
        <div className="h-[60%] mb-6 overflow-hidden rounded">
          <img 
            src={feature.image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
          />
        </div>
        <div className="text-5xl mb-6 text-[#00FFF7]">{feature.icon}</div>
        <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-[#F5F5F5] mb-3 font-semibold">
          {feature.title}
        </h3>
        <p className="font-sans text-base text-[#C0C0C0] leading-relaxed">
          {feature.description}
        </p>
      </div>
    ))}
  </div>
</section>
```

---

### **4. COLLECTIONS / GALLERY SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              SECTION TITLE                              │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │[Img] │ │[Img] │ │[Img] │ │[Img] │                 │
│  │Caption│ │Caption│ │Caption│ │Caption│                 │
│  └──────┘ └──────┘ └──────┘ └──────┘                 │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │[Img] │ │[Img] │ │[Img] │ │[Img] │                 │
│  └──────┘ └──────┘ └──────┘ └──────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Padding:** 120px vertical
- **Background:** `#10122B` (Cosmic Navy)
- **Grid:**
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 2 columns
  - Gap: 24px
- **Image Cards:**
  - Aspect-ratio: 4:3
  - Border-radius: 4px
  - Overflow: hidden
  - Position: relative
- **Hover Effects:**
  - Image: Scale 1.05
  - Overlay: Dark gradient with caption
  - Glow: `0 0 20px rgba(0, 255, 247, 0.4)`
- **Caption:**
  - Font: Sans-serif, uppercase
  - Size: 14px
  - Color: `#F5F5F5`
  - Letter-spacing: 0.1em
  - Position: Absolute bottom, left, right
  - Padding: 20px
  - Background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)`
- **Lightbox:**
  - Fullscreen overlay
  - Dark background `rgba(11, 12, 16, 0.95)`
  - Centered image
  - Close button (top-right)

**Tailwind Classes:**
```jsx
<section className="py-32 px-20 bg-[#10122B]">
  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20">
    COLLECTIONS
  </h2>
  
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {galleryItems.map((item, i) => (
      <div 
        key={i}
        className="relative aspect-[4/3] rounded overflow-hidden group cursor-pointer"
        onClick={() => openLightbox(item)}
      >
        <img 
          src={item.image} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5]">
              {item.caption}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00FFF7] group-hover:shadow-[0_0_20px_rgba(0,255,247,0.4)] transition-all"></div>
      </div>
    ))}
  </div>
</section>
```

---

### **5. BRAND STORY / PHILOSOPHY SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐                     │
│  │              │  │  TITLE       │                     │
│  │   [Image/    │  │  (Serif)     │                     │
│  │    Video]    │  │              │                     │
│  │              │  │  Paragraph 1 │                     │
│  │              │  │  (Sans-serif)│                     │
│  │              │  │              │                     │
│  │              │  │  ─────────   │                     │
│  │              │  │  (Separator) │                     │
│  │              │  │              │                     │
│  │              │  │  Paragraph 2 │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Layout:** 50/50 split (desktop), stacked (mobile)
- **Padding:** 120px vertical
- **Background:** `#0B0C10`
- **Image/Video Side:**
  - Width: 50%
  - Height: 600px
  - Object-fit: cover
  - Border-radius: 8px
  - Overlay: Subtle gradient
- **Text Side:**
  - Width: 50%
  - Padding: 60px
  - **Title:**
    - Font: Serif
    - Size: `clamp(2rem, 4vw, 3.5rem)`
    - Weight: 600
    - Color: `#FFD700` (Galactic Gold)
    - Margin-bottom: 40px
  - **Paragraphs:**
    - Font: Sans-serif
    - Size: 18px
    - Line-height: 1.8
    - Color: `#C0C0C0`
    - Margin-bottom: 32px
  - **Separator:**
    - Width: 60px
    - Height: 2px
    - Background: `linear-gradient(90deg, #FFD700, #00FFF7)`
    - Margin: 32px 0
- **Animations:**
  - Fade-in paragraphs (staggered)
  - Image parallax on scroll

**Tailwind Classes:**
```jsx
<section className="py-32 px-20 bg-[#0B0C10]">
  <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    {/* Image/Video */}
    <div className="relative h-[600px] rounded-lg overflow-hidden">
      <img src="brand-story.jpg" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,247,0.1)] to-transparent"></div>
    </div>
    
    {/* Text */}
    <div className="p-16">
      <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold text-[#FFD700] mb-10">
        Our Philosophy
      </h2>
      <p className="font-sans text-lg text-[#C0C0C0] leading-relaxed mb-8 animate-fade-in">
        Where luxury meets the cosmos, we craft experiences that transcend earthly boundaries.
      </p>
      <div className="w-16 h-0.5 bg-gradient-to-r from-[#FFD700] to-[#00FFF7] my-8"></div>
      <p className="font-sans text-lg text-[#C0C0C0] leading-relaxed animate-fade-in delay-200">
        Every detail is meticulously designed to evoke wonder, elegance, and the infinite possibilities of space.
      </p>
    </div>
  </div>
</section>
```

---

### **6. TESTIMONIALS / CLIENTS SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              SECTION TITLE                              │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  [Photo]  │  "Quote text"                    │      │
│  │           │  - Name, Title                   │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│              [Navigation Dots]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Padding:** 120px vertical
- **Background:** `#1C1E26`
- **Carousel:**
  - Width: 100%
  - Max-width: 1000px
  - Margin: 0 auto
- **Testimonial Card:**
  - Background: `#0B0C10`
  - Border: 1px solid `rgba(0, 255, 247, 0.2)`
  - Border-radius: 12px
  - Padding: 60px
  - Display: Flex (image left, text right)
- **Photo:**
  - Width: 120px
  - Height: 120px
  - Border-radius: 50%
  - Border: 3px solid `#00FFF7`
  - Hover: Scale 1.1, glow
- **Quote:**
  - Font: Serif, italic
  - Size: 24px
  - Color: `#F5F5F5`
  - Line-height: 1.6
  - Margin-bottom: 24px
- **Author:**
  - Font: Sans-serif, uppercase
  - Size: 14px
  - Color: `#00FFF7`
  - Letter-spacing: 0.1em
- **Navigation:**
  - Dots: 8px circle, `rgba(0, 255, 247, 0.3)` → `#00FFF7` active
  - Arrows: `#00FFF7`, hover glow

**Tailwind Classes:**
```jsx
<section className="py-32 px-20 bg-[#1C1E26]">
  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.1em] text-[#F5F5F5] text-center mb-20">
    TESTIMONIALS
  </h2>
  
  <div className="max-w-5xl mx-auto">
    <div className="bg-[#0B0C10] border border-[rgba(0,255,247,0.2)] rounded-xl p-16 flex gap-12 items-center">
      <img 
        src="testimonial-photo.jpg" 
        className="w-32 h-32 rounded-full border-4 border-[#00FFF7] hover:scale-110 hover:shadow-[0_0_30px_rgba(0,255,247,0.5)] transition-all"
      />
      <div>
        <p className="font-serif text-2xl italic text-[#F5F5F5] leading-relaxed mb-6">
          "An extraordinary experience that redefines luxury."
        </p>
        <p className="font-sans text-sm uppercase tracking-[0.1em] text-[#00FFF7]">
          — JOHN DOE, CEO
        </p>
      </div>
    </div>
  </div>
</section>
```

---

### **7. PRODUCT DETAILS / FEATURES SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │              │  │  PRODUCT     │                     │
│  │   [3D Model] │  │  NAME        │                     │
│  │   (Interactive)│ │  (Serif)     │                     │
│  │              │  │              │                     │
│  │              │  │  SPECS:      │                     │
│  │              │  │  • Feature 1 │                     │
│  │              │  │  • Feature 2 │                     │
│  │              │  │  • Feature 3 │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Layout:** 50/50 split
- **Padding:** 120px vertical
- **Background:** `#0B0C10`
- **3D Model:**
  - Width: 50%
  - Height: 600px
  - Background: Dark gradient
  - Interactive rotation on mouse move
  - Glow effect around model
- **Specs Side:**
  - **Product Name:**
    - Font: Serif, uppercase
    - Size: `clamp(2rem, 4vw, 3rem)`
    - Color: `#F5F5F5`
    - Letter-spacing: 0.1em
  - **Specs List:**
    - Font: Sans-serif
    - Size: 18px
    - Color: `#C0C0C0`
    - Line-height: 2
    - List-style: Custom (cosmic icon)
- **Animations:**
  - Fade-in on scroll
  - 3D model rotation

**Tailwind Classes:**
```jsx
<section className="py-32 px-20 bg-[#0B0C10]">
  <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    {/* 3D Model */}
    <div className="h-[600px] bg-gradient-to-br from-[#10122B] to-[#0B0C10] rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Three.js or CSS 3D model here */}
      <div className="absolute inset-0 border border-[rgba(0,255,247,0.2)] rounded-lg"></div>
    </div>
    
    {/* Specs */}
    <div className="p-16">
      <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] uppercase tracking-[0.1em] text-[#F5F5F5] mb-12">
        PRODUCT NAME
      </h2>
      <ul className="space-y-6">
        <li className="font-sans text-lg text-[#C0C0C0] flex items-start">
          <span className="text-[#00FFF7] mr-4">✦</span>
          <span>Premium material construction</span>
        </li>
        {/* ... more specs */}
      </ul>
    </div>
  </div>
</section>
```

---

### **8. CALL TO ACTION SECTION**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Blurred Product Image]              │
│                    Dark overlay                          │
│                                                         │
│                    CENTERED CTA                         │
│                    "RESERVE YOURS NOW"                  │
│                    (Large, minimal border)              │
│                    (Subtle glow/pulse)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Height:** 500px
- **Background:**
  - Blurred product image
  - Dark overlay: `rgba(11, 12, 16, 0.7)`
- **CTA Button:**
  - Text: "RESERVE YOURS NOW"
  - Font: Sans-serif, uppercase
  - Size: 18px
  - Letter-spacing: 0.15em
  - Padding: 24px 64px
  - Border: 2px solid `#00FFF7`
  - Background: Transparent
  - Color: `#00FFF7`
  - Glow: `0 0 40px rgba(0, 255, 247, 0.6)`
  - Pulse animation: 2s infinite
- **Hover:**
  - Background: `rgba(0, 255, 247, 0.1)`
  - Glow increase: `0 0 60px rgba(0, 255, 247, 0.8)`

**Tailwind Classes:**
```jsx
<section className="relative h-[500px] flex items-center justify-center overflow-hidden">
  {/* Blurred Background */}
  <div className="absolute inset-0">
    <img src="product-cta.jpg" className="w-full h-full object-cover blur-sm" />
    <div className="absolute inset-0 bg-[rgba(11,12,16,0.7)]"></div>
  </div>
  
  {/* CTA */}
  <button className="relative z-10 px-16 py-6 border-2 border-[#00FFF7] text-[#00FFF7] uppercase tracking-[0.15em] text-lg hover:bg-[rgba(0,255,247,0.1)] hover:shadow-[0_0_60px_rgba(0,255,247,0.8)] transition-all animate-pulse">
    RESERVE YOURS NOW
  </button>
</section>
```

---

### **9. FOOTER**

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  LOGO    │  │  NAV     │  │  SOCIAL  │  │ CONTACT││
│  │  Tagline │  │  Links   │  │  Icons   │  │        ││
│  │          │  │          │  │          │  │Newsletter│
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
│              Copyright © 2024                           │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Padding:** 80px vertical, 60px horizontal
- **Background:** `#0B0C10` (Deep Space Black)
- **Border-top:** 1px solid `rgba(0, 255, 247, 0.1)`
- **Columns:** 4 (desktop), stacked (mobile)
- **Logo:**
  - Font: Serif
  - Size: 24px
  - Color: `#F5F5F5`
  - Tagline: Sans-serif, 14px, `#C0C0C0`
- **Links:**
  - Font: Sans-serif, uppercase
  - Size: 14px
  - Color: `#C0C0C0` → `#00FFF7` on hover
  - Letter-spacing: 0.1em
- **Social Icons:**
  - Size: 24px
  - Color: `#C0C0C0` → `#00FFF7` on hover
  - Spacing: 16px
- **Newsletter:**
  - Input: Dark background, border `rgba(0, 255, 247, 0.2)`
  - Button: `#00FFF7` background
- **Copyright:**
  - Font: Sans-serif
  - Size: 12px
  - Color: `#C0C0C0`
  - Text-align: center
  - Margin-top: 40px

**Tailwind Classes:**
```jsx
<footer className="py-20 px-16 bg-[#0B0C10] border-t border-[rgba(0,255,247,0.1)]">
  <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
    {/* Logo */}
    <div>
      <div className="font-serif text-2xl text-[#F5F5F5] mb-4">BRAND</div>
      <p className="font-sans text-sm text-[#C0C0C0]">Luxury space experiences</p>
    </div>
    
    {/* Navigation */}
    <div>
      <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6">NAVIGATION</h3>
      <ul className="space-y-3">
        <li><a href="#" className="font-sans text-sm text-[#C0C0C0] hover:text-[#00FFF7] transition-colors">Collections</a></li>
        {/* ... more links */}
      </ul>
    </div>
    
    {/* Social */}
    <div>
      <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6">FOLLOW US</h3>
      <div className="flex gap-4">
        {/* Social icons */}
      </div>
    </div>
    
    {/* Newsletter */}
    <div>
      <h3 className="font-sans text-sm uppercase tracking-[0.1em] text-[#F5F5F5] mb-6">NEWSLETTER</h3>
      <form className="flex gap-2">
        <input type="email" className="flex-1 px-4 py-2 bg-[#1C1E26] border border-[rgba(0,255,247,0.2)] text-[#F5F5F5] rounded" />
        <button className="px-6 py-2 bg-[#00FFF7] text-[#0B0C10] font-bold uppercase">Subscribe</button>
      </form>
    </div>
  </div>
  
  <div className="text-center pt-8 border-t border-[rgba(0,255,247,0.1)]">
    <p className="font-sans text-xs text-[#C0C0C0]">© 2024 Brand. All rights reserved.</p>
  </div>
</footer>
```

---

## 🎨 **COMPLETE COLOR PALETTE**

```css
/* Base Colors */
--deep-space-black: #0B0C10;
--dark-charcoal: #1C1E26;
--cosmic-navy: #10122B;
--midnight-blue: #0F172A;

/* Accent Colors */
--cosmic-cyan: #00FFF7;
--stellar-purple: #A855F7;
--nebula-pink: #FF6FFF;
--galactic-gold: #FFD700;

/* Secondary Colors */
--silver-gray: #C0C0C0;
--ice-blue: #AEEFFF;
--smoke-white: #F5F5F5;

/* Gradients */
--hero-gradient: linear-gradient(180deg, #0B0C10 0%, #10122B 50%, rgba(0,255,247,0.1) 100%);
--button-gradient: linear-gradient(135deg, #A855F7 0%, #FF6FFF 100%);
--text-glow: linear-gradient(135deg, #FFD700 0%, #00FFF7 100%);
```

---

## 📝 **TYPOGRAPHY SYSTEM**

**Serif (Headings):**
- Playfair Display / Cormorant Garamond
- Weights: 400, 600, 700
- Letter-spacing: 0.05em - 0.15em

**Sans-serif (Body):**
- Inter / Exo 2
- Weights: 300, 400, 500
- Letter-spacing: 0.05em - 0.1em

---

## ✨ **ANIMATION SPECIFICATIONS**

**Fade-in:**
- Duration: 1s
- Easing: ease-out
- Delay: Staggered (0.1s increments)

**Hover Effects:**
- Duration: 0.3s - 0.6s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

**Scroll Animations:**
- Trigger: Intersection Observer
- Fade-in from bottom: 30px
- Duration: 0.8s

---

**Next:** See React component implementation files.

