# 🎬 Cosmiv Feed & Profiles System

## Overview

TikTok/Medal/YouTube-style feed with algorithm, user profiles, video posts, and subscription-based features.

---

## 🎭 Role System

### Roles

1. **Owner** (`pmec`)
   - Full platform access
   - Can manage admins
   - Platform settings
   - Revenue access

2. **Admin**
   - User management
   - Content moderation
   - Analytics access
   - Can help users in chat

3. **User**
   - Standard platform access
   - Profile customization (based on tier)
   - Video posting
   - Feed browsing

### Permissions Model

```python
class UserRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    USER = "user"

class User(SQLModel, table=True):
    role: UserRole = Field(default=UserRole.USER)
    is_online: bool = Field(default=False)  # Presence tracking
    last_seen: datetime = Field(default_factory=datetime.utcnow)
```

---

## 📱 Feed System

### Algorithm Components

1. **Engagement Score**
   - Views
   - Likes
   - Shares
   - Comments
   - Watch time
   - Completion rate

2. **Recency Weight**
   - Recent posts get boost
   - Decay over time

3. **Creator Reputation**
   - Verified status
   - Follower count
   - Previous performance
   - Subscriber tier

4. **Content Signals**
   - Video quality
   - Style performance
   - Trending topics
   - User preferences

### Feed Types

- **For You** - Algorithm-driven personalized feed
- **Following** - Posts from followed creators
- **Trending** - Top performing content
- **New** - Latest posts

---

## 👤 User Profiles

### Profile Features

- **Public Profile**
  - Profile picture
  - Bio
  - Banner image
  - Video gallery
  - Follower/following counts
  - Stats (views, likes, etc.)

- **Customization** (Subscription-based)
  - Custom colors
  - Animated backgrounds
  - Badge display
  - Profile effects
  - Custom URL
  - Advanced analytics

---

## 💾 Storage Limits

### Subscription Tiers

| Tier | Storage | Video Upload Limit | Profile Customization |
|------|---------|-------------------|----------------------|
| Free | 5 GB | 1 video/day | Basic (black/white theme) |
| Pro | 50 GB | 10 videos/day | Custom colors + effects |
| Creator+ | 500 GB | Unlimited | Full customization + animated backgrounds |

---

## 🎨 Black/White Aesthetic

### Design System

- **Color Palette**
  - Pure black: `#000000`
  - Pure white: `#FFFFFF`
  - Gray scale: `#1a1a1a`, `#2a2a2a`, `#3a3a3a`
  - Accents: Subtle gradients when needed

- **Typography**
  - Modern sans-serif
  - Bold headlines
  - Clean, minimal

- **UI Elements**
  - High contrast
  - Sharp edges
  - Minimal shadows
  - Clean lines
  - Expensive, premium feel

### Inspiration
Tyler the Creator's "IGOR" / "CALL ME IF YOU GET LOST" album aesthetics
- Minimalist
- High contrast
- Bold typography
- Clean layouts
- Premium feel

---

## 📊 Database Schema

### New Models Needed

```python
class Post(SQLModel, table=True):
    """User-created video posts for feed"""
    id: Optional[int] = Field(primary_key=True)
    user_id: str
    video_path: str
    thumbnail_path: Optional[str]
    caption: Optional[str]
    created_at: datetime
    views: int
    likes: int
    shares: int
    comments: int
    
class Follow(SQLModel, table=True):
    """User follow relationships"""
    follower_id: str
    following_id: str
    
class UserProfile(SQLModel, table=True):
    """Extended user profile data"""
    user_id: str
    bio: Optional[str]
    avatar_url: Optional[str]
    banner_url: Optional[str]
    custom_url: Optional[str]
    theme_colors: Optional[str]  # JSON
    profile_effects: Optional[str]  # JSON
    
class FeedAlgorithm(SQLModel, table=True):
    """Algorithm state for feed"""
    user_id: str
    preferences: str  # JSON
    last_refresh: datetime
```

---

## 🔄 Implementation Plan

1. ✅ Role system with permissions
2. ✅ Online presence tracking
3. ✅ Chat routing (admin vs AI)
4. ⏳ Feed algorithm implementation
5. ⏳ User profiles UI
6. ⏳ Video posting system
7. ⏳ Storage limits enforcement
8. ⏳ Profile customization system
9. ⏳ UI redesign (black/white)

