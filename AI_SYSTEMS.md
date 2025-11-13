# 🤖 Cosmiv AI Systems - Complete Overview

This document describes all AI-powered features implemented in Cosmiv.

---

## 🎯 Overview

Cosmiv now features **6 professional AI systems** that work together to create an intelligent, self-improving platform:

1. **AI Chatbot** - Customer support and Q&A
2. **AI Content Renewal** - Automatic website content updates
3. **AI Code Generator** - Code generation for React/TypeScript and Python/FastAPI
4. **AI UX/UI Designer** - Automated UI improvements
5. **AI Video Editor** - Enhanced video editing suggestions
6. **AI DJ** - Copyright-free music generation prompts

---

## 🏗️ Architecture

### Unified AI Service (`backend/src/services/ai_service.py`)

Central AI service supporting multiple providers:

- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude Opus, Claude Sonnet)
- **Local/Mock** (for development)

### Configuration

Set these environment variables:

```bash
# AI Provider (openai, anthropic, local)
AI_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic (alternative)
ANTHROPIC_API_KEY=sk-ant-...

# Model Selection
AI_DEFAULT_MODEL=gpt-4-turbo-preview  # or claude-3-opus-20240229

# Enable/Disable
AI_ENABLED=true
```

---

## 🤖 1. AI Chatbot

**Purpose:** Professional customer support and Q&A

**Features:**

- Natural conversation interface
- Context-aware responses
- Conversation history
- Knowledgeable about platform features

**API Endpoint:** `POST /v2/ai/chat`

**Frontend:** `src/components/AIChatbot.jsx`

**Usage:**

- Accessible via "AI Chat" tab
- Answers questions about:
  - How to use the platform
  - Video editing features
  - Uploading clips
  - Subscription plans
  - Technical support
  - Platform integrations

---

## 📝 2. AI Content Renewal

**Purpose:** Automatically refresh and modernize website content

**Features:**

- Renews landing page copy
- Updates feature descriptions
- Maintains brand voice
- Keeps content fresh and engaging

**API Endpoints:**

- `POST /v2/ai/content/generate` - Generate new content
- `POST /v2/ai/content/renew` - Renew existing content
- `GET /v2/ai/content/versions/{content_id}` - Get content versions
- `GET /v2/ai/content/latest/{content_id}` - Get latest published version
- `POST /v2/ai/content/publish` - Publish a content version
- `POST /v2/ai/content/schedule-renewals` - Manually trigger renewals

**Usage:**

```javascript
// Generate new content
const response = await fetch("/v2/ai/content/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content_type: "landing_page",
    style: "professional",
    context: {
      /* optional context */
    },
  }),
});

// Renew existing content
const response = await fetch("/v2/ai/content/renew", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content_id: "content_123",
    content_type: "landing_page",
    force: false,
  }),
});
```

---

## 💻 3. AI Code Generator

**Purpose:** Generate React/TypeScript components and Python/FastAPI code automatically

**Features:**

- Natural language to code
- React + TailwindCSS generation
- FastAPI endpoint generation
- Database model creation
- Service layer code
- Follows best practices
- Includes error handling

**API Endpoints:**

- `POST /v2/ai/code/generate-frontend` - Generate React/TypeScript components
- `POST /v2/ai/code/generate-backend` - Generate Python/FastAPI endpoints
- `POST /v2/ai/code/optimize` - Optimize existing code
- `GET /v2/ai/code/generation/{generation_id}` - Get generation record
- `GET /v2/ai/code/generations` - List all generations
- `PATCH /v2/ai/code/generation` - Update generation status

**Usage:**

```javascript
// Generate frontend component
const response = await fetch("/v2/ai/code/generate-frontend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    description: "Create a modal component for video preview",
    framework: "react",
    style_system: "tailwind",
    context: {
      /* optional context */
    },
  }),
});

// Generate backend endpoint
const response = await fetch("/v2/ai/code/generate-backend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    description: "Create a FastAPI endpoint to fetch user montages",
    framework: "fastapi",
    context: {
      /* optional context */
    },
  }),
});
```

---

## 🎨 4. AI UX/UI Designer

**Purpose:** Provide professional UI/UX improvement suggestions

**Features:**

- Analyzes current UI
- Suggests modern improvements
- Provides code examples
- Explains UX rationale

**API Endpoints:**

