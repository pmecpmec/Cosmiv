# Notification System Recommendations
## Alerting for Weekly Montage Completion

**Last Updated:** 2025-01-27  
**Author:** Daan (DeWindWaker)  
**Purpose:** Recommend notification approach for weekly montage job completion and platform events

---

## Overview

When weekly montage jobs complete, we should notify relevant stakeholders:
- **Admins:** Job completion status
- **Users:** When their clips are featured
- **Team:** System health and metrics

**No coding required** - this document focuses on tool selection and setup recommendations.

---

## Recommended Approaches

### Option 1: Slack Integration ⭐⭐⭐⭐⭐ (Recommended)

**Best For:** Team notifications, admin alerts, real-time updates

#### Pros ✅

- **Easy Integration:** Webhook-based, no complex setup
- **Rich Formatting:** Can include images, buttons, links
- **Real-time:** Instant notifications
- **Free Tier:** Sufficient for small teams
- **Threading:** Can create threads for weekly summaries

#### Setup Steps

1. **Create Slack App:**
   - Go to https://api.slack.com/apps
   - Create new app for workspace
   - Enable "Incoming Webhooks"
   - Create webhook URL

2. **Add to Environment:**
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   SLACK_CHANNEL=#weekly-montages  # Optional channel override
   ```

3. **Integration Point:**
   - Add webhook call in `tasks.py` after weekly montage completes
   - Send formatted message with:
     - Montage title
     - Clip count
     - Render status
     - Links to view/download

4. **Message Format Example:**
   ```
   🎬 Weekly Montage Complete!
   📅 Week: January 27, 2025
   ✂️ Clips: 12
   ⏱️ Duration: 3:00
   ✅ Status: Success
   🔗 View: https://cosmiv.app/weekly-montages/123
   ```

#### Tools Needed

- **Slack Webhook:** Built into Slack (free)
- **Python Library:** `requests` (already in requirements)
- **No Additional Services:** Just webhook URL

#### Cost

- **Free:** Unlimited messages for small teams
- **Paid:** Only if you exceed free tier limits (rare)

---

### Option 2: Discord Webhooks ⭐⭐⭐⭐

**Best For:** Gaming community, Discord-first teams

#### Pros ✅

- **Gaming-Focused:** Great for gaming community feel
- **Free:** No limits on webhooks
- **Rich Embeds:** Can create beautiful embed messages
- **Server-Based:** Easy to set up in existing Discord server

#### Cons ❌

- **Less Professional:** Not ideal for business communications
- **Limited Features:** No threading, less organization than Slack

#### Setup Steps

1. **Create Discord Webhook:**
   - Discord Server → Settings → Integrations → Webhooks
   - Create new webhook
   - Copy webhook URL

2. **Add to Environment:**
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
   ```

3. **Integration Point:**
   - Similar to Slack, call webhook after job completion
   - Use Discord embed format for rich messages

#### Cost

- **Free:** Unlimited

---

### Option 3: Email Notifications ⭐⭐⭐

**Best For:** User-facing notifications, admin summaries

#### Pros ✅

- **Universal:** Everyone has email
- **Professional:** Good for user communications
- **Detailed:** Can include full reports
- **Persistent:** Users can reference later

#### Cons ❌

- **Slower:** Not real-time
- **Deliverability:** Can end up in spam
- **Setup Complexity:** Requires email service (SendGrid, AWS SES, etc.)

#### Setup Steps

1. **Choose Email Service:**
   - **SendGrid:** Easy setup, free tier (100 emails/day)
   - **AWS SES:** Very cheap, more setup complexity
   - **Mailgun:** Good free tier, reliable

2. **Add to Environment:**
   ```env
   EMAIL_SERVICE=sendgrid  # or ses, mailgun
   SENDGRID_API_KEY=SG.xxxxx
   FROM_EMAIL=noreply@cosmiv.app
   ADMIN_EMAIL=admin@cosmiv.app
   ```

3. **Integration Point:**
   - Send email after weekly montage completes
   - Include:
     - Montage preview image
     - Links to view/download
     - Featured users list
     - Engagement stats (if available)

#### Cost

