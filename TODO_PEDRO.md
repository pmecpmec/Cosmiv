# TODO_PEDRO.md

_Last updated: 2025-01-27 by agent_project_sync_

## 👋 Hey Pedro (pmec)!

This is your **technical development checklist**. These are tasks that require coding, infrastructure work, or technical decision-making.

**Note:** Daan (DeWindWaker) is handling API credentials, OAuth setup, and design research. Check `TODO_DAAN.md` to see what he's working on.

---

## ✅ Current Snapshot

| Area                   | Status         | Notes                                      |
| ---------------------- | -------------- | ------------------------------------------ |
| Test Suite             | ❌ Missing     | No test files found - critical for CI/CD   |
| Production Deployment  | ⚙️ Placeholder | CI/CD has deployment stub                  |
| Environment Variables  | ⚙️ Partial     | Need production `.env` template            |
| ML Models              | ⚙️ Stub        | Highlight detection model interface exists |
| CI/CD Pipeline         | ⚙️ Configured  | Needs test files to be useful              |
| Error Monitoring       | ❌ Missing     | No Sentry or error tracking                |
| Performance Monitoring | ❌ Missing     | No APM setup                               |

---

## 🚀 Tasks To Do

### 🧪 Testing Infrastructure (Priority: High)

**Goal:** Add comprehensive test coverage for critical paths

**Steps:**

1. **Create Test Structure:**

   ```bash
   backend/src/tests/
   ├── __init__.py
   ├── test_api_auth.py
   ├── test_api_accounts.py
   ├── test_api_billing.py
   ├── test_pipeline.py
   ├── test_highlight_detection.py
   └── conftest.py  # pytest fixtures
   ```

2. **Write Core Tests:**

   - **Authentication tests** (`test_api_auth.py`):

     - Test JWT token generation/validation
     - Test login/logout flows
     - Test token refresh

   - **Accounts API tests** (`test_api_accounts.py`):

     - Test OAuth linking (mock mode)
     - Test provider listing
     - Test clip discovery

   - **Billing API tests** (`test_api_billing.py`):

     - Test Stripe webhook signature verification
     - Test subscription creation/cancellation
     - Test plan listing

   - **Pipeline tests** (`test_pipeline.py`):

     - Test video preprocessing
     - Test highlight detection scoring
     - Test scene selection logic
     - Mock FFmpeg calls for unit tests

   - **Integration tests**:
     - Full job processing flow (with mocks)
     - OAuth callback handling
     - Webhook processing

3. **Test Configuration:**

   - Add `pytest.ini` or `pyproject.toml` with pytest config
   - Set up test database (SQLite for speed)
   - Mock external services (Stripe, OAuth providers, S3)
   - Configure coverage reporting

4. **CI/CD Integration:**
   - Verify `.github/workflows/ci.yml` runs tests correctly
   - Ensure coverage reports are uploaded
   - Add test badges to README

**Files to Create/Modify:**

- `backend/src/tests/` directory
- `backend/src/tests/conftest.py` - Shared fixtures
- `backend/src/tests/test_*.py` - Individual test files
- `.coveragerc` or `pyproject.toml` - Coverage config

**Help:**

- Use ChatGPT: "How to write pytest tests for FastAPI with SQLModel?"
- Use ChatGPT: "How to mock FFmpeg and external APIs in Python tests?"

---

### 🚀 Production Deployment (Priority: High)

**Goal:** Complete production deployment automation

**Current Status:**

- `.github/workflows/ci.yml` line 180-184 has placeholder deployment
- Docker images are being built but not deployed

**Steps:**

1. **Choose Deployment Platform:**

   - Options: Railway, Render, Fly.io, AWS, DigitalOcean
   - Consider: Cost, scaling, database persistence, storage

2. **Create Deployment Scripts:**

   - Update `.github/workflows/ci.yml` deploy-backend job:
     ```yaml
     - name: Deploy to production
       run: |
         # Add actual deployment commands
         # e.g., SSH to server, pull image, restart services
         # or use platform CLI (railway up, render deploy, etc.)
     ```

3. **Environment Variables:**

   - Create `env.production.example` with all required variables
   - Set up secrets management (GitHub Secrets, platform env vars)
   - Document which secrets go where

4. **Database Setup:**

   - Production PostgreSQL setup with migrations
   - Backup strategy
   - Connection pooling

