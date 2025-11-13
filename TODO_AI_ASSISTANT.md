# TODO_AI_ASSISTANT.md

_Last updated: 2025-01-28 by Auto (AI Assistant)_

## 👋 Hey Auto! (AI Assistant)

This is **your personal to-do list** for working on the Cosmiv project. This file tracks what needs to be done, what you've completed, and notes for future reference.

**Current Project:** Cosmiv - AI Gaming Montage Platform  
**Tech Stack:** FastAPI (Python) + React (Vite) + PostgreSQL + Redis + Celery + Docker

---

## 📝 Current Status

**Completed:**
- ✅ Password authentication fully working
- ✅ Admin API properly queries user jobs
- ✅ Database connectivity confirmed
- ✅ UploadForm refactored and consolidated
- ✅ Testing infrastructure added (auth + API tests)
- ✅ 3D Planet Background implemented
- ✅ Service Worker upload sync implemented

## 🚨 URGENT - Critical Issues to Fix

### 1. **Database Migration Required** (Priority: HIGH)

**Status:** ⚠️ SQLModel auto-creation may not handle all cases

**Problem:**

- User model has `password_hash` field, but existing users may not have it
- Need proper migration if switching from SQLite to PostgreSQL
- No Alembic migrations set up yet

**What to do:**

1. Check if PostgreSQL database exists and is accessible
2. Verify all models are created correctly in PostgreSQL
3. If needed, run database initialization/migration
4. Consider adding Alembic for future schema changes

**Files to check:**

- `backend/src/db.py` - Database initialization
- `backend/src/models.py` - All model definitions
- Check if `password_hash` is nullable and defaults properly

---

## 📋 Backend Tasks

### High Priority



#### 2. **Database Connection Testing**

**Status:** 🟡 Partially Done  
**Note:** PostgreSQL is enabled but needs verification

**What to do:**

1. Test database connection from backend container
2. Verify all tables are created in PostgreSQL
3. Test user registration/login with PostgreSQL
4. Check if existing SQLite data needs migration

**Commands to run:**

```powershell
cd backend
docker-compose exec backend python -c "from db import get_session; from models import User; s = get_session().__enter__(); print('DB OK'); print(f'Users: {len(s.exec(select(User)).all())}')"
```

---

#### 3. **Health Check Endpoint Enhancement**

**Status:** 🟢 Exists but could be better  
**File:** `backend/src/main.py` lines 73-111

**What to do:**

1. Add PostgreSQL connectivity check (not just SQLModel query)
2. Add more detailed error messages
3. Consider adding response time metrics
4. Add Celery worker health check

**Current status:** Basic health check exists, but PostgreSQL check is generic

---

### Medium Priority

#### 4. **Error Handling in Upload/Job Endpoints**

**Status:** 🟡 Needs Improvement

**What to do:**

1. Review error handling in `/jobs` endpoint
2. Add better error messages for file validation
3. Improve error detail JSON structure
4. Add file size limits validation

**Files:**

- `backend/src/main.py` (upload endpoints)
- `backend/src/api_upload.py`
- `backend/src/api_v2.py`

---

#### 5. **Clean Up Orphaned Files**

**Status:** 🔴 Found orphaned files

**Files found:**

- `backend/src/auth_login_fixed.py` - Appears to be a backup/temp file
- `backend/src/auth.py.backup` - Backup file

**What to do:**

1. Review if these files are needed
2. If not, delete them
3. Check for other backup/temp files in src/

---

#### 6. **Add Missing Tests**

**Status:** 🔴 Critical - No tests found for core functionality

**What to do:**

1. Create test structure (see TODO_PEDRO.md for details)
2. Add tests for:
   - Authentication (register, login, token validation)
   - Job creation and status polling
   - File upload validation
   - Database operations
3. Set up pytest configuration
4. Add to CI/CD pipeline

**Files to create:**

- `backend/src/tests/test_auth.py`
- `backend/src/tests/test_jobs.py`
- `backend/src/tests/test_upload.py`

**Reference:** `TODO_PEDRO.md` has detailed testing plan

---

#### 7. **Security Hardening**

**Status:** 🟡 Partially Complete

