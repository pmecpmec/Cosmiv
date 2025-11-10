"""
Community Models: Servers, Channels, Chats, Messages
Discord-like community system for Cosmiv
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field


class ServerType(str, Enum):
    """Server types"""

    PUBLIC = "public"
    PRIVATE = "private"
    UNLISTED = "unlisted"  # Accessible via invite only


class ChannelType(str, Enum):
    """Channel types within a server"""

    TEXT = "text"
    VOICE = "voice"
    VIDEO = "video"  # For sharing videos
    ANNOUNCEMENTS = "announcements"


class Server(SQLModel, table=True):
    """Community server (like Discord server)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    server_id: str = Field(index=True, unique=True)  # Public server ID
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None

    owner_id: str = Field(index=True)  # User who created the server
    server_type: ServerType = Field(default=ServerType.PUBLIC)

    # Settings
    invite_code: Optional[str] = Field(default=None, unique=True)  # Unique invite code
    max_members: Optional[int] = None  # None = unlimited
    is_verified: bool = Field(default=False)  # Verified community

    # Stats
    member_count: int = Field(default=0)
    channel_count: int = Field(default=0)
    message_count: int = Field(default=0)

    # Tags/categories
    tags: Optional[str] = None  # JSON array of tags

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Channel(SQLModel, table=True):
    """Channel within a server"""

    id: Optional[int] = Field(default=None, primary_key=True)
    channel_id: str = Field(index=True, unique=True)
    server_id: str = Field(index=True)
    name: str
    description: Optional[str] = None
    channel_type: ChannelType = Field(default=ChannelType.TEXT)

    # Permissions (JSON)
    permissions: Optional[str] = None  # JSON: permission rules

    # Position for ordering
    position: int = Field(default=0)

    # Settings
    is_nsfw: bool = Field(default=False)
    slowmode_seconds: int = Field(default=0)  # Rate limiting

    # Stats
    message_count: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ServerMember(SQLModel, table=True):
    """User membership in a server"""

    id: Optional[int] = Field(default=None, primary_key=True)
    server_id: str = Field(index=True)
    user_id: str = Field(index=True)

    # Role in server
    role: str = Field(default="member")  # owner, admin, moderator, member

    # Permissions (JSON override)
    permissions: Optional[str] = None

    # Stats
    message_count: int = Field(default=0)
    last_active: datetime = Field(default_factory=datetime.utcnow)

    # Status
    is_muted: bool = Field(default=False)
    is_banned: bool = Field(default=False)

    joined_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """Message in a channel"""

    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: str = Field(index=True, unique=True)
    channel_id: str = Field(index=True)
    server_id: Optional[str] = Field(default=None, index=True)  # For server messages
    user_id: str = Field(index=True)

    content: str
    is_edited: bool = Field(default=False)
    edited_at: Optional[datetime] = None

    # Media attachments
    attachments: Optional[str] = None  # JSON array of attachment URLs
    video_id: Optional[str] = None  # If message contains a video post

    # Reactions (JSON)
    reactions: Optional[str] = None  # JSON: {"emoji": [user_ids]}

    # Thread/reply
    thread_id: Optional[str] = None  # If this starts a thread
    reply_to_id: Optional[str] = None  # If replying to another message

    # Mentions
    mentions: Optional[str] = None  # JSON array of mentioned user IDs

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DirectMessage(SQLModel, table=True):
    """Direct message between two users"""

    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: str = Field(index=True, unique=True)
    sender_id: str = Field(index=True)
    recipient_id: str = Field(index=True)

    content: str
    is_edited: bool = Field(default=False)
    edited_at: Optional[datetime] = None

    # Media
    attachments: Optional[str] = None
    video_id: Optional[str] = None

    # Read status
    is_read: bool = Field(default=False)
    read_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)


class ServerInvite(SQLModel, table=True):
    """Server invite codes"""

    id: Optional[int] = Field(default=None, primary_key=True)
    invite_code: str = Field(index=True, unique=True)
    server_id: str = Field(index=True)
    created_by: str = Field(index=True)

    # Usage limits
    max_uses: Optional[int] = None  # None = unlimited
    uses_count: int = Field(default=0)
    expires_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)


# Feed models (from previous work)
class Post(SQLModel, table=True):
    """User-created video posts for the feed"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str = Field(index=True, unique=True)
    user_id: str = Field(index=True)
    video_path: str
    thumbnail_path: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[str] = None  # JSON array

    # Engagement
    views: int = Field(default=0)
    likes: int = Field(default=0)
    shares: int = Field(default=0)
    comments: int = Field(default=0)
    watch_time_seconds: float = Field(default=0.0)
    completion_rate: float = Field(default=0.0)

    # Algorithm scores
    engagement_score: float = Field(default=0.0)
    recency_score: float = Field(default=0.0)
    trending_score: float = Field(default=0.0)

    # Status
    is_published: bool = Field(default=True)
    is_featured: bool = Field(default=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Follow(SQLModel, table=True):
    """User follow relationships"""

    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: str = Field(index=True)
    following_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PostLike(SQLModel, table=True):
    """Post likes tracking"""

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str = Field(index=True)
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FeedAlgorithm(SQLModel, table=True):
    """Feed algorithm state per user (for personalization)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, unique=True)
    preferences: Optional[str] = None  # JSON: user preferences
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class FeedCache(SQLModel, table=True):
    """Cached feed results"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    feed_type: str = Field(index=True)  # for-you, following, etc.
    post_ids: str  # JSON array of post IDs
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(index=True)


class LinkedProfile(SQLModel, table=True):
    """External profile links (gaming and social)"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    profile_type: str = Field(index=True)  # steam, discord, twitch, youtube, twitter, tiktok, instagram, etc.
    profile_username: Optional[str] = None
    profile_url: Optional[str] = None
    profile_id: Optional[str] = None  # External platform ID

    # Verification
    is_verified: bool = Field(default=False)
    verification_token: Optional[str] = None

    # Display
    display_name: Optional[str] = None
    is_public: bool = Field(default=True)  # Show on profile

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