5. **Storage Setup:**

   - Production S3 bucket (AWS, DigitalOcean Spaces, etc.)
   - CORS configuration
   - CDN setup (optional but recommended)

6. **SSL/HTTPS:**
   - Required for OAuth callbacks
   - Set up domain with SSL certificate
   - Update callback URLs in all OAuth providers

**Files to Create/Modify:**

- `.github/workflows/ci.yml` - Update deploy-backend job
- `DEPLOYMENT.md` - Deployment guide (already exists, update it)
- `env.production.example` - Already exists, verify completeness

**Help:**

- Use ChatGPT: "How to deploy FastAPI app to Railway/Render?"
- Use ChatGPT: "Docker production deployment best practices"

---

### 🔒 Security Hardening (Priority: High)

**Goal:** Secure production environment

**Steps:**

1. **JWT Secret Key:**

   - ⚠️ **CRITICAL:** Change `JWT_SECRET_KEY` from dev default
   - Generate strong secret: `openssl rand -hex 32`
   - Set in production environment
   - Never commit to git
   - File: `backend/src/config.py` line 36

2. **OAuth Credentials:**

   - Ensure all OAuth secrets are in environment variables
   - Never hardcode in source code
   - Use secret management service if available

3. **Database Credentials:**

   - Strong passwords for PostgreSQL
   - Use connection strings from environment
   - Enable SSL for database connections

4. **API Rate Limiting:**

   - Add rate limiting middleware to FastAPI
   - Protect against abuse
   - Consider: `slowapi` or `fastapi-limiter`

5. **Input Validation:**

   - Review all API endpoints for input validation
   - Add file upload size limits
   - Validate file types

6. **CORS Configuration:**
   - Set proper CORS origins (production domain only)
   - Remove `*` wildcard in production
   - File: Check `main.py` for CORS middleware

**Files to Modify:**

- `backend/src/config.py` - Verify no hardcoded secrets
- `backend/src/main.py` - CORS configuration
- `backend/src/auth.py` - JWT secret validation

**Help:**

- Use ChatGPT: "FastAPI security best practices"
- Use ChatGPT: "How to implement rate limiting in FastAPI?"

---

### 🎬 Video Processing Enhancements (Priority: Medium)

**Goal:** Improve video processing reliability and performance

**Steps:**

1. **Error Handling:**

   - Add retry logic for FFmpeg operations
   - Better error messages for failed renders
   - Handle corrupted video files gracefully
   - File: `backend/src/pipeline/editing.py`

2. **Progress Tracking:**

   - Enhanced progress updates during rendering
   - WebSocket support for real-time updates (optional)
   - Better progress granularity
   - Files: `backend/src/tasks.py`, `backend/src/tasks_enhanced.py`

3. **Video Format Support:**

   - Test various input formats (.mp4, .mov, .mkv, etc.)
   - Handle different codecs
   - Add format validation

4. **Performance Optimization:**
   - Profile slow operations
   - Consider parallel processing for multiple clips
   - Optimize FFmpeg parameters

**Files to Modify:**

- `backend/src/pipeline/preprocess.py`
- `backend/src/pipeline/editing.py`
- `backend/src/tasks.py`

---

### 🤖 ML Model Integration (Priority: Medium)

**Goal:** Enable real highlight detection model

**Current Status:**

- Model interface exists: `backend/src/ml/highlights/model.py`
- Mock implementation active
- `USE_HIGHLIGHT_MODEL=false` by default

**Steps:**

1. **Model Training/Selection:**

   - Decide on model architecture (custom? pre-trained?)
   - Train or fine-tune model for highlight detection
   - Evaluate model performance

2. **Model Integration:**

   - Replace mock in `backend/src/ml/highlights/model.py`
   - Handle model loading/initialization
   - Add model inference to highlight detection pipeline
   - File: `backend/src/pipeline/highlight_detection.py`

3. **Model Serving:**

   - Consider separate model service (optional)
   - Or load model in worker process
   - Handle GPU/CPU inference

4. **Feature Flag:**
   - Enable via `USE_HIGHLIGHT_MODEL=true`
   - Test both modes (rule-based vs ML-based)
   - Compare results

**Files to Modify:**

- `backend/src/ml/highlights/model.py` - Replace mock
- `backend/src/pipeline/highlight_detection.py` - Use model
- `backend/src/config.py` - Feature flag already exists

