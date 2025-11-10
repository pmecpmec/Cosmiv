"""
Profile API Endpoints
User profiles, customization, and linked accounts
"""

from fastapi import APIRouter, Depends, HTTPException, Body, Form
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from db import get_session
from sqlmodel import select
from models_community import LinkedProfile, Post, Follow
from models import User, UserRole
from auth import get_current_user, get_current_user_optional
from datetime import datetime
import json

router = APIRouter(prefix="/v2/profiles", tags=["profiles"])


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    custom_url: Optional[str] = None
    theme_colors: Optional[Dict[str, str]] = None
    profile_effects: Optional[Dict[str, Any]] = None


class LinkProfileRequest(BaseModel):
    profile_type: str  # steam, discord, twitch, etc.
    profile_username: Optional[str] = None
    profile_url: Optional[str] = None
    profile_id: Optional[str] = None
    is_public: bool = True


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Get current user's profile"""
    linked_profiles = []
    with get_session() as session:
        links = session.exec(
            select(LinkedProfile).where(LinkedProfile.user_id == current_user.user_id, LinkedProfile.is_public == True)
        ).all()
        linked_profiles = [
            {
                "profile_type": lp.profile_type,
                "profile_username": lp.profile_username,
                "profile_url": lp.profile_url,
                "is_verified": lp.is_verified,
            }
            for lp in links
        ]

    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "banner_url": current_user.banner_url,
        "custom_url": current_user.custom_url,
        "theme_colors": json.loads(current_user.theme_colors) if current_user.theme_colors else None,
        "profile_effects": json.loads(current_user.profile_effects) if current_user.profile_effects else None,
        "follower_count": current_user.follower_count,
        "following_count": current_user.following_count,
        "posts_count": current_user.posts_count,
        "total_views": current_user.total_views,
        "storage_used_mb": current_user.storage_used_mb,
        "storage_limit_mb": current_user.storage_limit_mb,
        "linked_profiles": linked_profiles,
    }


@router.get("/{custom_url_or_user_id:path}")
async def get_profile(
    custom_url_or_user_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get a user's public profile by custom URL or user_id"""
    with get_session() as session:
        # Try custom URL first, then user_id
        user = session.exec(select(User).where(User.custom_url == custom_url_or_user_id)).first()

        if not user:
            user = session.exec(select(User).where(User.user_id == custom_url_or_user_id)).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get public posts
        posts = session.exec(
            select(Post)
            .where(Post.user_id == user.user_id, Post.is_published == True)
            .order_by(Post.created_at.desc())
            .limit(20)
        ).all()

        # Get linked profiles
        links = session.exec(
            select(LinkedProfile).where(LinkedProfile.user_id == user.user_id, LinkedProfile.is_public == True)
        ).all()

        # Check if current user follows this user
        is_following = False
        if current_user:
            follow = session.exec(
                select(Follow).where(Follow.follower_id == current_user.user_id, Follow.following_id == user.user_id)
            ).first()
            is_following = follow is not None

        return {
            "user_id": user.user_id,
            "username": user.username,
            "bio": user.bio,
            "avatar_url": user.avatar_url,
            "banner_url": user.banner_url,
            "custom_url": user.custom_url,
            "follower_count": user.follower_count,
            "following_count": user.following_count,
            "posts_count": user.posts_count,
            "total_views": user.total_views,
            "posts": [
                {
                    "post_id": p.post_id,
                    "thumbnail_path": p.thumbnail_path,
                    "caption": p.caption,
                    "views": p.views,
                    "likes": p.likes,
                    "created_at": p.created_at.isoformat(),
                }
                for p in posts
            ],
            "linked_profiles": [
                {
                    "profile_type": lp.profile_type,
                    "profile_username": lp.profile_username,
                    "profile_url": lp.profile_url,
                    "is_verified": lp.is_verified,
                }
                for lp in links
            ],
            "is_following": is_following,
        }


@router.put("/me")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile"""
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == current_user.user_id)).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields
        if request.bio is not None:
            user.bio = request.bio
        if request.avatar_url is not None:
            user.avatar_url = request.avatar_url
        if request.banner_url is not None:
            user.banner_url = request.banner_url
        if request.custom_url is not None:
            # Check uniqueness
            existing = session.exec(
                select(User).where(User.custom_url == request.custom_url, User.user_id != current_user.user_id)
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Custom URL already taken")
            user.custom_url = request.custom_url
        if request.theme_colors is not None:
            user.theme_colors = json.dumps(request.theme_colors)
        if request.profile_effects is not None:
            user.profile_effects = json.dumps(request.profile_effects)

        session.add(user)
        session.commit()

        return {"message": "Profile updated successfully"}


@router.post("/me/links")
async def link_profile(
    request: LinkProfileRequest,
    current_user: User = Depends(get_current_user),
):
    """Link an external profile (gaming or social)"""
    with get_session() as session:
        # Check if already linked
        existing = session.exec(
            select(LinkedProfile).where(
                LinkedProfile.user_id == current_user.user_id, LinkedProfile.profile_type == request.profile_type
            )
        ).first()

        if existing:
            # Update existing
            existing.profile_username = request.profile_username
            existing.profile_url = request.profile_url
            existing.profile_id = request.profile_id
            existing.is_public = request.is_public
            session.add(existing)
        else:
            # Create new
            link = LinkedProfile(
                user_id=current_user.user_id,
                profile_type=request.profile_type,
                profile_username=request.profile_username,
                profile_url=request.profile_url,
                profile_id=request.profile_id,
                is_public=request.is_public,
            )
            session.add(link)

        session.commit()

        return {"message": "Profile linked successfully"}


@router.delete("/me/links/{profile_type}")
async def unlink_profile(
    profile_type: str,
    current_user: User = Depends(get_current_user),
):
    """Unlink an external profile"""
    with get_session() as session:
        link = session.exec(
            select(LinkedProfile).where(
                LinkedProfile.user_id == current_user.user_id, LinkedProfile.profile_type == profile_type
            )
        ).first()

        if not link:
            raise HTTPException(status_code=404, detail="Profile link not found")

        session.delete(link)
        session.commit()

        return {"message": "Profile unlinked successfully"}


@router.post("/me/presence")
async def update_presence(
    is_online: bool = Body(...),
    current_user: User = Depends(get_current_user),
):
    """Update online presence status"""
    with get_session() as session:
        user = session.exec(select(User).where(User.user_id == current_user.user_id)).first()

        if user:
            user.is_online = is_online
            user.last_seen = datetime.utcnow()
            session.add(user)
            session.commit()

        return {"is_online": is_online, "last_seen": user.last_seen.isoformat() if user else None}
