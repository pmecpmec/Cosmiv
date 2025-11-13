# 🧠 Cosmiv Front-End Learner Agent

**Agent Name:** `agent_cosmiv_frontend_learner`

**Purpose:** Build a self-learning front-end intelligence module for Cosmiv that scrapes websites, extracts UI/UX design patterns, and stores them as structured knowledge for AI front-end generation.

---

## 🎯 Goal

Transform Cosmiv into an **AI that learns web design from the real world** by automatically scraping, analyzing, and learning modern front-end patterns from websites.

---

## 📋 Objectives

1. **Scrape** selected websites (Dribbble, Awwwards, Behance, modern SaaS pages) to gather HTML, CSS, and layout metadata
2. **Parse & Analyze** scraped content to detect reusable patterns:
   - Layout types (grid, flex, absolute, responsive)
   - Animations and motion usage
   - Color palettes and gradients
   - Typography styles (fonts, hierarchy)
   - UI components (hero, navbars, cards, pricing tables, forms)
3. **Store** extracted data in a structured Knowledge Graph / Vector DB for later use by AI design agents
4. **Enable** the Cosmiv front-end agent to learn from this data to generate modern, visually balanced, trend-aware UI layouts

---

## 🏗️ Architecture

### Core Components

1. **Web Scraper** (`services/frontend_learner/scraper.py`)
   - Uses Playwright for dynamic sites, BeautifulSoup for static
   - Targets URLs from `frontend_learning_targets.json`
   - Saves HTML + CSS to `/knowledge/html_snapshots/`

2. **Pattern Parser** (`services/frontend_learner/parser.py`)
   - Extracts structural elements (header, section, main, footer)
   - Detects CSS properties (flex, grid, gradients)
   - Identifies color palettes (hex/rgb/hsl)
   - Extracts typography and component patterns

3. **Vectorization Service** (`services/frontend_learner/vectorizer.py`)
   - Uses sentence-transformers for embeddings
   - Stores in ChromaDB collection `frontend_patterns`
   - Enables semantic search for similar patterns

4. **Learning Layer** (`services/frontend_learner/learner.py`)
   - Detects trends over time
   - Generates design principles JSON
   - Tracks popularity scores

5. **API Endpoints** (`api_frontend_learning.py`)
   - `/api/v2/frontend-learning/patterns` - Query learned patterns
   - `/api/v2/frontend-learning/trends` - Get trend analytics
   - `/api/v2/frontend-learning/learn` - Trigger manual learning

6. **Celery Task** (`tasks.py`)
   - Automated daily learning job
   - Runs scraping and analysis pipeline

---

## 🔧 Implementation Steps

### Step 1: Configuration

Create `frontend_learning_targets.json`:

```json
{
  "targets": [
    {
      "url": "https://dribbble.com",
      "type": "design_portfolio",
      "priority": "high",
      "selectors": {
        "main_content": ".shot",
        "colors": true,
        "typography": true
      }
    },
    {
      "url": "https://www.awwwards.com",
      "type": "award_showcase",
      "priority": "high"
    },
    {
      "url": "https://www.behance.net",
      "type": "design_portfolio",
      "priority": "high"
    }
  ],
  "scraping_config": {
    "max_pages_per_site": 10,
    "respect_robots_txt": true,
    "delay_between_requests": 2.0,
    "user_agent": "Cosmiv-FrontendLearner/1.0"
  }
}
```

### Step 2: Database Models

Add to `models_ai.py`:

- `FrontendPattern` - Stores extracted patterns
- `DesignTrend` - Tracks trend analytics
- `ScrapingJob` - Tracks scraping operations

### Step 3: Scraper Implementation

**File:** `backend/src/services/frontend_learner/scraper.py`

Features:
- Playwright for JavaScript-heavy sites
- BeautifulSoup for static HTML
- Respects robots.txt
- Rate limiting
- Error handling and retries

### Step 4: Parser Implementation

**File:** `backend/src/services/frontend_learner/parser.py`

Extracts:
- Layout patterns (flex, grid, absolute positioning)
- Color palettes (hex, rgb, hsl values)
- Typography (font families, sizes, weights)
- Components (hero sections, navbars, cards, etc.)
- Animations (CSS animations, transitions)
- Gradients and effects

Output format:
```json
{
  "url": "https://example.com",
  "layout": "flex-grid",
  "colors": ["#0f0f1a", "#ff0080", "#00ffff"],
  "fonts": ["Inter", "Poppins"],
  "components": ["hero", "pricing-table", "testimonial-section"],
  "animations": ["fade-in", "slide-up"],
  "gradients": ["linear-gradient(135deg, #667eea 0%, #764ba2 100%)"]
}
```

### Step 5: Vectorization

**File:** `backend/src/services/frontend_learner/vectorizer.py`

- Uses `sentence-transformers/all-MiniLM-L6-v2`
- Creates embeddings for each pattern
- Stores in ChromaDB collection `frontend_patterns`
- Enables semantic search: "Find patterns similar to glassmorphism hero section"

### Step 6: Learning Layer

**File:** `backend/src/services/frontend_learner/learner.py`

Detects trends:
- Popular color combinations
- Common font pairings
- Typical spacing/margin patterns
- Animation frameworks (Framer Motion, GSAP)
- Component usage frequency

Generates `design_principles.json`:
```json
{
  "trends": [
    {
      "name": "Glassmorphism",
      "colors": ["#ffffff33", "#0f0f1a"],
      "effects": ["blur", "glow", "neon"],
      "popularity_score": 0.89,
      "detected_at": "2025-01-28T10:00:00Z"
    }
  ],
  "updated_at": "2025-01-28T10:00:00Z"
}
```

