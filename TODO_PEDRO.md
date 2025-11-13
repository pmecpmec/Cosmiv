# TODO_PEDRO.md

_Last updated: 2025-01-28_

## 👋 Hey Pedro (pmec)!

This is your **technical development checklist**. These are tasks that require coding, infrastructure work, or technical decision-making.

**Note:** Daan (DeWindWaker) is handling API credentials, OAuth setup, and design research. Check `TODO_DAAN.md` to see what he's working on.

---

## ✅ Current Snapshot

| Area                   | Status          | Notes                                                    |
| ---------------------- | --------------- | -------------------------------------------------------- |
| Test Suite             | 🟡 Partial      | Basic auth + API tests exist, need more coverage         |
| Production Deployment  | ⚙️ Placeholder  | CI/CD has deployment stub                                |
| Environment Variables  | ⚙️ Partial      | Need production `.env` template                          |
| ML Models              | ⚙️ Stub         | Highlight detection model interface exists               |
| Security Hardening     | 🟡 Partial      | JWT secrets need production config                       |
| Feed Algorithm         | ⏳ Pending      | Database models exist, algorithm needs implementation    |
| Community Features     | ⏳ Pending      | Models exist, API endpoints and frontend needed          |
| Real-time Messaging    | ⏳ Pending      | WebSocket implementation needed                          |

---

## 🚀 High Priority Tasks

### 1. Production Deployment Setup (Priority: CRITICAL)

**Goal:** Get Cosmiv deployed and running in production.

**Steps:**

1. **Complete Production Environment Template**
   - Review `env.production.example`
   - Ensure all required variables are documented
   - Add comments explaining each variable
   - Reference: `DEPLOYMENT.md`

2. **Set Up CI/CD Pipeline**
   - Complete the deployment stub in CI/CD config
   - Configure deployment to production environment
   - Add health checks and rollback mechanisms
   - Reference: `DEPLOYMENT.md` → CI/CD section

3. **Production Database Setup**
   - Set up PostgreSQL database (managed service recommended)
   - Run Alembic migrations in production
   - Verify database backups are configured
   - Reference: `backend/src/alembic/MIGRATION_GUIDE.md`

4. **Production Storage Configuration**
   - Set up S3-compatible storage (AWS S3 or Cloudflare R2)
   - Configure bucket policies and CORS
   - Test file uploads and exports
   - Reference: `DEPLOYMENT.md` → Storage Setup

