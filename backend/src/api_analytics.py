"""
Enhanced Analytics API endpoints
Engagement tracking, performance metrics, AI learning insights
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from datetime import datetime, timedelta
from sqlmodel import select, func
from db import get_session
from models import (
    Job, JobEngagement, SocialPostEngagement, SocialPost,
    StylePerformance, UserAnalytics, JobStatus, User
)
from auth import get_current_user
from services.analytics import (
    track_job_view, update_social_engagement, get_top_styles,
    get_time_series_metrics, update_user_analytics
)

router = APIRouter(prefix="/v2/analytics", tags=["analytics"])


@router.post("/track-view/{job_id}")
async def track_view(
    job_id: str,
    current_user: Optional[User] = Depends(get_current_user),
):
    """Track a view/download of a job output"""
    try:
        track_job_view(job_id, current_user.user_id if current_user else None)
        return {"success": True, "message": "View tracked"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/social/{post_id}/update")
async def update_social_metrics(
    post_id: int,
    platform: str = Query(...),
    views: Optional[int] = Query(None),
    likes: Optional[int] = Query(None),
    shares: Optional[int] = Query(None),
    comments: Optional[int] = Query(None),
    saves: Optional[int] = Query(None),
    plays: Optional[int] = Query(None),
    watch_time_minutes: Optional[float] = Query(None),
    subscribers_gained: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
):
    """Update engagement metrics for a social media post"""
    metrics = {}
    if views is not None:
        metrics["views"] = views
    if likes is not None:
        metrics["likes"] = likes
    if shares is not None:
        metrics["shares"] = shares
    if comments is not None:
        metrics["comments"] = comments
    if saves is not None:
        metrics["saves"] = saves
    if plays is not None:
        metrics["plays"] = plays
    if watch_time_minutes is not None:
        metrics["watch_time_minutes"] = watch_time_minutes
    if subscribers_gained is not None:
        metrics["subscribers_gained"] = subscribers_gained
    
    update_social_engagement(post_id, platform, metrics)
    return {"success": True, "message": "Metrics updated"}


@router.get("/jobs/{job_id}/engagement")
async def get_job_engagement(
    job_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get engagement metrics for a specific job"""
    with get_session() as session:
        # Verify job ownership
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return {"error": "Job not found"}
        
        if job.user_id and job.user_id != current_user.user_id and not current_user.is_admin:
            return {"error": "Unauthorized"}
        
        engagement = session.exec(
            select(JobEngagement).where(JobEngagement.job_id == job_id)
        ).first()
        
        if not engagement:
            return {
                "job_id": job_id,
                "views": 0,
                "likes": 0,
                "shares": 0,
                "comments": 0,
            }
        
        # Get social posts for this job
        posts = session.exec(
            select(SocialPost).where(SocialPost.job_id == job_id)
        ).all()
        
        post_engagements = []
        for post in posts:
            post_eng = session.exec(
                select(SocialPostEngagement).where(SocialPostEngagement.post_id == post.id)
            ).first()
            if post_eng:
                post_engagements.append({
                    "platform": post.platform,
                    "views": post_eng.views,
                    "likes": post_eng.likes,
                    "shares": post_eng.shares,
                    "comments": post_eng.comments,
                    "engagement_rate": post_eng.engagement_rate,
                })
        
        return {
            "job_id": job_id,
            "views": engagement.views,
            "unique_viewers": engagement.unique_viewers,
            "total_likes": engagement.total_likes,
            "total_shares": engagement.total_shares,
            "total_comments": engagement.total_comments,
            "avg_watch_time": engagement.avg_watch_time_seconds,
            "completion_rate": engagement.completion_rate,
            "style_id": engagement.style_id,
            "first_viewed_at": engagement.first_viewed_at.isoformat() if engagement.first_viewed_at else None,
            "last_viewed_at": engagement.last_viewed_at.isoformat() if engagement.last_viewed_at else None,
            "social_posts": post_engagements,
        }


