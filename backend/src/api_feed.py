"""
Feed API Endpoints
TikTok/Medal/YouTube-style feed with algorithm
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from db import get_session
from sqlmodel import select
from models_community import Post, Follow, PostLike
from models import User
from auth import get_current_user, get_current_user_optional
from services.feed_algorithm import FeedAlgorithmService
from storage import new_job_id
import secrets
import json
from datetime import datetime

router = APIRouter(prefix="/v2/feed", tags=["feed"])


class PostCreateRequest(BaseModel):
    video_path: str
    thumbnail_path: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None


@router.get("/for-you")
async def get_for_you_feed(
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Get personalized "For You" feed (algorithm-driven).
    """
    user_id = current_user.user_id if current_user else "anonymous"
    posts = FeedAlgorithmService.get_for_you_feed(user_id, limit)
    return {"posts": posts, "feed_type": "for_you", "count": len(posts)}


@router.get("/following")
async def get_following_feed(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """
    Get feed from users you follow.
    """
    posts = FeedAlgorithmService.get_following_feed(current_user.user_id, limit)
    return {"posts": posts, "feed_type": "following", "count": len(posts)}


@router.get("/trending")
async def get_trending_feed(
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get trending posts.
    """
    posts = FeedAlgorithmService.get_trending_feed(limit)
    return {"posts": posts, "feed_type": "trending", "count": len(posts)}


@router.get("/new")
async def get_new_feed(
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get latest posts (chronological).
    """
    posts = FeedAlgorithmService.get_new_feed(limit)
    return {"posts": posts, "feed_type": "new", "count": len(posts)}


@router.post("/posts")
async def create_post(
    request: PostCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new post from a video.
    Video should be uploaded first via /api/v2/jobs, then post created with the output.
    """
    with get_session() as session:
        # Generate post ID
        post_id = f"post_{secrets.token_urlsafe(12)}"

        # Create post
        post = Post(
            post_id=post_id,
            user_id=current_user.user_id,
            video_path=request.video_path,
            thumbnail_path=request.thumbnail_path,
            caption=request.caption,
            hashtags=json.dumps(request.hashtags) if request.hashtags else None,
            is_published=True,
        )

        session.add(post)

        # Update user post count
        current_user.posts_count += 1
        session.add(current_user)

        session.commit()
        session.refresh(post)

        # Calculate initial scores
        FeedAlgorithmService.update_post_scores(post.post_id)

        return {
            "post_id": post.post_id,
            "message": "Post created successfully",
        }


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
):
    """Like or unlike a post"""
    with get_session() as session:
        # Check if already liked
        existing_like = session.exec(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.user_id)
        ).first()

        post = session.exec(select(Post).where(Post.post_id == post_id)).first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if existing_like:
            # Unlike
            session.delete(existing_like)
            post.likes = max(0, post.likes - 1)
            liked = False
        else:
            # Like
            like = PostLike(
                post_id=post_id,
                user_id=current_user.user_id,
            )
            session.add(like)
            post.likes += 1
            liked = True

        session.add(post)
        session.commit()

        # Update scores
        FeedAlgorithmService.update_post_scores(post_id)

        return {"liked": liked, "likes": post.likes}


@router.post("/posts/{post_id}/view")
async def track_view(
    post_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Track a post view"""
    with get_session() as session:
        post = session.exec(select(Post).where(Post.post_id == post_id)).first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        post.views += 1
        session.add(post)
        session.commit()

        # Update scores periodically (not on every view)
        if post.views % 10 == 0:
            FeedAlgorithmService.update_post_scores(post_id)

        return {"views": post.views}


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    """Follow a user"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    with get_session() as session:
        # Check if already following
        existing = session.exec(
            select(Follow).where(Follow.follower_id == current_user.user_id, Follow.following_id == user_id)
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Already following")

        # Create follow relationship
        follow = Follow(
            follower_id=current_user.user_id,
            following_id=user_id,
        )
        session.add(follow)

        # Update counts
        current_user.following_count += 1
        target_user = session.exec(select(User).where(User.user_id == user_id)).first()
        if target_user:
            target_user.follower_count += 1
            session.add(target_user)

        session.add(current_user)
        session.commit()

        return {"following": True, "following_id": user_id}


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    """Unfollow a user"""
    with get_session() as session:
        follow = session.exec(
            select(Follow).where(Follow.follower_id == current_user.user_id, Follow.following_id == user_id)
        ).first()

        if not follow:
            raise HTTPException(status_code=404, detail="Not following this user")

        session.delete(follow)

        # Update counts
        current_user.following_count = max(0, current_user.following_count - 1)
        target_user = session.exec(select(User).where(User.user_id == user_id)).first()
        if target_user:
            target_user.follower_count = max(0, target_user.follower_count - 1)
            session.add(target_user)

        session.add(current_user)
        session.commit()

        return {"following": False, "following_id": user_id}
