# Weekly Montage Automation Flow
## Automated Clip Compilation & Export System

**Last Updated:** 2025-01-27  
**Author:** Daan (DeWindWaker)  
**Purpose:** Document the weekly montage automation system for Cosmiv platform

---

## Overview

The weekly montage automation system automatically compiles the best clips from each week into a highlight montage, then optionally posts them to social media platforms.

**Key Components:**
- Celery Beat scheduler (runs periodic tasks)
- `compile_weekly_montage` task (runs weekly)
- Weekly montage rendering pipeline
- Automatic social media posting (optional)

---

## Automation Flow

### 1. Scheduling (Celery Beat)

**Location:** `backend/src/tasks.py` (lines 57-72)

**Configuration:**
```python
celery_app.conf.beat_schedule = {
    "compile-weekly-montage": {
        "task": "compile_weekly_montage",
        "schedule": 604800.0,  # Every 7 days (weekly on Monday)
    },
}
```

**Cadence:**
- **Frequency:** Every 7 days (weekly)
- **Timing:** Runs on Monday (calculated from week start)
- **Timezone:** UTC

**Note:** Can be made more specific with crontab format if needed, e.g.:
```python
"schedule": crontab(hour=2, minute=0, day_of_week=1)  # Monday 2 AM UTC
```

---

### 2. Weekly Compilation Process

**Task:** `compile_weekly_montage()`  
**Location:** `backend/src/tasks.py` (lines 728-848)

#### Step-by-Step Flow

1. **Calculate Week Start**
   - Determines Monday 00:00:00 UTC for the current week
   - Ensures consistent week boundaries

2. **Check for Existing Montage**
   - Queries `WeeklyMontage` table for existing montage for this week
   - If exists, returns early (prevents duplicates)

3. **Query Successful Jobs**
   - Finds all `Job` records with:
     - `status == SUCCESS`
     - `created_at` between week_start and week_end
   - Ordered by `created_at DESC`
   - Limited to 50 most recent jobs

4. **Collect Render Files**
   - For each successful job, finds landscape format `Render` records
   - Verifies file exists on disk
   - Collects clip paths and metadata

5. **Select Top Clips**
   - Sorts clips by creation date (newest first)
   - Selects top 10-15 clips
   - Target duration: 180 seconds (3 minutes)

6. **Create Weekly Montage Record**
   - Creates `WeeklyMontage` database record:
     - `week_start`: Start of week
     - `clip_count`: Number of clips selected
     - `total_duration`: Target duration (180s)
     - `title`: Auto-generated (e.g., "Weekly Highlights - January 27, 2025")
     - `featured_user_ids`: JSON array (currently empty, can be enhanced)

7. **Copy Clips to Upload Directory**
   - Creates new job directory
   - Copies selected clips to upload folder
   - Prepares for rendering pipeline

8. **Create Render Job**
   - Creates new `Job` record with status `PENDING`
   - Links job to `WeeklyMontage` via `job_id`
   - Queues `render_job.delay()` for async processing

9. **Render Pipeline**
   - Same pipeline as user uploads:
     - Preprocessing
     - Scene detection
     - Highlight scoring
     - Rendering (landscape + portrait)
     - Music generation
     - Final mixing

10. **Auto-Post to Social Media** (Optional)
    - After rendering completes, checks for Creator+ users with `auto_post_weekly=True`
    - Portrait → TikTok/Instagram
    - Landscape → YouTube
    - Posts automatically scheduled

---

## Storage & Destination

### Current Implementation

**Storage Location:**
- **Development:** Local filesystem (`/app/storage/exports/`)
- **Production:** S3/MinIO (if `USE_OBJECT_STORAGE=true`)

**File Paths:**
- **Render outputs:**
  - Landscape: `exports/{job_id}/final_landscape.mp4`
  - Portrait: `exports/{job_id}/final_portrait.mp4`
- **Public URLs:** Stored in database `WeeklyMontage` records:
  - `render_path_landscape`
  - `render_path_portrait`

### Recommended Destinations

#### Option 1: S3/Cloud Storage (Current)

**Pros:**
- Scalable
- CDN-enabled URLs
- Good for serving to frontend