**What to do:**

1. Change JWT_SECRET_KEY default (currently has dev key)
2. Add rate limiting to auth endpoints (login, register)
3. Add CSRF protection for state-changing operations
4. Review CORS configuration for production
5. Add input validation and sanitization

**Files:**

- `backend/src/config.py` - JWT_SECRET_KEY
- `backend/src/main.py` - CORS middleware
- `backend/src/auth.py` - Rate limiting needed

**Reference:** `TODO_PEDRO.md` Security Hardening section

---

### Low Priority / Future

#### 8. **API Documentation Improvements**

**Status:** 🟡 Basic docs exist via FastAPI /docs

**What to do:**

1. Add better descriptions to all endpoints
2. Add request/response examples
3. Document error responses
4. Add authentication requirements to docs

---

#### 9. **Logging Improvements**

**Status:** 🟢 Basic logging exists

**What to do:**

1. Add structured logging (JSON format)
2. Add request ID tracking
3. Add performance logging (slow queries, slow endpoints)
4. Consider log aggregation setup

---

## 📋 Frontend Tasks

### High Priority

#### 1. **UploadForm Component Refactoring**

**Status:** 🔴 Needs Cleanup  
**Priority:** Medium (from TODO_PEDRO.md)

**Problem:**

- Component has both sync (`clipFile`) and async (`files`) upload methods
- Duplicate state management between `clipFile` and `files`
- Code could be cleaner and more maintainable

**What to do:**

1. Consolidate `clipFile` and `files` into single state structure
2. Simplify file handling logic
3. Extract upload logic into custom hook (optional)
4. Improve error handling for different failure scenarios
5. Add retry logic for failed uploads
6. Clean up unused variables/functions

**Files:**

- `src/components/UploadForm.jsx`

**Notes:**

- Component is functional but has technical debt
- Both upload methods work, but code duplication exists
- See TODO_PEDRO.md for detailed refactoring plan

---

#### 2. **Error Handling in Frontend**

**Status:** 🟡 Basic error handling exists

**What to do:**

1. Review error handling in all components
2. Add better error messages for network failures
3. Add retry logic for failed API calls
4. Improve error display UI (toast notifications?)
5. Add error boundary for React errors

**Files to review:**

- `src/components/Dashboard.jsx`
- `src/components/Accounts.jsx`
- `src/components/Billing.jsx`
- `src/components/UploadForm.jsx`

---

#### 3. **Authentication Flow Testing**

**Status:** 🟡 Needs verification

**What to do:**

1. Test login flow with real user
2. Test token refresh (if implemented)
3. Test protected routes
4. Test logout functionality
5. Verify token persistence in localStorage

**Files:**

- `src/contexts/AuthContext.jsx`
- `src/components/Login.jsx`
- `src/components/Register.jsx`

---

### Medium Priority

#### 4. **Loading States Improvement**

**Status:** 🟡 Some loading states exist

**What to do:**

1. Add skeleton screens for better UX
2. Improve loading indicators consistency
3. Add progress indicators for uploads (already exists in UploadForm)
4. Add loading states for API calls in all components

---

#### 5. **Responsive Design Testing**

**Status:** 🟡 Unknown - needs verification

**What to do:**

1. Test on mobile devices (iOS, Android)
2. Test on tablets
3. Test on different screen sizes
4. Fix any layout issues
5. Test touch interactions

---

#### 6. **API Error Response Handling**

**Status:** 🟡 Inconsistent

**What to do:**

1. Create centralized error handler utility
2. Standardize error message format
3. Handle different HTTP status codes consistently
4. Show user-friendly error messages

**Files to create:**

- `src/utils/errorHandler.js` (or similar)

---

### Low Priority / Future

#### 7. **Performance Optimization**

**Status:** 🟢 Not urgent but good to have

**What to do:**

1. Code splitting for routes
2. Lazy loading components
3. Image optimization
4. Bundle size analysis
5. Add React.memo where appropriate

---

#### 8. **Accessibility Improvements**

**Status:** 🟡 Unknown - needs audit

**What to do:**