- **SendGrid:** Free (100 emails/day), then $15/month for 40k
- **AWS SES:** $0.10 per 1,000 emails (very cheap)
- **Mailgun:** Free (5,000 emails/month), then $35/month

---

### Option 4: Combination Approach ⭐⭐⭐⭐⭐ (Best)

**Best Practice:** Use multiple channels for different audiences

#### Recommended Setup

1. **Slack** → Admin/Team notifications
   - Job completion alerts
   - Error notifications
   - Weekly summary reports

2. **Email** → User notifications
   - Featured clip notifications
   - Weekly montage ready emails
   - Engagement updates

3. **In-App** → User notifications (future)
   - Push notifications
   - Notification center
   - Real-time updates

---

## Implementation Recommendations

### Phase 1: Slack Webhooks (Quick Win)

**Priority:** High  
**Effort:** Low (1-2 hours)

1. Set up Slack webhook
2. Add webhook call to `tasks.py` after montage completion
3. Format nice message with montage details
4. Test with manual trigger

**Code Location:** `backend/src/tasks.py` (after line 841 in `compile_weekly_montage`)

**Example Integration:**
```python
import requests
import os

def notify_slack_weekly_montage(montage_data):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return
    
    message = {
        "text": "🎬 Weekly Montage Complete!",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "Weekly Montage Ready"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Week:*\n{montage_data['week_start']}"},
                    {"type": "mrkdwn", "text": f"*Clips:*\n{montage_data['clip_count']}"},
                    {"type": "mrkdwn", "text": f"*Duration:*\n{montage_data['duration']}s"},
                    {"type": "mrkdwn", "text": f"*Status:*\n✅ Success"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Montage"},
                        "url": f"https://cosmiv.app/weekly-montages/{montage_data['id']}"
                    }
                ]
            }
        ]
    }
    
    requests.post(webhook_url, json=message)
```

### Phase 2: Email Notifications (User-Facing)

**Priority:** Medium  
**Effort:** Medium (4-6 hours)

1. Choose email service (SendGrid recommended)
2. Set up email templates
3. Send to featured users
4. Send weekly digest to all users

### Phase 3: In-App Notifications (Future)

**Priority:** Low  
**Effort:** High (requires frontend work)

- Real-time notifications
- Notification center UI
- Push notifications (if mobile app)

---

## Tool Comparison

| Tool | Setup Complexity | Cost | Best For | Real-time |
|------|-----------------|------|---------|-----------|
| **Slack** | ⭐⭐ Easy | Free | Team alerts | ✅ Yes |
| **Discord** | ⭐⭐ Easy | Free | Community | ✅ Yes |
| **Email** | ⭐⭐⭐ Medium | Free-$15/mo | User notifications | ❌ No |
| **SMS** | ⭐⭐⭐ Medium | $0.0075/msg | Critical alerts | ✅ Yes |

---

## Notification Types

### 1. Weekly Montage Completion

**Triggers:** After `compile_weekly_montage` completes successfully  
**Recipients:** Admins, featured users (optional)  
**Channel:** Slack + Email

**Content:**
- Montage title
- Clip count
- Featured users
- View/download links
- Render status

### 2. Job Failures

**Triggers:** When weekly montage job fails  
**Recipients:** Admins only  
**Channel:** Slack (urgent)

**Content:**
- Error message
- Job ID
- Failure stage
- Timestamp
- Log snippet

### 3. Featured User Notification

**Triggers:** When user's clip is included in weekly montage  
**Recipients:** Featured users  
**Channel:** Email + In-app (future)

**Content:**
- Congratulations message
- Montage preview
- Share links
- Personal clip highlight

### 4. Weekly Summary

**Triggers:** Weekly (Monday morning)  
**Recipients:** All active users  
**Channel:** Email

**Content:**
- New weekly montage announcement
- Platform stats
- Featured highlights
- Community updates

---

## Setup Checklist

### Slack Setup
- [ ] Create Slack app
- [ ] Generate webhook URL
- [ ] Add `SLACK_WEBHOOK_URL` to environment
- [ ] Test webhook with curl/Python
- [ ] Integrate into `tasks.py`
- [ ] Format message blocks
- [ ] Test with manual trigger
- [ ] Set up error handling