**Configuration:**
```env
USE_OBJECT_STORAGE=true
S3_BUCKET=cosmiv
S3_ENDPOINT_URL=https://s3.amazonaws.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

#### Option 2: YouTube Upload (Future)

**Implementation Status:** ❌ Not yet implemented  
**Recommended:** Add as automatic export option

**Requirements:**
- YouTube Data API v3 credentials
- OAuth 2.0 for channel access
- Video upload API

**Suggested Flow:**
1. After rendering completes
2. Upload to YouTube as unlisted
3. Store YouTube video ID in database
4. Make public or schedule publish date

#### Option 3: TikTok/Instagram Upload (Future)

**Implementation Status:** ⚠️ Partial (auto-post exists for Creator+ users)

**Requirements:**
- TikTok Business API
- Instagram Graph API
- User consent for auto-posting

---

## Configuration

### Celery Beat Schedule

**Current:** 604800 seconds (7 days)

**Recommended Adjustments:**

```python
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "compile-weekly-montage": {
        "task": "compile_weekly_montage",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),  # Monday 2 AM UTC
    },
}
```

### Clip Selection Criteria

**Current:**
- Top 15 clips by creation date

**Recommended Enhancement Options:**
- Score-based selection (use `Job` scoring metadata if available)
- User popularity metrics
- Engagement metrics (views, likes)
- Genre/style filtering

### Target Duration

**Current:** 180 seconds (3 minutes)

**Recommendation:** Make configurable via environment variable:
```env
WEEKLY_MONTAGE_DURATION=180  # seconds
```

---

## Database Schema

### WeeklyMontage Table

```python
class WeeklyMontage(SQLModel, table=True):
    id: Optional[int]
    week_start: datetime  # Monday 00:00:00 UTC
    job_id: Optional[str]  # Render job that created this
    render_path_landscape: Optional[str]  # S3 URL or local path
    render_path_portrait: Optional[str]
    title: Optional[str]  # Auto-generated title
    featured_user_ids: Optional[str]  # JSON array
    clip_count: int
    total_duration: float
    is_featured: bool  # Admin can feature
    created_at: datetime
```

---

## API Endpoints

**Location:** `backend/src/api_weekly_montages.py`

### List Weekly Montages
```
GET /v2/weekly-montages?limit=10&featured_only=false
```

### Get Latest Montage
```
GET /v2/weekly-montages/latest
```

### Get Specific Montage
```
GET /v2/weekly-montages/{montage_id}
```

### Manual Trigger (Admin)
```
POST /v2/weekly-montages/trigger
```

### Feature/Unfeature (Admin)
```
PATCH /v2/weekly-montages/{montage_id}/feature
```

### Update Title (Admin)
```
PATCH /v2/weekly-montages/{montage_id}/title
```

---

## Automation Recommendations

### 1. Export Destination Priority

**Recommended Order:**
1. ✅ **S3/Cloud Storage** (Primary - for frontend serving)
2. ⚠️ **YouTube Upload** (Secondary - for public distribution)
3. ⚠️ **TikTok/Instagram** (Tertiary - user opt-in only)

### 2. Celery Beat Cadence

**Current:** Every 7 days  
**Recommended:** Keep weekly, but make time configurable:
- Default: Monday 2 AM UTC
- Make timezone-aware
- Allow admin override via API

### 3. Clip Selection Enhancement

**Current:** Simple date-based selection  
**Recommended Improvements:**
- Score-based ranking (if scoring metadata available)
- Diversity (ensure variety in clips)
- User representation (balance featured users)

### 4. Notification System

See `docs/NOTIFICATION_SYSTEM.md` for recommendations on notifying users when weekly montages complete.

---

## Monitoring & Logging

### Key Log Events

- `"Starting weekly montage compilation"` - Task started
- `"Weekly montage for week {week_start} already exists"` - Duplicate prevention
- `"No successful jobs found for weekly montage"` - No clips available
- `"Created weekly montage job {job_id} with {count} clips"` - Job created
- Render pipeline logs (from `render_job`)

### Metrics to Track

- Weekly montage creation success rate
- Average clips per montage
- Render completion time
- Auto-post success rate
- User engagement (views, shares)

---

## Future Enhancements

### 1. Smart Clip Selection
- ML-based scoring of clip quality
- Genre/style diversity
- User engagement metrics

### 2. Multi-Format Exports
- Short-form (TikTok/Reels): 15-60 seconds
- Medium-form (Instagram): 60-180 seconds
- Long-form (YouTube): 3-10 minutes

### 3. Custom Montage Themes
- Weekly theme selection (based on trending games/styles)
- Custom music for weekly montages
- Branded intro/outro sequences

### 4. User Notifications
- Email when user's clip is featured
- In-app notifications
- Social media tags/mentions

### 5. Analytics Dashboard
- Weekly montage performance metrics
- Engagement tracking
- User feedback collection

---

## Troubleshooting

### Weekly Montage Not Creating

**Check:**
1. Celery Beat is running (`docker-compose up beat`)
2. Redis connection is working
3. Database has successful jobs in the week
4. Render files exist on disk
5. Check logs: `docker-compose logs beat`

### Clips Not Selected

**Possible Causes:**
- No successful jobs in the week
- Render files deleted or moved
- Path resolution issues
- File permissions

**Solution:** Check database for `Job` records with `status == SUCCESS` and verify `Render` files exist.

### Auto-Post Not Working

**Check:**
1. User has Creator+ subscription
2. `auto_post_weekly=True` in `SocialConnection`
3. Social media API credentials configured
4. OAuth tokens are valid
5. Platform APIs enabled (`TIKTOK_API_ENABLED`, etc.)

---

## References

- **Code:** `backend/src/tasks.py` (lines 728-848)
- **API:** `backend/src/api_weekly_montages.py`
- **Models:** `backend/src/models.py` (WeeklyMontage)
- **Celery Beat Config:** `backend/src/tasks.py` (lines 57-72)

---

**Last Updated:** 2025-01-27  
**Next Review:** After first production weekly montage