1. Add ARIA labels where needed
2. Test keyboard navigation
3. Test screen reader compatibility
4. Check color contrast ratios
5. Add focus indicators

---

## 🔍 Code Quality & Maintenance


### 2. **Remove Dead Code**

**Status:** Found orphaned files

**Files to review/delete:**

- `backend/src/auth_login_fixed.py` - Temporary file?
- `backend/src/auth.py.backup` - Backup file

---

### 3. **Code Consistency**

**Status:** 🟡 Needs review

**What to do:**

1. Ensure consistent error handling patterns
2. Ensure consistent API response formats
3. Ensure consistent naming conventions
4. Run linters (flake8, eslint) and fix issues

---

## 📝 Documentation Tasks

### 1. **Update README if needed**

**Status:** 🟢 README exists

**What to do:**

1. Verify README has correct setup instructions
2. Update with PostgreSQL setup steps
3. Add troubleshooting section if missing

---

### 2. **API Documentation**

**Status:** 🟢 FastAPI auto-generates docs

**What to do:**

1. Enhance endpoint descriptions
2. Add examples
3. Document authentication requirements

---

## 🔄 Integration Testing

### 1. **End-to-End Flow Testing**

**Status:** 🔴 Not Done

**What to do:**

1. Test complete user journey:
   - Register → Login → Upload → Process → Download
2. Test OAuth linking flow (mock mode)
3. Test billing flow (mock mode)
4. Document any issues found

---

### 2. **Database Testing**

**Status:** 🟡 Needs verification

**What to do:**

1. Test PostgreSQL connection
2. Test schema creation
3. Test data persistence
4. Test queries performance

---

## 📊 Progress Tracking

### Next Session Priority

1. **Error handling improvements** (MEDIUM) - Better error messages across all components
2. **Security hardening** (HIGH) - Rate limiting, JWT secret key, CORS for production
3. **Additional test coverage** (MEDIUM) - Pipeline tests, integration tests, edge cases
4. **Database migration setup** (HIGH) - Alembic migrations for schema management

---

## 📌 Important Notes for Future Reference

### Database Setup

- PostgreSQL is enabled in docker-compose.yml
- Password: `changeme` (CHANGE IN PRODUCTION!)
- Database: `cosmiv`
- User: `postgres`
- DSN: `postgresql+psycopg://postgres:changeme@postgres:5432/cosmiv`

### Authentication State

- ✅ JWT token generation works
- ✅ Token verification works
- ✅ Password hashing works and verification is enabled
- ✅ Login properly checks passwords and rejects incorrect credentials
- ✅ Registration saves password_hash correctly
- ✅ User inactive account check added to login flow

### Known Issues

1. Orphaned backup files exist (auth.py.backup, auth_login_fixed.py) - Could be cleaned up
2. Database migration system needed - Alembic setup for production schema changes
3. Additional test coverage needed - Pipeline tests, integration tests, edge cases

### Configuration Files

- Backend config: `backend/src/config.py`
- Docker compose: `backend/docker-compose.yml`
- Frontend config: `src/config/api.js`
- Environment: `.env` files (check for existence)

### Key Files Reference

- Auth: `backend/src/auth.py`
- Models: `backend/src/models.py`
- Main app: `backend/src/main.py`
- Frontend app: `src/App.jsx`
- Upload component: `src/components/UploadForm.jsx`
- Auth context: `src/contexts/AuthContext.jsx`

---

## 🎯 Session Goals

When you start a new session, prioritize:

1. **Critical bugs** (password auth, broken functionality)
2. **High priority tasks** (security, tests, database)
3. **User-visible improvements** (UX, error handling)
4. **Code quality** (refactoring, cleanup)

---

## 🔄 How to Use This File

1. **Before starting work:** Read the "Recently Completed" section to understand recent changes
2. **Check "URGENT" section first:** Fix critical issues before new features
3. **Work through priorities:** High → Medium → Low
4. **Update as you go:** Mark tasks complete with ✅, update notes
5. **Reference related files:** Use TODO_PEDRO.md and TODO_DAAN.md for context

---

_Last session: Cleaned up completed tasks, updated outdated references_  
_Next focus: Error handling improvements, security hardening, database migrations_
