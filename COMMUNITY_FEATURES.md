# 💬 Cosmiv Community Features

## Overview

Discord-like community system with servers, channels, chats, and profile linking for gaming/social platforms.

---

## 🏗️ Architecture

### Servers (Communities)

- **Public** - Anyone can join
- **Private** - Invite only
- **Unlisted** - Accessible via invite but not in discovery

### Channels

- **Text** - Chat messages
- **Voice** - Voice chat (future)
- **Video** - Video sharing channel
- **Announcements** - Important updates

### Messages

- Text messages
- Media attachments
- Video embeds
- Reactions
- Threads/replies
- Mentions

### Direct Messages

- 1-on-1 private chats
- Read receipts
- Media sharing

---

## 🔗 Profile Linking

### Supported Platforms

**Gaming:**

- Steam
- Xbox Live
- PlayStation Network
- Nintendo Switch

**Social:**

- Discord
- Twitch
- YouTube
- Twitter/X
- TikTok
- Instagram

**Features:**

- Profile verification
- Public/private toggle
- Custom display names
- Auto-sync (for verified accounts)

---

## 🎯 Roles & Permissions

### Server Roles

- **Owner** - Full control
- **Admin** - Manage server settings
- **Moderator** - Manage members & content
- **Member** - Standard access

### Permissions

- Manage channels
- Manage members
- Send messages
- Manage messages
- Voice/Video access
- Create invites

---

## 📱 Feed Integration

### Feed Types

1. **For You** - Algorithm-driven personalized feed
2. **Following** - Posts from followed creators
3. **Trending** - Top performing content
4. **New** - Latest posts
5. **Communities** - Posts from joined servers

### Algorithm Factors

- Engagement (likes, comments, shares)
- Watch time & completion rate
- Creator reputation
- Recency
- User preferences
- Community engagement

---

## 🎨 Black/White Aesthetic

### Design Principles

- Pure black (`#000000`) and white (`#FFFFFF`)
- High contrast
- Minimalist
- Premium feel
- Bold typography
- Clean lines

### UI Components

- Server list (left sidebar)
- Channel list
- Message area
- User list
- Profile cards
- Video feed

---

## 💾 Storage Limits

| Tier     | Storage | Uploads/Day | Profile Customization   |
| -------- | ------- | ----------- | ----------------------- |
| Free     | 5 GB    | 1 video     | Basic theme             |
| Pro      | 50 GB   | 10 videos   | Custom colors + effects |
| Creator+ | 500 GB  | Unlimited   | Full customization      |

---

## 🔄 Implementation Status

- ✅ Database models
- ⏳ API endpoints
- ⏳ Frontend components
- ⏳ Real-time messaging (WebSocket)
- ⏳ Feed algorithm
- ⏳ Profile linking UI
- ⏳ Server management
- ⏳ Black/white UI redesign