### Step 7: API Endpoints

**File:** `backend/src/api_frontend_learning.py`

Endpoints:
- `GET /api/v2/frontend-learning/patterns` - Query patterns
- `GET /api/v2/frontend-learning/patterns/{pattern_id}` - Get specific pattern
- `GET /api/v2/frontend-learning/trends` - Get trend analytics
- `POST /api/v2/frontend-learning/learn` - Trigger manual learning
- `GET /api/v2/frontend-learning/search` - Semantic search patterns

### Step 8: Celery Task

**File:** `backend/src/tasks.py` (add new task)

```python
@celery_app.task(name="learn_frontend_patterns")
def learn_frontend_patterns():
    """Automated daily learning task"""
    # Run scraper → parser → vectorizer → learner
    pass
```

Schedule in Celery Beat:
- Runs daily at 2 AM UTC
- Scrapes all targets
- Updates knowledge base

---

## 🎨 Cosmiv Brand Integration

All learned styles must align with **Cosmiv's core identity**:

- **Theme:** Space-inspired, sleek, neon gradients
- **Palette:** Deep Blue → Violet → Neon Cyan
- **Motion:** Smooth parallax, subtle glow, cosmic particles
- **Typography:** Modern sans-serif with futuristic detailing

The learner should:
- Prioritize patterns matching Cosmiv aesthetic
- Filter out patterns that don't align
- Generate Cosmiv-specific design principles

---

## 📊 Expected Outputs

### Files Created:

1. `frontend_learning_targets.json` - Curated scraping list
2. `/knowledge/html_snapshots/` - Raw scraped HTML/CSS
3. `/knowledge/parsed_patterns.json` - Structured UI pattern data
4. `/knowledge/embeddings/` - Vector database or embedding cache
5. `/knowledge/design_principles.json` - Trend analytics

### API Endpoints:

- `/api/v2/frontend-learning/patterns` - REST endpoint for pattern access
- `/api/v2/frontend-learning/trends` - Trend analytics
- `/api/v2/frontend-learning/search` - Semantic search

### Database Tables:

- `frontend_patterns` - Extracted patterns
- `design_trends` - Trend analytics
- `scraping_jobs` - Job tracking

---

## 🚀 Usage

### Manual Execution:

```bash
# Run scraper
python -m services.frontend_learner.scraper --targets frontend_learning_targets.json

# Run parser
python -m services.frontend_learner.parser --snapshot-dir /knowledge/html_snapshots

# Run learner
python -m services.frontend_learner.learner --update-principles
```

### Via API:

```bash
# Trigger learning
curl -X POST http://localhost:8000/api/v2/frontend-learning/learn

# Query patterns
curl http://localhost:8000/api/v2/frontend-learning/patterns?style=glassmorphism

# Search semantically
curl http://localhost:8000/api/v2/frontend-learning/search?query=neon+gradient+hero
```

### Via Celery:

```bash
# Task runs automatically daily
# Or trigger manually:
celery -A tasks.celery_app call learn_frontend_patterns
```

---

## 🎯 Optional Enhancements

1. **Visual Dashboard** (`/frontend-learning-dashboard`)
   - Trend analytics visualization
   - Top color palettes
   - Component usage charts
   - Pattern gallery

2. **Quality Ranking**
   - Use OpenAI Vision or CLIP models
   - Rank patterns by aesthetic quality
   - Filter low-quality patterns

3. **Pattern Validation**
   - Test patterns against Cosmiv brand guidelines
   - Auto-reject non-matching patterns
   - Generate brand-aligned variations

4. **Real-time Learning**
   - Webhook integration for new design sites
   - Continuous learning mode
   - Pattern versioning

---

## 🔒 Security & Ethics

- **Respect robots.txt** - Always check before scraping
- **Rate Limiting** - Don't overwhelm target sites
- **User Agent** - Identify as Cosmiv bot
- **Data Privacy** - Only store public design patterns
- **Attribution** - Track source URLs for patterns

---

## 📝 Integration with Existing Systems

### AI UX/UI Designer Integration:

The existing `api_ai_ux.py` can query learned patterns:

```python
from services.frontend_learner.vectorizer import search_patterns

# When generating UI improvements, use learned patterns
patterns = search_patterns("hero section with gradient", limit=5)
# Use patterns to inform AI suggestions
```

### AI Code Generator Integration:

The existing `api_ai_code.py` can use learned patterns:

```python
# When generating frontend code, reference learned patterns
pattern = get_pattern_by_id(pattern_id)
# Generate code based on learned structure
```

---

## ✅ Success Criteria

- [ ] Scraper successfully extracts HTML/CSS from target sites
- [ ] Parser correctly identifies design patterns
- [ ] Vectorization enables semantic search
- [ ] Learning layer detects trends
- [ ] API endpoints return useful pattern data
- [ ] Celery task runs automatically
- [ ] Patterns align with Cosmiv brand identity
- [ ] AI agents can query and use learned patterns

---

## 🎬 Execution Order

1. Create configuration files (`frontend_learning_targets.json`)
2. Add database models (`models_ai.py`)
3. Implement scraper service
4. Implement parser service
5. Implement vectorizer service
6. Implement learner service
7. Create API endpoints
8. Add Celery task
9. Test end-to-end pipeline
10. Integrate with existing AI systems

---

**Agent:** `agent_cosmiv_frontend_learner`  
**Created:** 2025-01-28  
**Status:** Ready for implementation  
**Dependencies:** Playwright, BeautifulSoup, ChromaDB, sentence-transformers