---

### 📊 Monitoring & Observability (Priority: Medium)

**Goal:** Add production monitoring and error tracking

**Steps:**

1. **Error Tracking:**

   - Set up Sentry (https://sentry.io) or similar
   - Add error capture to FastAPI
   - Track exceptions, API errors, rendering failures
   - File: `backend/src/main.py`

2. **Logging:**

   - Structured logging (JSON format)
   - Log levels configuration
   - Log aggregation (optional: ELK, Loki, etc.)
   - File: `backend/src/config.py` has `LOG_LEVEL`

3. **Metrics:**

   - Add Prometheus metrics (optional)
   - Track: API response times, job completion rates, error rates
   - Dashboard (Grafana if using Prometheus)

4. **Health Checks:**

   - Add `/health` endpoint
   - Check database, Redis, storage connectivity
   - File: `backend/src/main.py`

5. **Performance Monitoring:**
   - APM tool (New Relic, Datadog, etc.) - optional
   - Database query monitoring
   - Slow query identification

**Files to Create/Modify:**

- `backend/src/main.py` - Add Sentry, health check
- `.env.production.example` - Add Sentry DSN

**Help:**

- Use ChatGPT: "How to set up Sentry error tracking for FastAPI?"

---

### 🔄 CI/CD Improvements (Priority: Low)

**Goal:** Enhance continuous integration pipeline

**Current Status:**

- `.github/workflows/ci.yml` exists and runs
- Backend tests job expects pytest but no tests exist yet
- Frontend tests job runs `npm run lint` (may not exist)

**Steps:**

1. **Fix Test Jobs:**

   - Add actual test files (see Testing Infrastructure above)
   - Ensure pytest runs successfully
   - Fix any linting errors

2. **Add Missing Scripts:**

   - Check if `package.json` has `lint` script
   - Add if missing: `"lint": "eslint src --ext js,jsx"`

3. **Code Quality:**

   - Add pre-commit hooks (optional)
   - Ensure black/flake8 pass
   - Add type checking (mypy)

4. **Build Optimization:**
   - Optimize Docker build cache
   - Multi-stage builds if needed
   - Reduce image size

**Files to Modify:**

- `.github/workflows/ci.yml` - Fix failing jobs
- `package.json` - Add lint script if missing
- `backend/src/requirements.txt` - Ensure pytest dependencies

---

### 🗄️ Database Migrations (Priority: Medium)

**Goal:** Proper database schema management

**Current Status:**

- SQLModel handles schema automatically
- No explicit migrations system

**Steps:**

1. **Add Alembic:**

   - Set up Alembic for migrations
   - Create initial migration from current models
   - Document migration process

2. **Migration Strategy:**

   - Version control migrations
   - Test migrations on staging
   - Rollback procedures

3. **Schema Review:**
   - Verify all models are optimal
   - Check indexes on frequently queried fields
   - Add foreign key constraints where needed

**Files to Create:**

- `backend/src/alembic.ini`
- `backend/src/alembic/` directory
- Migration scripts

**Help:**

- Use ChatGPT: "How to set up Alembic migrations with SQLModel?"

---

### 🌐 Frontend Improvements (Priority: Low)

**Goal:** Enhance frontend functionality and UX

**Steps:**

1. **Error Handling:**

   - Better error messages for users
   - Network error handling
   - Retry logic for failed requests

2. **Loading States:**

   - Improve loading indicators
   - Skeleton screens for better UX
   - Progress indicators for uploads

3. **Responsive Design:**

   - Test on mobile devices
   - Improve mobile navigation
   - Touch-friendly controls

4. **Performance:**
   - Code splitting
   - Lazy loading components
   - Image optimization
   - Bundle size analysis

**Files to Modify:**

- `src/components/*.jsx` - Add error/loading states
- `src/App.jsx` - Improve error boundaries
- `vite.config.js` - Optimize build

---

### 📝 Documentation (Priority: Low)

**Goal:** Improve code and API documentation

**Steps:**

1. **API Documentation:**

   - Review FastAPI auto-generated docs (`/docs`)
   - Add better descriptions to endpoints
   - Add request/response examples

2. **Code Documentation:**

   - Add docstrings to key functions
   - Document complex algorithms
   - Add inline comments where needed

3. **Setup Documentation:**
   - Verify `README.md` is up to date
   - Add troubleshooting section
   - Update `DEPLOYMENT.md` with actual deployment steps

**Files to Modify:**

- `backend/src/api_*.py` - Add better docstrings
- `README.md` - Update setup instructions
- `DEPLOYMENT.md` - Add deployment details

---

### 🎬 Upload Form Refactoring (Priority: Medium)

**Goal:** Clean up and optimize the UploadForm component

**Current Status:**

- `src/components/UploadForm.jsx` has both sync and async upload methods
- Some duplicate state management between `clipFile` and `files`
- Could benefit from consolidation and better error handling

**Steps:**

1. **Consolidate State Management:**

   - Unify `clipFile` and `files` into a single state structure
   - Simplify file handling logic to reduce duplication
   - Clean up unused variables and functions

2. **Improve Error Handling:**

   - Add better error messages for different failure scenarios
   - Handle edge cases (network failures, corrupted files, etc.)
   - Add retry logic for failed uploads

3. **Code Organization:**

   - Extract upload logic into custom hooks if needed
   - Separate concerns (file validation, upload, status tracking)
   - Improve component readability and maintainability

4. **Testing Considerations:**
   - Make component more testable by extracting logic
   - Add data-testid attributes where helpful
   - Consider adding unit tests once test infrastructure is set up

**Files to Modify:**

- `src/components/UploadForm.jsx` - Refactor and optimize

**Help:**

- Use ChatGPT: "How to refactor React component with multiple upload methods?"
- Use ChatGPT: "Best practices for file upload error handling in React"

---

## 🧭 Priority Order

1. **High Priority (Do First):**

   - Testing Infrastructure
   - Production Deployment
   - Security Hardening

2. **Medium Priority (Do Soon):**

   - ML Model Integration
   - Monitoring & Observability
   - Database Migrations
   - Video Processing Enhancements

3. **Low Priority (Nice to Have):**
   - CI/CD Improvements
   - Frontend Improvements
   - Documentation

---

## 📋 Quick Reference

### Environment Variables Needed (Production)

```bash
# Security
JWT_SECRET_KEY=<strong-random-key>

# Database
POSTGRES_DSN=postgresql+psycopg://user:pass@host:5432/db
USE_POSTGRES=true

# Storage
S3_ENDPOINT_URL=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=aiditor-prod
USE_OBJECT_STORAGE=true

# OAuth (Daan will get these)
STEAM_API_KEY=...
XBOX_CLIENT_ID=...
# ... etc

# Stripe (Daan will set up)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_CREATOR=price_...

# AI Services
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Base URL
BASE_URL=https://yourdomain.com
```

### Critical Files to Review

- `backend/src/config.py` - All settings
- `backend/src/auth.py` - JWT implementation
- `backend/src/main.py` - CORS, middleware
- `.github/workflows/ci.yml` - Deployment script

---

## 🪜 Progress Log

| Date       | Task                                | Status | Notes                     |
| ---------- | ----------------------------------- | ------ | ------------------------- |
| 2025-01-27 | Initial TODO list created           | ✅     | Agent generated tasks     |
| 2025-01-27 | Fixed package-lock.json conflicts   | ✅     | Regenerated clean file    |
| 2025-01-27 | Fixed config.py trailing whitespace | ✅     | Cleaned up formatting     |
| 2025-01-27 | Upload Form refactoring task added  | 📋     | New task for code cleanup |

---

## 📝 Notes

- **Testing is critical** - CI/CD pipeline expects tests but none exist
- **Security first** - JWT secret has dev default, must change for production
- **Deployment ready** - Infrastructure exists, just needs deployment script
- **Coordinate with Daan** - He's handling credentials, you handle code

---

## 🤝 Coordination with Daan

**Daan is working on:**

- OAuth credential setup (Steam, Xbox, PSN, Nintendo)
- Stripe account and webhook configuration
- Social media API research (TikTok, YouTube, Instagram)
- Design research

**You should:**

- Review OAuth implementations once Daan provides credentials
- Test Stripe webhooks once Daan sets them up
- Implement social posting once Daan researches APIs
- Review design inspirations and implement UI improvements

**Communication:**

- Check `TODO_DAAN.md` regularly to see what Daan has completed
- Update Daan when code changes affect his tasks (e.g., new env vars)
- Test integrations once Daan provides credentials

---

_Next agent run will update this file with new tasks based on progress and Daan's work._
