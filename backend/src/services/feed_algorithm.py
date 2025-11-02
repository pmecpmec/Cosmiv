"""
TikTok/Medal/YouTube-style feed algorithm
Personalized content ranking based on engagement, recency, and user preferences
"""
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import select
from db import get_session
from models_community import Post, Follow, FeedAlgorithm, FeedCache
from models import User

logger = logging.getLogger(__name__)


class FeedAlgorithmService:
    """Feed ranking and personalization service"""
    
    @staticmethod
    def calculate_engagement_score(post: Post) -> float:
        """
        Calculate engagement score for a post.
        Higher score = more engaging content.
        """
        # Base engagement formula (weighted)
        views_weight = 0.1
        likes_weight = 0.3
        shares_weight = 0.4
        comments_weight = 0.2
        
        # Normalize by views (engagement rate)
        if post.views > 0:
            like_rate = post.likes / post.views
            share_rate = post.shares / post.views
            comment_rate = post.comments / post.views
        else:
            like_rate = share_rate = comment_rate = 0.0
        
        # Completion rate bonus (watch time)
        completion_bonus = post.completion_rate * 0.2 if post.completion_rate else 0
        
        # Calculate score
        engagement = (
            (like_rate * likes_weight) +
            (share_rate * shares_weight) +
            (comment_rate * comments_weight) +
            completion_bonus
        )
        
        # Scale to 0-100
        return min(engagement * 100, 100.0)
    
    @staticmethod
    def calculate_recency_score(post: Post) -> float:
        """
        Calculate recency score (decays over time).
        Recent posts get higher scores.
        """
        now = datetime.utcnow()
        age_hours = (now - post.created_at).total_seconds() / 3600
        
        # Exponential decay
        # Posts from last hour: ~100 score
        # Posts from 24 hours ago: ~50 score
        # Posts from 7 days ago: ~10 score
        if age_hours < 1:
            return 100.0
        elif age_hours < 24:
            return 100.0 * (1 - (age_hours / 48))
        elif age_hours < 168:  # 7 days
            return 50.0 * (1 - ((age_hours - 24) / 144))
        else:
            return max(10.0 - (age_hours - 168) / 24, 0.0)
    
    @staticmethod
    def calculate_trending_score(post: Post) -> float:
        """
        Calculate trending score based on recent growth.
        """
        # If post has high engagement score and is recent, it's trending
        engagement = FeedAlgorithmService.calculate_engagement_score(post)
        recency = FeedAlgorithmService.calculate_recency_score(post)
        
        # Trending = high engagement + recent
        trending = (engagement * 0.7) + (recency * 0.3)
        
        return trending
    
    @staticmethod
    def get_following_feed(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get feed of posts from users the current user follows.
        """
        with get_session() as session:
            # Get users being followed
            follows = session.exec(
                select(Follow).where(Follow.follower_id == user_id)
            ).all()
            
            following_ids = [f.following_id for f in follows]
            
            if not following_ids:
                return []
            
            # Get recent posts from followed users
            posts = session.exec(
                select(Post).where(
                    Post.user_id.in_(following_ids),
                    Post.is_published == True
                ).order_by(Post.created_at.desc())
                .limit(limit)
            ).all()
            
            return [FeedAlgorithmService._post_to_dict(p) for p in posts]
    
    @staticmethod
    def get_for_you_feed(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Algorithm-driven personalized feed (TikTok-style).
        Combines engagement, recency, trending, and user preferences.
        """
        with get_session() as session:
            # Check cache first
            cache = session.exec(
                select(FeedCache).where(
                    FeedCache.user_id == user_id,
                    FeedCache.feed_type == "for_you",
                    FeedCache.expires_at > datetime.utcnow()
                )
            ).first()
            
            if cache:
                import json
                post_ids = json.loads(cache.post_ids)
                # Fetch posts
                posts = session.exec(
                    select(Post).where(
                        Post.post_id.in_(post_ids),
                        Post.is_published == True
                    )
                ).all()
                # Sort by cached order
                post_dict = {p.post_id: p for p in posts}
                return [FeedAlgorithmService._post_to_dict(post_dict[pid]) for pid in post_ids if pid in post_dict]
            
            # Get user preferences
            algo_state = session.exec(
                select(FeedAlgorithm).where(FeedAlgorithm.user_id == user_id)
            ).first()
            
            # Get candidate posts (recent, published)
            time_threshold = datetime.utcnow() - timedelta(days=30)
            candidates = session.exec(
                select(Post).where(
                    Post.is_published == True,
                    Post.created_at > time_threshold
                )
            ).all()
            
            # Score and rank posts
            scored_posts = []
            for post in candidates:
                # Skip own posts (or include them with lower weight)
                if post.user_id == user_id:
                    continue
                
                engagement_score = FeedAlgorithmService.calculate_engagement_score(post)
                recency_score = FeedAlgorithmService.calculate_recency_score(post)
                trending_score = FeedAlgorithmService.calculate_trending_score(post)
                
                # Combined score (weighted)
                total_score = (
                    engagement_score * 0.5 +
                    recency_score * 0.3 +
                    trending_score * 0.2
                )
                
                scored_posts.append({
                    "post": post,
                    "score": total_score,
                    "engagement": engagement_score,
                    "recency": recency_score,
                    "trending": trending_score,
                })
            
            # Sort by total score
            scored_posts.sort(key=lambda x: x["score"], reverse=True)
            
            # Take top N
            top_posts = [sp["post"] for sp in scored_posts[:limit]]
            
            # Cache result
            post_ids = [p.post_id for p in top_posts]
            cache_entry = FeedCache(
                user_id=user_id,
                feed_type="for_you",
                post_ids=json.dumps(post_ids),
                generated_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(minutes=5)
            )
            session.add(cache_entry)
            session.commit()
            
            return [FeedAlgorithmService._post_to_dict(p) for p in top_posts]
    
    @staticmethod
    def get_trending_feed(limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get trending posts (highest trending score).
        """
        with get_session() as session:
            # Get posts from last 7 days
            time_threshold = datetime.utcnow() - timedelta(days=7)
            posts = session.exec(
                select(Post).where(
                    Post.is_published == True,
                    Post.created_at > time_threshold
                )
            ).all()
            
            # Score by trending
            scored = []
            for post in posts:
                trending = FeedAlgorithmService.calculate_trending_score(post)
                scored.append((post, trending))
            
            # Sort and take top
            scored.sort(key=lambda x: x[1], reverse=True)
            top_posts = [p[0] for p in scored[:limit]]
            
            return [FeedAlgorithmService._post_to_dict(p) for p in top_posts]
    
    @staticmethod
    def get_new_feed(limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get latest posts (chronological).
        """
        with get_session() as session:
            posts = session.exec(
                select(Post).where(
                    Post.is_published == True
                ).order_by(Post.created_at.desc())
                .limit(limit)
            ).all()
            
            return [FeedAlgorithmService._post_to_dict(p) for p in posts]
    
    @staticmethod
    def update_post_scores(post_id: str):
        """
        Update algorithm scores for a post (called when engagement changes).
        """
        import json
        with get_session() as session:
            post = session.exec(
                select(Post).where(Post.post_id == post_id)
            ).first()
            
            if not post:
                return
            
            # Recalculate scores
            post.engagement_score = FeedAlgorithmService.calculate_engagement_score(post)
            post.recency_score = FeedAlgorithmService.calculate_recency_score(post)
            post.trending_score = FeedAlgorithmService.calculate_trending_score(post)
            
            session.add(post)
            session.commit()
            
            # Invalidate cache for users who might see this post
            session.exec(
                select(FeedCache).where(FeedCache.feed_type == "for_you")
            ).all()  # Would delete in production, but for now just let expire
    
    @staticmethod
    def _post_to_dict(post: Post) -> Dict[str, Any]:
        """Convert Post model to API response dict"""
        import json
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "video_path": post.video_path,
            "thumbnail_path": post.thumbnail_path,
            "caption": post.caption,
            "hashtags": json.loads(post.hashtags) if post.hashtags else [],
            "views": post.views,
            "likes": post.likes,
            "shares": post.shares,
            "comments": post.comments,
            "engagement_score": post.engagement_score,
            "trending_score": post.trending_score,
            "created_at": post.created_at.isoformat(),
        }

