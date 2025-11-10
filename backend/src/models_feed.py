"""
Feed and Profile Models for Cosmiv
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class Post(SQLModel, table=True):
    """User-created video posts for the feed"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str = Field(index=True, unique=True)  # Public post ID
    user_id: str = Field(index=True)
    video_path: str
    thumbnail_path: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None  # JSON array of hashtags

    # Engagement metrics
    views: int = Field(default=0)
    likes: int = Field(default=0)
    shares: int = Field(default=0)
    comments: int = Field(default=0)
    watch_time_seconds: float = Field(default=0.0)
    completion_rate: float = Field(default=0.0)  # Average completion %

    # Algorithm signals
    engagement_score: float = Field(default=0.0)
    recency_score: float = Field(default=0.0)
    trending_score: float = Field(default=0.0)

    # Status
    is_published: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    is_verified: bool = Field(default=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Follow(SQLModel, table=True):
    """User follow relationships"""

    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: str = Field(index=True)
    following_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PostLike(SQLModel, table=True):
    """Track which users liked which posts"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str = Field(index=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PostComment(SQLModel, table=True):
    """Comments on posts"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str = Field(index=True)
    user_id: str = Field(index=True)
    content: str
    parent_comment_id: Optional[int] = None  # For replies
    likes: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FeedAlgorithm(SQLModel, table=True):
    """Algorithm preferences and state per user"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)
    preferences: Optional[str] = None  # JSON: preferred content types, creators, etc.
    engagement_history: Optional[str] = None  # JSON: what user has interacted with
    last_refresh: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FeedCache(SQLModel, table=True):
    """Cached feed data for faster loading"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    feed_type: str = Field(index=True)  # "for_you", "following", "trending", "new"
    post_ids: str  # JSON array of post IDs in order
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime  # Cache expires after 5 minutes