- `POST /v2/ai/ux/analyze-component` - Analyze component for UX/UI improvements
- `POST /v2/ai/ux/analyze-behavior` - Analyze user behavior patterns
- `POST /v2/ai/ux/generate-improvements` - Generate improvement suggestions
- `POST /v2/ai/ux/analyze-accessibility` - Analyze accessibility issues
- `POST /v2/ai/ux/suggest-ab-tests` - Suggest A/B tests
- `GET /v2/ai/ux/analysis/{analysis_id}` - Get analysis record
- `GET /v2/ai/ux/analyses` - List all analyses

**Usage:**

```javascript
// Analyze component
const response = await fetch("/v2/ai/ux/analyze-component", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    component_path: "src/components/Dashboard.jsx",
    page_url: "/dashboard",
    analysis_type: "general",
  }),
});

// Generate improvements
const response = await fetch("/v2/ai/ux/generate-improvements", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    component_path: "src/components/Dashboard.jsx",
    issues: ["Poor accessibility", "Outdated design"],
    context: {
      /* optional context */
    },
  }),
});
```

---

## 🎬 5. AI Video Editor

**Purpose:** Enhanced video editing suggestions and guidance

**Features:**

- Cut point recommendations
- Transition suggestions
- Effect recommendations
- Music sync points
- Pacing analysis

**API Endpoints:**

- `POST /v2/ai/video/enhance` - Enhance video with AI
- `POST /v2/ai/video/generate-captions` - Generate AI-powered captions
- `POST /v2/ai/video/suggest-edits` - Get editing suggestions
- `POST /v2/ai/video/generate-thumbnail` - Generate thumbnail design suggestions
- `GET /v2/ai/video/enhancement/{enhancement_id}` - Get enhancement record
- `GET /v2/ai/video/enhancements` - List video enhancements

**Usage:**

```javascript
// Get editing suggestions
const response = await fetch("/v2/ai/video/suggest-edits", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    video_description: "Fast-paced Valorant highlights",
    target_duration: 60,
    style: "cinematic",
  }),
});

// Enhance video
const response = await fetch("/v2/ai/video/enhance", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    job_id: "job_123",
    enhancement_type: "transitions", // captions, transitions, color_grade, effects, motion_graphics
    input_video_path: "/path/to/video.mp4",
    params: {
      /* optional parameters */
    },
  }),
});
```

**Integration:**

- Works with existing video pipeline
- Enhances scene detection
- Improves highlight selection

---

## 🎵 6. AI DJ

**Purpose:** Generate detailed prompts for copyright-free music

**Features:**

- Mood-based music generation
- Genre selection
- Beat structure for sync
- Gaming montage optimized

**API Endpoint:** `POST /v2/ai/music/prompt`

**Usage:**

```javascript
const response = await fetch("/v2/ai/music/prompt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    video_description: "Epic gaming montage",
    mood: "energetic",
    genre: "electronic",
  }),
});
```

**Integration:**

- Works with MusicGen service
- Enhances Suno/Mubert prompts
- Improves procedural music generation

---

## 🔄 Automated Systems

### Content Renewal Automation

**Celery Beat Task:** Runs weekly to refresh website content

**Location:** `backend/src/tasks.py` (to be implemented)

### UI Improvement Monitoring

**Future:** AI monitors user engagement and suggests UI improvements

---

## 📊 AI Status Endpoint

Check AI service status:

**Endpoint:** `GET /v2/ai/status`

**Response:**

```json
{
  "provider": "openai",
  "available": true,
  "model": "gpt-4-turbo-preview"
}
```

---

## 🔒 Security & Authentication

- **Chatbot:** Public access (optional auth for conversation history)
- **Code Generation:** Requires authentication (admin recommended)
- **Content Renewal:** Requires authentication (admin only)
- **UI Improvements:** Requires authentication
- **Video Editor:** Public access
- **Music Prompt:** Public access

---

## 🚀 Future Enhancements

1. **Conversation Memory** - Store chat history in database
2. **Code Execution** - Safe sandbox for generated code
3. **A/B Testing** - Test AI-generated UI improvements
4. **Analytics Integration** - Use analytics data for better AI suggestions
5. **Multi-modal AI** - Image and video understanding
6. **Voice Chat** - Voice interface for chatbot

---

## 📝 Implementation Status

- ✅ AI Service Infrastructure
- ✅ AI Chatbot Component
- ✅ AI API Endpoints
- ✅ Frontend Integration
- ⏳ Content Renewal Automation (Celery task)
- ⏳ Code Generator UI Components
- ⏳ UI Improvement Dashboard
- ⏳ Video Editor Integration
- ⏳ Music Prompt Integration

---

**Status:** 🟢 Core AI systems operational  
**Next:** Integrate AI features into existing workflows
