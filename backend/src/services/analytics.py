"""
Analytics and engagement tracking service
Handles metrics collection, aggregation, and AI learning
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from sqlmodel import select, func
from db import get_session
from security import sanitize_log_message
from models import (
    Job,
    JobEngagement,
    SocialPostEngagement,
    SocialPost,
    StylePerformance,
    UserAnalytics,
    JobStatus,
)

logger = logging.getLogger(__name__)


def track_job_view(job_id: str, user_id: Optional[str] = None) -> None:
    """Track a view/download of a job output"""
    with get_session() as session:
        engagement = session.exec(
            select(JobEngagement).where(JobEngagement.job_id == job_id)
        ).first()

        if not engagement:
            # Get job details
            job = session.exec(select(Job).where(Job.job_id == job_id)).first()
            if not job:
                safe_job_id = sanitize_log_message(str(job_id))
                logger.warning(f"Job {safe_job_id} not found for engagement tracking")
                return

            # Create engagement record
            engagement = JobEngagement(
                job_id=job_id,
                user_id=job.user_id or "anonymous",
                views=1,
                unique_viewers=1,
                first_viewed_at=datetime.utcnow(),
                last_viewed_at=datetime.utcnow(),
            )
            if job.style_id:
                engagement.style_id = job.style_id
            session.add(engagement)
        else:
            # Update existing
            engagement.views += 1
            engagement.last_viewed_at = datetime.utcnow()
            # Note: unique_viewers would require tracking viewer IDs (simplified here)

        session.commit()
        safe_job_id = sanitize_log_message(str(job_id))
        logger.debug(f"Tracked view for job {safe_job_id}")


def update_social_engagement(
    post_id: int, platform: str, metrics: Dict[str, Any]
) -> None:
    """Update engagement metrics for a social media post"""
    with get_session() as session:
        engagement = session.exec(
            select(SocialPostEngagement).where(SocialPostEngagement.post_id == post_id)
        ).first()

        if not engagement:
            # Get post details
            post = session.exec(
                select(SocialPost).where(SocialPost.id == post_id)
            ).first()
            if not post:
                safe_post_id = sanitize_log_message(str(post_id))
                logger.warning(f"Post {safe_post_id} not found")
                return

            engagement = SocialPostEngagement(
                post_id=post_id,
                job_id=post.job_id,
                platform=platform,
            )
            session.add(engagement)

        # Update metrics
        if "views" in metrics:
            engagement.views = metrics["views"]
        if "likes" in metrics:
            engagement.likes = metrics["likes"]
        if "shares" in metrics:
            engagement.shares = metrics["shares"]
        if "comments" in metrics:
            engagement.comments = metrics["comments"]
        if "saves" in metrics:
            engagement.saves = metrics["saves"]
        if "plays" in metrics:
            engagement.plays = metrics["plays"]
        if "watch_time_minutes" in metrics:
            engagement.watch_time_minutes = metrics["watch_time_minutes"]
        if "subscribers_gained" in metrics:
            engagement.subscribers_gained = metrics["subscribers_gained"]

        # Calculate engagement rate
        if engagement.views > 0:
            engagement.engagement_rate = (
                (engagement.likes + engagement.shares + engagement.comments)
                / engagement.views
            ) * 100

        engagement.last_synced_at = datetime.utcnow()
        engagement.updated_at = datetime.utcnow()
        session.commit()

        # Update parent job engagement
        if engagement.job_id:
            update_job_engagement_from_social(engagement.job_id)

        safe_post_id = sanitize_log_message(str(post_id))
        logger.debug(f"Updated engagement for post {safe_post_id}")


def update_job_engagement_from_social(job_id: str) -> None:
    """Aggregate social engagement metrics back to job"""
    with get_session() as session:
        job_engagement = session.exec(
            select(JobEngagement).where(JobEngagement.job_id == job_id)
        ).first()

        if not job_engagement:
            return

        # Get all social posts for this job
        posts = session.exec(
            select(SocialPost).where(SocialPost.job_id == job_id)
        ).all()

        post_ids = [p.id for p in posts]
        if not post_ids:
            return

        # Sum engagement from all posts
        social_engagements = session.exec(
            select(SocialPostEngagement).where(
                SocialPostEngagement.post_id.in_(post_ids)
            )
        ).all()

        total_likes = sum(e.likes for e in social_engagements)
        total_shares = sum(e.shares for e in social_engagements)
        total_comments = sum(e.comments for e in social_engagements)

        job_engagement.total_likes = total_likes
        job_engagement.total_shares = total_shares
        job_engagement.total_comments = total_comments
        job_engagement.updated_at = datetime.utcnow()

        session.commit()


def update_style_performance(style_id: str, job_id: str) -> None:
    """Update performance metrics for a style based on job results"""
    with get_session() as session:
        # Get job and engagement
        job = session.exec(select(Job).where(Job.job_id == job_id)).first()
        if not job:
            return

        engagement = session.exec(
            select(JobEngagement).where(JobEngagement.job_id == job_id)
        ).first()

        # Get or create style performance
        style_perf = session.exec(
            select(StylePerformance).where(StylePerformance.style_id == style_id)
        ).first()

        if not style_perf:
            style_perf = StylePerformance(
                style_id=style_id,
                style_name=style_id,  # Default, should be set from style metadata
                total_jobs=0,
                successful_jobs=0,
                total_views=0,
                total_likes=0,
                total_shares=0,
            )
            session.add(style_perf)

        # Update usage stats
        style_perf.total_jobs += 1
        if job.status == JobStatus.SUCCESS:
            style_perf.successful_jobs += 1

        # Update processing time average
        if job.processing_time_seconds:
            if style_perf.avg_processing_time:
                # Running average
                style_perf.avg_processing_time = (
                    style_perf.avg_processing_time * (style_perf.total_jobs - 1)
                    + job.processing_time_seconds
                ) / style_perf.total_jobs
            else:
                style_perf.avg_processing_time = job.processing_time_seconds

        # Update engagement stats if available
        if engagement:
            style_perf.total_views += engagement.views
            style_perf.total_likes += engagement.total_likes
            style_perf.total_shares += engagement.total_shares

            # Calculate average engagement rate
            if style_perf.total_jobs > 0 and style_perf.total_views > 0:
                style_perf.avg_engagement_rate = (
                    (style_perf.total_likes + style_perf.total_shares)
                    / style_perf.total_views
                ) * 100

        # Calculate performance score (0-100)
        # Score = weighted combination of success rate, engagement rate, and processing speed
        success_rate = (
            (style_perf.successful_jobs / style_perf.total_jobs * 100)
            if style_perf.total_jobs > 0
            else 0
        )
        engagement_score = style_perf.avg_engagement_rate or 0

        # Processing speed score (inverse - faster is better, normalized to 0-100)
        # Assuming avg processing time < 600s is excellent (100), > 1800s is poor (0)
        if style_perf.avg_processing_time:
            if style_perf.avg_processing_time <= 600:
                speed_score = 100
            elif style_perf.avg_processing_time >= 1800:
                speed_score = 0
            else:
                speed_score = 100 - ((style_perf.avg_processing_time - 600) / 12)
        else:
            speed_score = 50  # Default if unknown

        style_perf.performance_score = (
            success_rate * 0.4  # 40% weight on success rate
            + engagement_score * 0.4  # 40% weight on engagement
            + speed_score * 0.2  # 20% weight on processing speed
        )

        style_perf.updated_at = datetime.utcnow()
        session.commit()

        safe_style_id = sanitize_log_message(str(style_id))
        logger.debug(f"Updated style performance for {safe_style_id}")


def update_user_analytics(user_id: str) -> None:
    """Update aggregated analytics for a user"""
    with get_session() as session:
        user_analytics = session.exec(
            select(UserAnalytics).where(UserAnalytics.user_id == user_id)
        ).first()

        if not user_analytics:
            user_analytics = UserAnalytics(user_id=user_id)
            session.add(user_analytics)

        # Get job stats
        jobs = session.exec(select(Job).where(Job.user_id == user_id)).all()

        user_analytics.total_jobs = len(jobs)
        user_analytics.successful_jobs = sum(
            1 for j in jobs if j.status == JobStatus.SUCCESS
        )
        user_analytics.failed_jobs = sum(
            1 for j in jobs if j.status == JobStatus.FAILED
        )

        if user_analytics.total_jobs > 0:
            user_analytics.success_rate = (
                user_analytics.successful_jobs / user_analytics.total_jobs * 100
            )

        # Calculate avg processing time
        processing_times = [
            j.processing_time_seconds for j in jobs if j.processing_time_seconds
        ]
        if processing_times:
            user_analytics.avg_processing_time = sum(processing_times) / len(
                processing_times
            )

        # Get engagement stats
        job_ids = [j.job_id for j in jobs]
        if job_ids:
            engagements = session.exec(
                select(JobEngagement).where(JobEngagement.job_id.in_(job_ids))
            ).all()

            user_analytics.total_views = sum(e.views for e in engagements)
            user_analytics.total_likes = sum(e.total_likes for e in engagements)
            user_analytics.total_shares = sum(e.total_shares for e in engagements)

            if user_analytics.total_views > 0:
                user_analytics.avg_engagement_rate = (
                    (user_analytics.total_likes + user_analytics.total_shares)
                    / user_analytics.total_views
                ) * 100

        # Find best performing style
        if engagements:
            style_scores = {}
            for e in engagements:
                if e.style_id:
                    if e.style_id not in style_scores:
                        style_scores[e.style_id] = 0
                    style_scores[e.style_id] += e.total_likes + e.total_shares + e.views

            if style_scores:
                user_analytics.best_performing_style = max(
                    style_scores, key=style_scores.get
                )

        # Get social post stats
        posts = session.exec(
            select(SocialPost).where(SocialPost.user_id == user_id)
        ).all()
        user_analytics.total_posts = len(posts)
        user_analytics.successful_posts = sum(1 for p in posts if p.status == "posted")

        # Update last activity
        if jobs:
            latest_job = max(jobs, key=lambda j: j.created_at)
            user_analytics.last_activity_at = latest_job.created_at

        user_analytics.updated_at = datetime.utcnow()
        session.commit()

        safe_user_id = sanitize_log_message(str(user_id))
        logger.debug(f"Updated analytics for user {safe_user_id}")


def get_top_styles(limit: int = 10) -> List[Dict[str, Any]]:
    """Get top performing styles by engagement"""
    with get_session() as session:
        styles = session.exec(
            select(StylePerformance)
            .where(StylePerformance.total_jobs > 0)
            .order_by(StylePerformance.performance_score.desc())
            .limit(limit)
        ).all()

        return [
            {
                "style_id": s.style_id,
                "style_name": s.style_name,
                "total_jobs": s.total_jobs,
                "success_rate": (
                    (s.successful_jobs / s.total_jobs * 100) if s.total_jobs > 0 else 0
                ),
                "avg_engagement_rate": s.avg_engagement_rate,
                "performance_score": s.performance_score,
                "avg_processing_time": s.avg_processing_time,
            }
            for s in styles
        ]


def get_time_series_metrics(
    days: int = 7, metric: str = "jobs"
) -> List[Dict[str, Any]]:
    """Get time-series metrics for analytics charts"""
    with get_session() as session:
        start_date = datetime.utcnow() - timedelta(days=days)

        if metric == "jobs":
            # Group jobs by date
            jobs = session.exec(select(Job).where(Job.created_at >= start_date)).all()

            # Group by date
            daily_stats = {}
            for job in jobs:
                date_key = job.created_at.date().isoformat()
                if date_key not in daily_stats:
                    daily_stats[date_key] = {"date": date_key, "count": 0, "success": 0}
                daily_stats[date_key]["count"] += 1
                if job.status == JobStatus.SUCCESS:
                    daily_stats[date_key]["success"] += 1

            return sorted(
                [daily_stats[k] for k in daily_stats], key=lambda x: x["date"]
            )

        elif metric == "engagement":
            # Group engagement by date
            engagements = session.exec(
                select(JobEngagement).where(JobEngagement.created_at >= start_date)
            ).all()

            daily_stats = {}
            for e in engagements:
                date_key = e.created_at.date().isoformat()
                if date_key not in daily_stats:
                    daily_stats[date_key] = {
                        "date": date_key,
                        "views": 0,
                        "likes": 0,
                        "shares": 0,
                    }
                daily_stats[date_key]["views"] += e.views
                daily_stats[date_key]["likes"] += e.total_likes
                daily_stats[date_key]["shares"] += e.total_shares

            return sorted(
                [daily_stats[k] for k in daily_stats], key=lambda x: x["date"]
            )

        return []