@router.get("/user/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
):
    """Get aggregated analytics for the current user"""
    with get_session() as session:
        user_analytics = session.exec(
            select(UserAnalytics).where(UserAnalytics.user_id == current_user.user_id)
        ).first()
        
        if not user_analytics:
            # Create if doesn't exist
            update_user_analytics(current_user.user_id)
            user_analytics = session.exec(
                select(UserAnalytics).where(UserAnalytics.user_id == current_user.user_id)
            ).first()
        
        return {
            "user_id": current_user.user_id,
            "jobs": {
                "total": user_analytics.total_jobs,
                "successful": user_analytics.successful_jobs,
                "failed": user_analytics.failed_jobs,
                "success_rate": user_analytics.success_rate,
                "avg_processing_time": user_analytics.avg_processing_time,
            },
            "engagement": {
                "total_views": user_analytics.total_views,
                "total_likes": user_analytics.total_likes,
                "total_shares": user_analytics.total_shares,
                "avg_engagement_rate": user_analytics.avg_engagement_rate,
            },
            "social": {
                "total_posts": user_analytics.total_posts,
                "successful_posts": user_analytics.successful_posts,
            },
            "insights": {
                "best_performing_style": user_analytics.best_performing_style,
            },
            "last_activity": user_analytics.last_activity_at.isoformat() if user_analytics.last_activity_at else None,
        }


@router.get("/styles/top")
async def get_top_performing_styles(
    limit: int = Query(10, le=50),
):
    """Get top performing styles by engagement and success rate"""
    styles = get_top_styles(limit)
    return {
        "styles": styles,
        "count": len(styles),
    }


@router.get("/styles/{style_id}")
async def get_style_performance(
    style_id: str,
    current_user: Optional[User] = Depends(get_current_user),
):
    """Get detailed performance metrics for a specific style"""
    with get_session() as session:
        style = session.exec(
            select(StylePerformance).where(StylePerformance.style_id == style_id)
        ).first()
        
        if not style:
            return {"error": "Style not found"}
        
        return {
            "style_id": style.style_id,
            "style_name": style.style_name,
            "usage": {
                "total_jobs": style.total_jobs,
                "successful_jobs": style.successful_jobs,
                "success_rate": (style.successful_jobs / style.total_jobs * 100) if style.total_jobs > 0 else 0,
            },
            "performance": {
                "total_views": style.total_views,
                "total_likes": style.total_likes,
                "total_shares": style.total_shares,
                "avg_engagement_rate": style.avg_engagement_rate,
                "performance_score": style.performance_score,
            },
            "processing": {
                "avg_processing_time": style.avg_processing_time,
            },
            "updated_at": style.updated_at.isoformat(),
        }


@router.get("/time-series")
async def get_time_series(
    days: int = Query(7, le=90),
    metric: str = Query("jobs", regex="^(jobs|engagement)$"),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Get time-series metrics for charts"""
    data = get_time_series_metrics(days, metric)
    return {
        "metric": metric,
        "days": days,
        "data": data,
    }


@router.get("/recommendations/style")
async def get_style_recommendation(
    current_user: User = Depends(get_current_user),
):
    """AI recommendation: Get best style for user based on their performance"""
    with get_session() as session:
        # Get user analytics
        user_analytics = session.exec(
            select(UserAnalytics).where(UserAnalytics.user_id == current_user.user_id)
        ).first()
        
        if not user_analytics or not user_analytics.best_performing_style:
            # Fallback to top overall style
            top_styles = get_top_styles(1)
            if top_styles:
                return {
                    "recommended_style": top_styles[0]["style_id"],
                    "reason": "Based on platform-wide performance",
                    "confidence": 0.7,
                }
            return {"recommended_style": None, "reason": "No data available"}
        
        # Get user's best performing style details
        style = session.exec(
            select(StylePerformance).where(
                StylePerformance.style_id == user_analytics.best_performing_style
            )
        ).first()
        
        if style:
            return {
                "recommended_style": style.style_id,
                "reason": f"Your best performing style (avg {style.avg_engagement_rate:.1f}% engagement)",
                "confidence": 0.9,
                "performance_score": style.performance_score,
            }
        
        return {
            "recommended_style": user_analytics.best_performing_style,
            "reason": "Based on your historical performance",
            "confidence": 0.8,
        }