5. **SSL & Domain Configuration**
   - Configure domain DNS
   - Set up SSL certificates (Let's Encrypt)
   - Test HTTPS endpoints

**Resources:**
- `DEPLOYMENT.md` - Complete deployment guide
- `SECURITY.md` - Security checklist
- `backend/src/alembic/MIGRATION_GUIDE.md` - Migration instructions

**Time Estimate:** 4-6 hours

**Follow-up:** After deployment, test all critical flows (upload, processing, export) and monitor logs.

---

### 2. Security Hardening (Priority: CRITICAL)

**Goal:** Ensure production security best practices are in place.

**Steps:**

1. **Generate Strong JWT Secret**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   - Add to production environment variables
   - Never commit to repo
   - Reference: `SECURITY.md`

2. **Configure CORS Properly**
   - Update CORS settings to only allow frontend domain
   - Remove any `*` wildcards in production
   - Test from frontend application

3. **Implement Rate Limiting**
   - Add rate limiting to authentication endpoints
   - Add rate limiting to upload endpoints
   - Configure per-user and per-IP limits

4. **Review Environment Variables**
   - Audit all `.env` files
   - Ensure no secrets are hardcoded
   - Verify all sensitive data uses environment variables
   - Reference: `SECURITY.md` → Security Audit Commands

5. **Database Security**
   - Use strong PostgreSQL passwords
   - Enable SSL/TLS connections
   - Restrict database access to backend only

**Resources:**
- `SECURITY.md` - Security guide and audit commands
- `backend/src/security.py` - Security utilities

**Time Estimate:** 2-3 hours

**Follow-up:** Run security audit commands before making repo public.

---

### 3. Test Coverage Expansion (Priority: HIGH)

**Goal:** Add comprehensive test coverage for critical functionality.

**Steps:**

1. **Backend API Tests**
   - Expand `backend/tests/test_api_endpoints.py`
   - Add tests for video upload and processing
   - Add tests for feed endpoints
   - Add tests for community features
   - Add tests for billing/subscription flows

2. **Authentication Tests**
   - Expand `backend/tests/test_auth.py`
   - Test JWT token generation and validation
   - Test refresh token flow
   - Test role-based access control

3. **Video Processing Tests**
   - Add tests for highlight detection
   - Add tests for video rendering
   - Add tests for Celery task workflows
   - Reference: `backend/tests/test_upload_clips_api.py`

4. **Integration Tests**
   - Test end-to-end video processing pipeline
   - Test file storage operations
   - Test database migrations

5. **Set Up Test Coverage Reporting**
   - Configure pytest-cov
   - Set minimum coverage threshold
   - Add coverage reports to CI/CD

**Resources:**
- `backend/tests/` - Existing test files
- `backend/tests/README.md` - Test documentation

**Time Estimate:** 6-8 hours

**Follow-up:** Aim for 80%+ coverage on critical paths.

---

### 4. Feed Algorithm Implementation (Priority: HIGH)

**Goal:** Implement the personalized feed algorithm for the social feed feature.

**Steps:**

1. **Review Algorithm Requirements**
   - Reference: `FEED_AND_PROFILES.md` → Algorithm Components
   - Understand engagement scoring, recency weighting, creator reputation

2. **Implement Algorithm Backend**
   - Create `backend/src/services/feed_algorithm.py`
   - Implement engagement score calculation
   - Implement feed ranking logic
   - Add caching for performance

3. **Create Feed API Endpoints**
   - `GET /api/v2/feed/for-you` - Algorithm-driven feed
   - `GET /api/v2/feed/following` - Following feed
   - `GET /api/v2/feed/trending` - Trending feed
   - `GET /api/v2/feed/new` - Latest posts

4. **Add Feed Preferences**
   - Allow users to adjust feed preferences
   - Store preferences in database
   - Use preferences in algorithm

5. **Optimize Performance**
   - Add database indexes for feed queries
   - Implement pagination
   - Add Redis caching for hot content

**Resources:**
- `FEED_AND_PROFILES.md` - Feed system documentation
- `backend/src/api_feed.py` - Existing feed endpoints (if any)

**Time Estimate:** 8-10 hours

**Follow-up:** Test feed algorithm with real user data and adjust weights based on engagement.

---

### 5. Community Features - Backend (Priority: MEDIUM)

**Goal:** Implement backend API for Discord-like community features.

**Steps:**

1. **Review Community Models**
   - Check existing models in `backend/src/models_community.py`
   - Verify all required fields are present
   - Reference: `COMMUNITY_FEATURES.md`

2. **Implement Server Management APIs**
   - `POST /api/v2/communities` - Create server
   - `GET /api/v2/communities` - List servers
   - `PUT /api/v2/communities/{id}` - Update server
   - `DELETE /api/v2/communities/{id}` - Delete server

3. **Implement Channel APIs**
   - `POST /api/v2/communities/{id}/channels` - Create channel
   - `GET /api/v2/communities/{id}/channels` - List channels
   - `PUT /api/v2/channels/{id}` - Update channel
   - `DELETE /api/v2/channels/{id}` - Delete channel

4. **Implement Message APIs**
   - `POST /api/v2/channels/{id}/messages` - Send message
   - `GET /api/v2/channels/{id}/messages` - Get messages (paginated)
   - `PUT /api/v2/messages/{id}` - Edit message
   - `DELETE /api/v2/messages/{id}` - Delete message

5. **Implement Role & Permission System**
   - Add role-based access control to endpoints
   - Check permissions before allowing actions
   - Reference: `COMMUNITY_FEATURES.md` → Roles & Permissions

**Resources:**
- `COMMUNITY_FEATURES.md` - Community system documentation
- `backend/src/models_community.py` - Community models
- `backend/src/api_communities.py` - Community endpoints (if exists)

**Time Estimate:** 10-12 hours

**Follow-up:** Once backend is ready, coordinate with frontend for UI implementation.

---

### 6. Real-time Messaging (Priority: MEDIUM)

**Goal:** Implement WebSocket-based real-time messaging for communities.

**Steps:**

1. **Set Up WebSocket Infrastructure**
   - Choose WebSocket library (FastAPI WebSockets or Socket.io)
   - Set up WebSocket endpoint
   - Configure connection management

2. **Implement Message Broadcasting**
   - Broadcast new messages to channel subscribers
   - Handle user presence (online/offline status)
   - Implement typing indicators

3. **Add Connection Management**
   - Track active connections
   - Handle reconnections
   - Clean up disconnected users

4. **Implement Real-time Features**
   - Message updates
   - Reaction updates
   - User join/leave notifications
   - Channel updates

5. **Scale Considerations**
   - Consider Redis pub/sub for multi-server scaling
   - Add connection limits per user
   - Monitor connection counts

**Resources:**
- FastAPI WebSockets documentation
- `COMMUNITY_FEATURES.md` - Real-time messaging requirements

**Time Estimate:** 8-10 hours

**Follow-up:** Test with multiple concurrent users and verify message delivery.

---

## 🔧 Medium Priority Tasks

### 7. ML Model Enhancement (Priority: MEDIUM)

**Goal:** Improve highlight detection model accuracy.

**Steps:**

1. **Review Current Model Implementation**
   - Check `backend/src/ml/highlights/model.py`
   - Understand current detection algorithm
   - Identify improvement opportunities

2. **Collect Training Data**
   - Gather labeled highlight clips
   - Create dataset with positive/negative examples
   - Organize by game genre

3. **Improve Model Architecture** (if needed)
   - Experiment with different model architectures
   - Fine-tune hyperparameters
   - Add ensemble methods

4. **Implement Model Evaluation**
   - Add evaluation metrics (precision, recall, F1)
   - Create test set for validation
   - Monitor model performance in production

**Resources:**
- `backend/src/pipeline/highlight_detection.py` - Detection pipeline
- `backend/src/ml/highlights/model.py` - Model implementation

**Time Estimate:** 12-16 hours

**Follow-up:** Deploy improved model and monitor highlight detection quality.

---

### 8. Video Processing Optimization (Priority: MEDIUM)

**Goal:** Optimize video processing pipeline for speed and quality.

**Steps:**

1. **Profile Current Pipeline**
   - Measure processing times for each stage
   - Identify bottlenecks
   - Check Celery task performance

2. **Optimize FFmpeg Operations**
   - Review FFmpeg command efficiency
   - Add hardware acceleration if available
   - Optimize encoding settings

3. **Implement Parallel Processing**
   - Process multiple clips in parallel
   - Optimize Celery worker configuration
   - Add task prioritization

4. **Add Progress Tracking**
   - Improve job state updates
   - Add more granular progress reporting
   - Update frontend progress indicators

5. **Implement Caching**
   - Cache processed clips
   - Avoid reprocessing identical content
   - Use Redis for cache storage

**Resources:**
- `backend/src/pipeline/` - Processing pipeline
- `backend/src/tasks.py` - Celery tasks
- `backend/src/services/job_state.py` - Job state management

**Time Estimate:** 6-8 hours

**Follow-up:** Monitor processing times and user feedback on video quality.

---

### 9. Analytics Implementation (Priority: MEDIUM)

**Goal:** Add analytics tracking for platform usage and performance.

**Steps:**

1. **Define Analytics Events**
   - User actions (upload, share, like, comment)
   - Video processing events
   - Feature usage
   - Error tracking

2. **Implement Analytics Backend**
   - Create analytics logging service
   - Store events in database
   - Add aggregation queries

3. **Create Analytics API**
   - `GET /api/v2/analytics/overview` - Platform overview
   - `GET /api/v2/analytics/videos` - Video analytics
   - `GET /api/v2/analytics/users` - User analytics
   - Add role-based access (admin only)

4. **Add Dashboard UI** (or provide data for frontend)
   - Design analytics dashboard layout
   - Create visualization components
   - Add date range filters

**Resources:**
- `backend/src/api_analytics.py` - Analytics endpoints (if exists)
- Admin dashboard requirements

**Time Estimate:** 8-10 hours

**Follow-up:** Use analytics to identify popular features and optimization opportunities.

---

## 📋 Low Priority / Future Tasks

### 10. AI Systems Enhancement

- Improve AI content generation prompts
- Add more AI model options
- Implement AI model fallbacks
- Reference: `AI_SYSTEMS.md`

### 11. Background Job Monitoring

- Add job queue monitoring dashboard
- Implement job retry policies
- Add dead letter queue handling
- Monitor Celery worker health

### 12. API Documentation

- Complete OpenAPI/Swagger documentation
- Add example requests/responses
- Document authentication flows
- Add rate limit documentation

### 13. Performance Monitoring

- Set up application performance monitoring (APM)
- Add error tracking (Sentry)
- Monitor database query performance
- Set up alerts for critical issues

---

## 📝 Quick Reference

### Important Files
- `DEPLOYMENT.md` - Deployment guide
- `SECURITY.md` - Security checklist
- `backend/src/alembic/MIGRATION_GUIDE.md` - Database migrations
- `FEED_AND_PROFILES.md` - Feed system docs
- `COMMUNITY_FEATURES.md` - Community features docs

### Common Commands
```bash
# Run tests
cd backend && pytest

# Run migrations
cd backend/src && alembic upgrade head

# Start development server
cd backend/src && uvicorn main:app --reload

# Check test coverage
cd backend && pytest --cov=src --cov-report=html
```

### Environment Setup
- Backend requires: Python 3.11+, PostgreSQL, Redis, S3 storage
- Frontend requires: Node.js 18+, npm/yarn
- See `readme.md` for full setup instructions

---

## 📊 Progress Log

| Date       | Task                                  | Status | Notes                           |
| ---------- | ------------------------------------- | ------ | ------------------------------- |
| 2025-01-28 | Initial TODO list created             | ✅     | Structured tasks for Pedro     |

---

**Remember:** 
- Check `TODO_DAAN.md` regularly to coordinate on OAuth/API integrations
- Update this file when completing tasks
- Ask for help if anything is unclear or blocking

