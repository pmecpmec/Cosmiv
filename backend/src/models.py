from typing import Optional, Dict, Any, List
from sqlmodel import SQLModel, Field, JSON, Column
from datetime import datetime
from enum import Enum
import json


class JobStatus:
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    RETRYING = "RETRYING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default=JobStatus.PENDING)
    target_duration: int = Field(default=60)
    error: Optional[str] = None
    error_detail: Optional[str] = None  # JSON string with detailed error info
    stage: str = Field(default="queued")
    progress: Optional[str] = None  # JSON string with progress info
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    last_error_at: Optional[datetime] = None
    user_id: Optional[str] = Field(default=None, index=True)  # Track job owner
    style_id: Optional[str] = Field(default=None, index=True)  # Style used for this job
    processing_time_seconds: Optional[float] = None  # How long processing took


class Clip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    path: str
    original_name: str


class Render(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    output_path: str
    format: str = Field(default="landscape")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UploadedClip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    clip_id: str = Field(index=True, unique=True)
    storage_path: str
    storage_provider: str = Field(default="local")
    original_name: str
    content_type: Optional[str] = None
    size_bytes: int = Field(default=0)
    metadata_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    status: str = Field(default="uploaded")
    public_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# New Big Road models
class UserRole(str, Enum):
    """User role enumeration"""

    OWNER = "owner"
    ADMIN = "admin"
    USER = "user"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)  # external or generated id
    username: Optional[str] = Field(
        default=None, index=True, unique=True
    )  # unique username
    email: Optional[str] = Field(default=None, index=True, unique=True)
    password_hash: Optional[str] = None  # bcrypt hash
    role: UserRole = Field(default=UserRole.USER)  # owner, admin, user
    is_admin: bool = Field(default=False)  # Legacy field - kept for compatibility
    is_active: bool = Field(default=True)
    is_online: bool = Field(default=False)  # Online presence tracking
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Profile data
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    custom_url: Optional[str] = None  # Custom profile URL (e.g., /@username)
    theme_colors: Optional[str] = None  # JSON: {"primary": "#000", "accent": "#fff"}
    profile_effects: Optional[str] = None  # JSON: profile customization data

    # Storage limits (based on subscription)
    storage_used_mb: float = Field(default=0.0)
    storage_limit_mb: float = Field(default=5120.0)  # 5 GB default (Free tier)

    # Profile stats
    follower_count: int = Field(default=0)
    following_count: int = Field(default=0)
    posts_count: int = Field(default=0)
    total_views: int = Field(default=0)

    # Linked profiles (JSON)
    linked_profiles: Optional[str] = (
        None  # JSON: {"steam": "...", "discord": "...", "twitch": "...", etc.}
    )


class AuthProvider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # steam, xbox, playstation, switch


class UserAuth(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    provider: str = Field(index=True)
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    platform_user_id: Optional[str] = None
    platform_username: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DiscoveredClip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    provider: str = Field(index=True)
    external_id: str = Field(index=True)
    title: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)


class Entitlement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    plan: str = Field(default="free")  # free, pro, creator
    expires_at: Optional[datetime] = None


