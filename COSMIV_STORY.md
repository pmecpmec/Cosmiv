# 🌌 The Story of Cosmiv

_A Comprehensive Guide for AI Agents and Developers_

---

## 📖 Table of Contents

1. [What is Cosmiv?](#what-is-cosmiv)
2. [The Founders](#the-founders)
3. [Origin Story & Evolution](#origin-story--evolution)
4. [Mission & Vision](#mission--vision)
5. [Core Platform Features](#core-platform-features)
6. [Visual Identity & Branding](#visual-identity--branding)
7. [Technical Architecture](#technical-architecture)
8. [Subscription Model](#subscription-model)
9. [Design Philosophy & Style Guidelines](#design-philosophy--style-guidelines)
10. [Future Vision](#future-vision)

---

## What is Cosmiv?

**Cosmiv** is an AI-powered gaming montage platform that automatically transforms raw gameplay clips into professional, viral-ready highlight videos. Think of it as a video editor in the cloud that uses artificial intelligence to detect your best moments, edit them together with cinematic flair, and deliver a finished video ready to share on TikTok, YouTube, Instagram, or any social platform.

### The Simple Promise

> **"Upload raw clips → Get a finished, stylized highlight video."**

Cosmiv eliminates the hours of manual editing that creators spend cutting, timing transitions, and syncing music. Instead, users upload a ZIP file of their gameplay clips, select a style, and let AI handle the rest—automatically detecting highlights, applying professional transitions, matching music, and rendering in multiple formats (landscape for YouTube, portrait for TikTok).

### Why "Cosmiv"?

The name **Cosmiv** reflects our cosmic, futuristic identity. It's a fusion of "cosmic" and "video," representing our vision of elevating video creation to new heights—like launching into space. The platform embodies a space-age aesthetic, where advanced AI meets the infinite possibilities of gaming content creation.

---

## The Founders

### Pedro Cardoso (pmec)

- **Role:** Co-Founder & CTO
- **Email:** `pedro@cosmiv.com`
- **Technical Lead:** Responsible for backend architecture, AI integration, video processing pipeline, and technical development
- **GitHub:** pmec

### Daan Brinkmann (DeWindWaker)

- **Role:** Co-Founder
- **Email:** `daan@cosmiv.com`
- **Focus Areas:** API integrations, external service connections, design inspiration, marketing, and business development
- **Responsibilities:** OAuth setups, Stripe billing, social media integrations, design research

Together, Pedro and Daan form a complementary team—Pedro handles the technical complexity while Daan manages integrations, partnerships, and design direction. This collaboration drives Cosmiv's growth from both the engineering and business perspectives.

---

## Origin Story & Evolution

### The Beginning: "Aiditor" → "Cosmiv"

Cosmiv started as **"Aiditor"** (AI Editor), a straightforward name that described its function but lacked personality. As the platform evolved, Pedro and Daan realized they needed a brand identity that matched their futuristic vision.

### The Rebranding (2025)

The transformation to **"Cosmiv"** wasn't just a name change—it was a complete visual and conceptual overhaul:

1. **Visual Identity Transformation:**

   - Introduced a space-themed cosmic aesthetic
   - Developed animated cosmic background with starfield, nebulae, and glowing planets
   - Implemented cosmic gradient color palette (Violet → Deep Blue → Neon Cyan)
   - Created space-themed UI elements throughout the platform

2. **Branding Consistency:**

   - Updated all code references from "aiditor" to "cosmiv"
   - Renamed packages, databases, S3 buckets, and Celery app
   - Revamped subscription plan names to match theme:
     - **Cosmic Cadet** (Free tier)
     - **Nebula Knight** (Pro tier)
     - **Creator+** (Premium tier)

3. **User Experience Enhancement:**
   - Added animated cosmic background component
   - Implemented glowing effects and motion design
   - Created AI assistant represented as a glowing cosmic orb
   - Enhanced with Framer Motion animations

The rebranding solidified Cosmiv as a cutting-edge, space-age platform that doesn't just edit videos—it elevates them.

---

## Mission & Vision

### Mission Statement

**"To democratize professional video editing by making it as simple as uploading clips and pressing a button. We believe every gamer, streamer, and content creator deserves access to cinematic-quality editing powered by AI."**

### Vision Statement

**"To become the go-to platform for AI-powered video creation, where editing intelligence understands not just what to cut, but how to make it viral. Cosmiv envisions a future where creators describe their vision in natural language, and AI brings it to life with perfect pacing, music syncing, and cinematic effects."**

### Core Values

1. **Simplicity First:** No complex interfaces or learning curves—just upload and go
2. **AI Excellence:** Cutting-edge machine learning for intelligent highlight detection
3. **Cosmic Innovation:** Constantly pushing boundaries with futuristic technology
4. **Creator Empowerment:** Giving every creator the tools to produce professional content
5. **Quality Obsession:** Every output must meet professional editing standards

---

## Core Platform Features

### 🎞️ AI-Powered Editing Pipeline

**The Heart of Cosmiv: Automated Video Processing**

1. **Upload & Extraction**

   - Drag-and-drop ZIP file upload
   - Supports multiple formats (.mp4, .mov, etc.)
   - Automatic extraction and validation

2. **Video Preprocessing**

   - Transcoding to consistent format (H.264, 1080p, 30fps)
   - Normalization for optimal analysis

3. **AI Highlight Detection**

   - **Scene Analysis:** PySceneDetect for shot boundary detection
   - **Audio Peak Detection:** FFmpeg RMS energy analysis
   - **Motion Intensity Scoring:** OpenCV frame differencing
   - **ML Event Detection:** (Future) Custom model for kills, headshots, clutches
   - **Optional STT:** Whisper integration for speech/commentary analysis

4. **Smart Scene Selection**

   - Combines multiple scoring signals
   - Ranks scenes by highlight potential
   - Selects top moments up to target duration (30-120 seconds)

5. **Automatic Editing**

   - Intelligent scene concatenation
   - Professional transitions (crossfade, hard cuts, dissolves)
   - Style-matched color grading and LUTs
   - Music synchronization
   - Optional overlays (logos, subtitles)

6. **Multi-Format Rendering**

   - **Landscape:** 16:9 for YouTube
   - **Portrait:** 9:16 for TikTok/Instagram Reels
   - GPU-accelerated with NVENC fallback to CPU

7. **Post-Processing**
   - Content censorship (profanity detection, audio muting)
   - Watermarking for free tier
   - Quality optimization

### 🎨 Theme System

Cosmiv offers multiple editing styles, each with unique characteristics:

- **Cinematic:** Slow, dramatic cuts with movie-like quality
- **Esports Fast-Cut:** High-energy, fast-paced for gaming highlights
- **Chill Montage:** Relaxed, smooth transitions

Each theme affects:

- Cut pacing (average time between cuts)
- Transition styles
- Color grading (LUTs)
- Music style and tempo

### 🔗 Platform Integration

Cosmiv connects with gaming platforms to discover clips automatically:

- **Steam** (OpenID 2.0)
- **Xbox Live** (OAuth 2.0)
- **PlayStation Network** (OAuth 2.0)
- **Nintendo Switch** (OAuth 2.0)

Users link their accounts, and Cosmiv periodically syncs to discover new gameplay clips for automatic montage creation.

### 🔄 Weekly Montages

Community-compiled highlight reels that automatically gather the best clips from all users and create weekly compilation videos—perfect for showcasing the best of the community.

### 📊 Analytics Dashboard

Users can track:

- Total jobs processed
- Success/failure rates
- Activity trends over time
- Recent job history

### 🤖 AI Assistant

An intelligent chatbot represented as a glowing cosmic orb that helps users navigate the platform, answer questions, and provide creative suggestions.

---

## Visual Identity & Branding

### Space-Themed Aesthetic

Cosmiv's entire visual identity revolves around a **cosmic, futuristic, space-age theme**. Every element—from the background to buttons to text—should evoke the feeling of traveling through space, exploring galaxies, and harnessing cosmic energy.

**Space Inspired Aesthetic (2025):**

In 2025, Cosmiv refined its aesthetic to the **Space inspired, sleek, and futuristict / neon-cosmic aesthetic**—a refined variant that emphasizes:

- **Cosmic effects:** Subtle RGB channel separation, chromatic aberration
- **Scanline overlays:** Sleek horizontal lines for futuristic vibe
- **Enhanced neon glows:** More intense luminosity on interactive elements
- **Cosmic planet visuals:** Sleek animated planet in cosmic backgrounds
- **Futuristic elements:** Space-age meets sleek design aesthetics
- **Vibrant pink accents:** `#FF0080` and `#FF00FF` for error states and highlights

The Space inspired aesthetic maintains the cosmic foundation while adding sleek, futuristic edge and visual intensity, perfect for a cutting-edge gaming platform.

### Color Palette

**Primary Colors:**

- **Cosmic Violet:** `#8B5CF6` - Primary brand color, represents innovation
- **Deep Blue:** `#1E3A8A` - Depth and professionalism
- **Neon Cyan:** `#00FFFF` - Futuristic energy and highlights

**Secondary Colors:**

- **Purple Accent:** `#A855F7` - Secondary highlights
- **Pink Accent:** `#EC4899` - Vibrant accents
- **Space Background:** `#0A0A1A` - Deep space, almost black
- **Pure Black:** `#000000` - Primary background
- **Pure White:** `#FFFFFF` - Primary text

**Space Inspired Accent Colors:**

- **Vibrant Pink:** `#FF0080` - Cosmic effects, error states, dramatic accents
- **Hot Pink:** `#FF00FF` - Vibrant highlights, neon glows, intense moments
- **Enhanced Neon Cyan:** `#00FFFF` - More intense version for Space inspired variant

**Gradient Usage:**
Cosmiv heavily uses gradients transitioning from violet → deep blue → neon cyan for:

- Backgrounds
- Text highlights
- Button hovers
- Border accents

### Typography

**Primary Font:** Inter (system-ui fallback)

- Modern, clean, tech-forward
- Excellent readability
- Professional yet approachable

**Usage:**

- Headlines: Bold, large, often with gradient text effects
- Body: Regular weight, comfortable line height
- Code/Technical: Monospace where appropriate

### Cosmic Background

The platform features a **custom animated cosmic background** that includes:

1. **Starfield:** 300+ twinkling stars with randomized positions and opacity
2. **Nebulae:** Gradient ellipses representing cosmic clouds in violet/pink/cyan
3. **Glowing Planet:** Animated rotating planet with:
   - Gradient fill (violet → pink → cyan)
   - Network/grid pattern overlay
   - Atmospheric glow effect
   - Rotation animation

This background is rendered in real-time using HTML5 Canvas and provides a dynamic, immersive experience that never feels static.

### UI Elements

**Buttons:**

- Gradient backgrounds with cosmic colors
- Hover effects with glowing borders
- Smooth transitions (Framer Motion)
- Glassmorphism effects on some elements
- **Space Inspired:** Enhanced neon glow, scanline overlay on active states, chromatic aberration on hover

**Cards & Containers:**

- Semi-transparent backgrounds (`bg-white/5`, `bg-white/10`)
- Subtle borders (`border-white/20`)
- Glowing hover states
- Smooth shadows with cosmic color tints
- **Space Inspired:** Floating animation, cosmic border effects on hover, subtle RGB separation

**Space Inspired Visual Effects:**

- **Scanlines:** Sleek horizontal lines overlay (~5-10% opacity)
- **Cosmic Effects:** Subtle RGB channel separation on transitions
- **Chromatic Aberration:** Red/cyan color separation on animations
- **Cosmic Planet Element:** Animated planet with sleek effects in cosmic background
- **Enhanced Motion:** Parallax, floating animations, smooth interactions

**Icons & Symbols:**

- Cosmic-themed emojis: 🌌 (galaxy), ✨ (sparkles), 🚀 (rocket)
- Futuristic, minimal iconography
- Glowing effects on interactive elements

### Subscription Plan Names

All subscription tiers use space-themed names:

- **Cosmic Cadet:** Free tier (new to the cosmos)
- **Nebula Knight:** Pro tier ($9/month, exploring nebulae)
- **Creator+:** Premium tier ($19/month, full creator power)

These names reinforce the cosmic theme while being memorable and distinctive.

---

## Technical Architecture

### Frontend Stack

- **Framework:** React 18 with Vite
- **Styling:** TailwindCSS with custom cosmic color palette
- **Animations:** Framer Motion for smooth, professional transitions
- **State Management:** React Context API (AuthContext)
- **Build Tool:** Vite (fast, modern bundler)
- **Deployment:** GitHub Pages (static hosting)

### Backend Stack

- **Framework:** FastAPI (Python 3.12)
- **Async Processing:** Celery with Redis broker
- **Task Scheduler:** Celery Beat for periodic tasks
- **Database:** SQLModel with SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT (access/refresh tokens)
- **Storage:** S3-compatible (MinIO locally, AWS S3 production)

### Video Processing Pipeline

- **Media Tools:**

  - FFmpeg for transcoding, rendering, audio analysis
  - MoviePy for video manipulation
  - PySceneDetect for scene boundary detection
  - OpenCV for motion analysis and computer vision

- **AI/ML:**
  - Custom highlight detection models (interface ready)
  - Whisper (STT) for speech analysis (optional)
  - Heuristic scoring algorithms
  - Future: Integration with Runway, Pika, Sora for generative effects

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **Services:**
  - Backend API server
  - Celery workers (async job processing)
  - Celery beat (scheduled tasks)
  - Redis (task queue)
  - PostgreSQL (database)
  - MinIO/S3 (object storage)

### API Structure

RESTful API with v2 endpoints:

- `/api/v2/jobs` - Video job management
- `/api/v2/accounts` - OAuth linking, clip discovery
- `/api/v2/billing` - Subscription management (Stripe)
- `/api/v2/social` - Social media posting
- `/api/v2/styles` - Video style presets
- `/api/v2/weekly-montages` - Community compilations
- `/api/v2/ai/*` - AI service integrations

---

## Subscription Model

### Three-Tier System

#### 🌌 Cosmic Cadet (Free)

- **Price:** $0/month
- **Features:**
  - Basic highlight detection
  - Single format rendering (landscape or portrait)
  - Up to 60-second videos
  - Watermarked output
  - Limited monthly renders
  - Community access

#### ⚔️ Nebula Knight (Pro)

- **Price:** $9/month
- **Features:**
  - Advanced highlight detection
  - Multi-format rendering (landscape + portrait)
  - Up to 120-second videos
  - No watermarks
  - Higher monthly render limits
  - Priority processing
  - All themes unlocked

#### 🚀 Creator+ (Premium)

- **Price:** $19/month
- **Features:**
  - Everything in Pro
  - Unlimited video duration
  - Unlimited monthly renders
  - Custom style uploads
  - API access
  - Auto-posting for weekly montages
  - Priority support
  - Advanced analytics

### Billing Integration

- **Payment Processor:** Stripe
- **Subscription Management:** Automated via webhooks
- **Entitlement System:** Feature gating based on user tier
- **Freemium Model:** Free tier with limitations to drive upgrades

---

## Design Philosophy & Style Guidelines

### Design Principles

1. **Cosmic First:** Every design decision should reinforce the space theme
2. **Simplicity:** Clean, uncluttered interfaces—no unnecessary complexity
3. **Motion:** Smooth animations that feel natural and cosmic
4. **Glow Effects:** Strategic use of glowing borders, shadows, and highlights
5. **Gradients:** Use cosmic color gradients liberally for depth and energy
6. **Contrast:** High contrast for readability (white text on dark backgrounds)

### Visual Style Rules

**DO:**

- ✅ Use cosmic gradients (violet → deep blue → neon cyan)
- ✅ Add subtle glow effects on interactive elements
- ✅ Include cosmic symbols/emojis (🌌, ✨, 🚀)
- ✅ Use semi-transparent backgrounds for depth
- ✅ Implement smooth animations (Framer Motion)
- ✅ Maintain high contrast for text readability
- ✅ Use space-themed naming for features and tiers

**DON'T:**

- ❌ Use flat, non-gradient backgrounds (unless for contrast)
- ❌ Overcomplicate interfaces—keep it clean
- ❌ Use colors outside the cosmic palette (unless for specific contrast)
- ❌ Skip animations—motion is part of the brand
- ❌ Use generic names—everything should feel cosmic
- ❌ Ignore the space theme—consistency is key

### Component Style Guidelines

**Buttons:**

```css
/* Primary Button */
background: gradient(violet → cyan)
border: 2px solid neon-cyan (with glow)
hover: increase glow, slight scale
transition: 200ms ease
```

**Cards:**

```css
background: rgba(255, 255, 255, 0.05) /* semi-transparent */
border: 1px solid rgba(255, 255, 255, 0.2)
border-radius: 12px
hover: increased glow, subtle scale
```

**Text Headings:**

```css
/* Large Headings */
background: linear-gradient(to right, violet, cyan)
background-clip: text
-webkit-text-fill-color: transparent
font-weight: bold
font-size: 3xl
```

**Cosmic Background:**

- Always rendered via canvas
- Should include stars, nebulae, and glowing planet
- Subtle enough not to interfere with content
- Smooth animations without performance issues

### Writing Style

**Tone:**

- Futuristic but approachable
- Exciting but professional
- Technical but understandable
- Cosmic metaphors are welcome

**Voice Examples:**

- ✅ "Launch your clips into the cosmos"
- ✅ "Discover your highlights across the stars"
- ✅ "Cosmic editing at your fingertips"
- ❌ "Upload files to our server"
- ❌ "Video processing complete"

**Naming Conventions:**

- Features: Space-themed names preferred (e.g., "Nebula Knight" not "Pro Plan")
- Buttons: Action-oriented ("Launch", "Discover", "Render")
- Errors: Friendly and helpful (maintain cosmic theme if possible)

---

## Future Vision

### Short-Term Goals (Next 6 Months)

1. **Complete OAuth Integrations:** Full Steam, Xbox, PSN, Nintendo support
2. **Real Stripe Billing:** Replace mock implementation with live payments
3. **Enhanced AI Models:** Deploy real highlight detection ML model
4. **Social Posting:** Direct integration with TikTok, YouTube, Instagram APIs
5. **Weekly Montage Automation:** Automated community compilation generation

### Medium-Term Goals (6-12 Months)

1. **Natural Language Editing:** "Make me a 1-minute cinematic highlight of my best Valorant plays, dark blue theme, high-energy music"
2. **Generative Video Effects:** Integration with Runway, Pika, Sora for AI-powered enhancements
3. **Real-Time Collaboration:** Multiple users editing the same montage
4. **Mobile App:** Native iOS/Android apps for on-the-go editing
5. **Marketplace:** Community-shared style presets and templates

### Long-Term Vision (1-3 Years)

1. **AI Content Director:** LLM-powered editing decisions based on creator style preferences
2. **Multi-Platform Sync:** Automatic clip discovery and montage creation across all gaming platforms
3. **Creator Economy:** Monetization tools for creators, revenue sharing
4. **Enterprise Features:** White-label solutions for gaming organizations
5. **Global Expansion:** Multi-language support, regional servers

### Ultimate Goal

**"Make video editing as simple as describing the vibe. Cosmiv becomes the invisible editor that understands not just what to cut, but how to make it go viral—with perfect pacing, music syncing, and cinematic effects that match each creator's unique style."**

---

## Technical Context for Developers

### Key Files & Directories

**Frontend:**

- `src/components/CosmicBackground.jsx` - Animated cosmic background component
- `src/components/AIChatbot.jsx` - AI assistant (cosmic orb representation)
- `tailwind.config.js` - Cosmic color palette definitions
- `src/index.css` - Global styles with cosmic theme

**Backend:**

- `backend/src/main.py` - FastAPI application entry point
- `backend/src/pipeline/` - Video processing pipeline modules
- `backend/src/services/` - Business logic services (OAuth, social posting, AI)
- `backend/src/models.py` - Database models (User, Job, Entitlement, etc.)
- `backend/src/config.py` - Environment configuration and feature flags

**Documentation:**

- `PROJECT_STATUS_FOR_CHATGPT.md` - Current project status and technical details
- `EMAIL_SETUP_DAAN.md` - Business email system documentation
- `TODO_DAAN.md` - Tasks for non-technical co-founder
- `TODO_PEDRO.md` - Technical development tasks

### Important Environment Variables

```bash
# Security
JWT_SECRET_KEY=<strong-random-key>

# Feature Flags
USE_POSTGRES=false/true
USE_OBJECT_STORAGE=false/true
USE_HIGHLIGHT_MODEL=false/true

# OAuth (mock mode by default)
STEAM_API_KEY=...
XBOX_CLIENT_ID=...
PLAYSTATION_CLIENT_ID=...
NINTENDO_CLIENT_ID=...

# Billing
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Storage
S3_ENDPOINT_URL=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=cosmiv
```

### Development Workflow

1. **Backend:** Docker Compose (`backend/docker-compose.yml`)
2. **Frontend:** Vite dev server (`npm run dev`)
3. **Testing:** Pytest for backend, Jest for frontend (structure ready)
4. **Deployment:** CI/CD via GitHub Actions

---

## Communication & Brand Voice

### How to Talk About Cosmiv

**Elevator Pitch:**

> "Cosmiv is an AI-powered platform that automatically turns your raw gameplay clips into professional highlight videos. Upload your clips, select a style, and get a finished video ready to share—no editing skills required."

**Technical Description:**

> "Cosmiv uses computer vision and machine learning to detect highlights in gameplay footage, automatically edits them with professional transitions and music, and renders in multiple formats. Built with FastAPI, React, and modern AI/ML tools."

**Brand Voice:**

> Futuristic, exciting, professional, cosmic, innovative, empowering

### Email & Communication Style

- **Friendly but professional:** Cosmic metaphors are welcome
- **Action-oriented:** "Launch," "Discover," "Transform"
- **Inclusive:** Every creator is part of the cosmic journey
- **Technical when needed:** Don't oversimplify for technical audiences

### Logo & Branding Elements

- **Logo:** Should incorporate cosmic theme (stars, nebulae, or cosmic orb)
- **Favicon:** Cosmic symbol (🌌 or custom icon)
- **Color Scheme:** Always use cosmic gradient (violet → deep blue → cyan)
- **Imagery:** Space, galaxies, nebulae, futuristic gaming aesthetics

---

## Key Relationships & Partnerships

### Gaming Platforms

Cosmiv integrates with major gaming platforms to discover clips:

- Steam, Xbox Live, PlayStation Network, Nintendo Switch

### Payment Processing

- Stripe for subscription billing

### Future Integrations

- Social Media APIs (TikTok, YouTube, Instagram)
- AI Video Tools (Runway, Pika, Sora)
- Music Services (MusicGen, Suno, Mubert)

---

## Success Metrics

### User Metrics

- Monthly Active Users (MAU)
- Video renders per month
- Subscription conversion rate
- User retention

### Technical Metrics

- Average render time
- Success rate (completed vs. failed jobs)
- API response times
- System uptime

### Business Metrics

- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate

---

## Important Notes for AI Agents

### When Working on Cosmiv

1. **Always Maintain Cosmic Theme:** Every change should reinforce the space aesthetic
2. **Check Branding Consistency:** Ensure names, colors, and styles match the cosmic palette
3. **Respect the Vision:** Keep simplicity and AI excellence as core principles
4. **Coordinate with Founders:** Pedro (technical), Daan (integrations/design)
5. **Document Everything:** Update relevant documentation when making changes

### Common Tasks

- **Adding Features:** Ensure they fit the cosmic theme and maintain simplicity
- **UI Updates:** Use cosmic color palette, add animations, maintain consistency
- **API Integrations:** Follow existing patterns, use mock mode for testing
- **Design Changes:** Always reference the cosmic aesthetic and space theme

### Red Flags to Watch For

- ⚠️ Breaking the cosmic theme (using non-space colors, generic names)
- ⚠️ Adding unnecessary complexity
- ⚠️ Ignoring the brand voice (too corporate or too casual)
- ⚠️ Creating inconsistencies in naming or styling

---

## Conclusion

Cosmiv is more than a video editing tool—it's a mission to democratize professional content creation through AI. With its cosmic identity, cutting-edge technology, and founder-driven vision, Cosmiv represents the future of automated video editing for gamers and creators worldwide.

Every line of code, every design decision, and every feature should reinforce this cosmic vision: making professional video editing as simple and accessible as pressing a button, while maintaining the excitement and innovation of exploring the infinite possibilities of space.

**Welcome to Cosmiv. Welcome to the future of video creation. 🌌**

---

_Last Updated: 2025-01-27_  
_For technical details, see `PROJECT_STATUS_FOR_CHATGPT.md`_  
_For email setup, see `EMAIL_SETUP_DAAN.md`_  
_For development tasks, see `TODO_PEDRO.md` and `TODO_DAAN.md`_