### Email Setup (Optional Phase 2)
- [ ] Choose email service (SendGrid/AWS SES)
- [ ] Create account and verify domain
- [ ] Get API key
- [ ] Add email config to environment
- [ ] Create email templates
- [ ] Set up featured user notifications
- [ ] Set up weekly digest
- [ ] Test deliverability

### Monitoring
- [ ] Set up error alerts for notification failures
- [ ] Log notification sends
- [ ] Track delivery rates
- [ ] Monitor webhook/API quotas

---

## Code Integration Points

### 1. Weekly Montage Completion

**File:** `backend/src/tasks.py`  
**Location:** After `compile_weekly_montage` returns (line ~848)  
**Also:** After `render_job` completes for weekly montage (check if `job_id` matches `WeeklyMontage.job_id`)

### 2. Featured User Detection

**File:** `backend/src/tasks.py`  
**Location:** When selecting clips (line ~780)  
**Action:** Track which users' jobs are selected, store in `featured_user_ids`

### 3. Error Notifications

**File:** `backend/src/tasks.py`  
**Location:** Exception handlers in `render_job` and `compile_weekly_montage`

---

## Example Implementation

### Simple Slack Notification Function

```python
# Add to backend/src/services/notifications.py (create new file)

import os
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def notify_slack(message: str, blocks: list = None):
    """Send notification to Slack webhook"""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.warning("SLACK_WEBHOOK_URL not set, skipping notification")
        return
    
    payload = {"text": message}
    if blocks:
        payload["blocks"] = blocks
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()
        logger.info("Slack notification sent successfully")
    except Exception as e:
        logger.error(f"Failed to send Slack notification: {str(e)}")


def notify_weekly_montage_complete(montage_data: Dict[str, Any]):
    """Notify that weekly montage has completed"""
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "🎬 Weekly Montage Complete"}
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Week:*\n{montage_data.get('week_start', 'N/A')}"},
                {"type": "mrkdwn", "text": f"*Clips:*\n{montage_data.get('clip_count', 0)}"},
                {"type": "mrkdwn", "text": f"*Duration:*\n{montage_data.get('duration', 0)}s"},
                {"type": "mrkdwn", "text": f"*Status:*\n✅ Success"}
            ]
        }
    ]
    
    if montage_data.get('view_url'):
        blocks.append({
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {"type": "plain_text", "text": "View Montage"},
                "url": montage_data['view_url']
            }]
        })
    
    notify_slack("Weekly montage compilation completed", blocks)
```

### Integration in tasks.py

```python
# At end of compile_weekly_montage function (after line 841)

from services.notifications import notify_weekly_montage_complete

# ... existing code ...

# After render_job.delay(job_id, target_duration)
notify_weekly_montage_complete({
    "week_start": week_start.isoformat(),
    "clip_count": len(selected_clips),
    "duration": target_duration,
    "job_id": job_id,
    "view_url": f"https://cosmiv.app/weekly-montages/{montage.id}"
})

return {...}
```

---

## Testing

### Test Slack Webhook

```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test notification from Cosmiv"}'
```

### Test in Development

1. Set `SLACK_WEBHOOK_URL` in `.env`
2. Manually trigger weekly montage: `POST /v2/weekly-montages/trigger`
3. Verify notification received in Slack
4. Check logs for any errors

---

## Cost Estimate

### Slack
- **Free:** Unlimited messages for standard workspace

### SendGrid Email
- **Free Tier:** 100 emails/day
- **Paid:** $15/month for 40,000 emails/month
- **For 1000 users:** ~$15/month

### AWS SES Email
- **Free Tier:** 62,000 emails/month (if on EC2)
- **Paid:** $0.10 per 1,000 emails
- **For 1000 users:** ~$0.10/month (very cheap)

---

## Recommendation

**Start with:** Slack webhooks for admin notifications  
**Add later:** Email notifications for users (via SendGrid or AWS SES)

**Priority:**
1. ✅ Slack webhook (1-2 hours) - Immediate value
2. ⚠️ Email service (4-6 hours) - User-facing value
3. 🔮 In-app notifications (future) - Enhanced UX

---

**Last Updated:** 2025-01-27  
**Implementation Status:** Recommendations only, not yet implemented