class WeeklyMontage(SQLModel, table=True):
    """Weekly automated montage compilation"""

    id: Optional[int] = Field(default=None, primary_key=True)
    week_start: datetime = Field(index=True)  # Start of week (Monday)
    job_id: Optional[str] = None  # Job that created this montage
    render_path_landscape: Optional[str] = None
    render_path_portrait: Optional[str] = None
    title: Optional[str] = None  # Auto-generated or admin-set
    featured_user_ids: Optional[str] = None  # JSON array of user_ids featured
    clip_count: int = Field(default=0)
    total_duration: float = Field(default=0.0)
    is_featured: bool = Field(default=False)  # Admin can feature
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SocialConnection(SQLModel, table=True):
    """User's social media platform connections (OAuth tokens)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    platform: str = Field(index=True)  # tiktok, youtube, instagram
    access_token: str  # OAuth access token
    refresh_token: Optional[str] = None  # OAuth refresh token
    token_expires_at: Optional[datetime] = None
    platform_user_id: Optional[str] = None  # User's ID on the platform
    platform_username: Optional[str] = None  # Username on platform
    is_active: bool = Field(default=True)
    auto_post: bool = Field(default=False)  # Auto-post completed jobs
    auto_post_weekly: bool = Field(
        default=False
    )  # Auto-post weekly montages (Creator+)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SocialPost(SQLModel, table=True):
    """Track social media posts"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    job_id: Optional[str] = Field(default=None, index=True)  # Associated job
    weekly_montage_id: Optional[int] = Field(
        default=None, index=True
    )  # Associated weekly montage
    platform: str = Field(index=True)  # tiktok, youtube, instagram
    platform_post_id: Optional[str] = None  # Post ID from platform
    video_url: Optional[str] = None  # URL of posted video
    caption: Optional[str] = None  # Caption used
    status: str = Field(default="pending")  # pending, posted, failed
    error: Optional[str] = None  # Error message if failed
    scheduled_at: Optional[datetime] = None  # When to post (for scheduling)
    posted_at: Optional[datetime] = None  # When actually posted
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Phase 11: Enhanced Analytics Models
class JobEngagement(SQLModel, table=True):
    """Track engagement metrics for completed jobs"""

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True, unique=True)  # One engagement record per job
    user_id: str = Field(index=True)

    # View metrics
    views: int = Field(default=0)  # Times job output was viewed/downloaded
    unique_viewers: int = Field(default=0)  # Unique users who viewed

    # Social engagement (aggregated from SocialPostEngagement)
    total_likes: int = Field(default=0)
    total_shares: int = Field(default=0)
    total_comments: int = Field(default=0)

    # Performance metrics
    avg_watch_time_seconds: Optional[float] = None  # Average watch time
    completion_rate: Optional[float] = None  # % watched to end
    click_through_rate: Optional[float] = None  # CTR if linked elsewhere

    # Style/technique tracking
    style_id: Optional[str] = Field(default=None, index=True)
    techniques_used: Optional[str] = None  # JSON array of techniques

    # Timestamps
    first_viewed_at: Optional[datetime] = None
    last_viewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SocialPostEngagement(SQLModel, table=True):
    """Track engagement metrics for social media posts"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(index=True)  # Foreign key to SocialPost.id
    job_id: Optional[str] = Field(default=None, index=True)  # Associated job
    platform: str = Field(index=True)

    # Platform-specific metrics
    views: int = Field(default=0)
    likes: int = Field(default=0)
    shares: int = Field(default=0)
    comments: int = Field(default=0)
    saves: int = Field(default=0)  # Instagram/Pinterest saves

    # TikTok-specific
    plays: int = Field(default=0)
    profile_visits: int = Field(default=0)

    # YouTube-specific
    watch_time_minutes: Optional[float] = None
    subscribers_gained: int = Field(default=0)

    # Calculated metrics
    engagement_rate: Optional[float] = None  # (likes + shares + comments) / views
    growth_rate: Optional[float] = None  # % increase in followers

    # Timestamps
    last_synced_at: Optional[datetime] = (
        None  # When metrics were last fetched from platform
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class StylePerformance(SQLModel, table=True):
    """Track which editing styles/techniques perform best"""

    id: Optional[int] = Field(default=None, primary_key=True)
    style_id: str = Field(index=True)
    style_name: str

    # Usage stats
    total_jobs: int = Field(default=0)  # How many jobs used this style
    successful_jobs: int = Field(default=0)
    avg_processing_time: Optional[float] = None

    # Engagement stats (aggregated from JobEngagement)
    total_views: int = Field(default=0)
    total_likes: int = Field(default=0)
    total_shares: int = Field(default=0)
    avg_engagement_rate: Optional[float] = None

    # Performance score (calculated)
    performance_score: Optional[float] = None  # 0-100 score based on engagement

    # Metadata
    techniques: Optional[str] = None  # JSON array of techniques used
    description: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserAnalytics(SQLModel, table=True):
    """User-level analytics aggregation"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)

    # Job stats
    total_jobs: int = Field(default=0)
    successful_jobs: int = Field(default=0)
    failed_jobs: int = Field(default=0)
    success_rate: Optional[float] = None

    # Engagement stats
    total_views: int = Field(default=0)
    total_likes: int = Field(default=0)
    total_shares: int = Field(default=0)
    avg_engagement_rate: Optional[float] = None

    # Social stats
    total_posts: int = Field(default=0)
    successful_posts: int = Field(default=0)

    # Performance
    best_performing_style: Optional[str] = None  # Style ID with highest engagement
    avg_processing_time: Optional[float] = None

    # Timestamps
    last_activity_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
