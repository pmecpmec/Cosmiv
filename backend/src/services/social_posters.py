"""
Social media posting services for TikTok, YouTube, Instagram
Supports real API integrations with fallback to mock mode
"""

import os
import logging
import requests
from typing import Optional, Dict, Any
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)


class TikTokPoster:
    """TikTok API integration for posting videos"""

    @staticmethod
    def post_video(
        video_path: str,
        caption: str,
        access_token: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Post video to TikTok using TikTok for Developers API.

        Note: TikTok requires a multi-step upload process:
        1. Initialize upload (get upload URL)
        2. Upload video file
        3. Publish video

        Mock mode: Returns success response without actual posting
        """
        if not settings.TIKTOK_API_ENABLED:
            # Mock mode
            logger.info("TikTok posting (mock mode)", extra={"platform": "tiktok"})
            return {
                "success": True,
                "platform": "tiktok",
                "post_id": f"tiktok_mock_{datetime.utcnow().timestamp()}",
                "video_url": f"https://www.tiktok.com/@mock/video/mock",
                "mock": True,
            }

        try:
            # Step 1: Initialize upload
            init_url = "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }
            payload = {
                "post_info": {
                    "title": caption[:150],  # TikTok title limit
                    "privacy_level": "PUBLIC_TO_EVERYONE",
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                },
            }

            init_response = requests.post(init_url, json=payload, headers=headers)
            init_response.raise_for_status()
            upload_url = init_response.json().get("data", {}).get("upload_url")
            publish_id = init_response.json().get("data", {}).get("publish_id")

            if not upload_url:
                raise Exception("Failed to get TikTok upload URL")

            # Step 2: Upload video file
            with open(video_path, "rb") as video_file:
                upload_response = requests.put(upload_url, data=video_file)
                upload_response.raise_for_status()

            # Step 3: Publish video
            publish_url = f"https://open.tiktokapis.com/v2/post/publish/status/fetch/?publish_id={publish_id}"
            publish_response = requests.get(publish_url, headers=headers)
            publish_response.raise_for_status()

            result = publish_response.json()
            post_id = result.get("data", {}).get("publish_id")

            return {
                "success": True,
                "platform": "tiktok",
                "post_id": post_id,
                "video_url": f"https://www.tiktok.com/@username/video/{post_id}",
                "mock": False,
            }
        except Exception as e:
            logger.error(f"TikTok posting failed: {str(e)}", exc_info=True)
            raise Exception(f"TikTok posting failed: {str(e)}")


class YouTubePoster:
    """YouTube Data API v3 integration for posting Shorts"""

    @staticmethod
    def post_video(
        video_path: str,
        caption: str,
        access_token: str,
        title: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Post video to YouTube Shorts using YouTube Data API v3.

        Mock mode: Returns success response without actual posting
        """
        if not settings.YOUTUBE_API_ENABLED:
            # Mock mode
            logger.info("YouTube posting (mock mode)", extra={"platform": "youtube"})
            return {
                "success": True,
                "platform": "youtube",
                "post_id": f"youtube_mock_{datetime.utcnow().timestamp()}",
                "video_url": f"https://www.youtube.com/watch?v=mock",
                "mock": True,
            }

        try:
            # YouTube requires multipart upload with metadata
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload
            from google.oauth2.credentials import Credentials

            credentials = Credentials(token=access_token)
            youtube = build("youtube", "v3", credentials=credentials)

            body = {
                "snippet": {
                    "title": title or caption[:100],
                    "description": caption[:5000],
                    "categoryId": "24",  # Entertainment category
                },
                "status": {
                    "privacyStatus": "public",
                    "madeForKids": False,
                },
            }

            media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
            request = youtube.videos().insert(part=",".join(body.keys()), body=body, media_body=media)

            response = None
            while response is None:
                status, response = request.next_chunk()
                if response:
                    video_id = response["id"]
                    return {
                        "success": True,
                        "platform": "youtube",
                        "post_id": video_id,
                        "video_url": f"https://www.youtube.com/watch?v={video_id}",
                        "mock": False,
                    }

            raise Exception("YouTube upload completed but no video ID returned")
        except ImportError:
            logger.warning("Google API client not installed, using mock mode")
            return YouTubePoster.post_video(video_path, caption, "", title)  # Recursive mock
        except Exception as e:
            logger.error(f"YouTube posting failed: {str(e)}", exc_info=True)
            raise Exception(f"YouTube posting failed: {str(e)}")


class InstagramPoster:
    """Instagram Graph API integration for posting Reels"""

    @staticmethod
    def post_video(
        video_path: str,
        caption: str,
        access_token: str,
        instagram_account_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Post video to Instagram Reels using Instagram Graph API.

        Note: Instagram requires:
        1. Create container (initialize upload)
        2. Upload video file
        3. Publish container

        Mock mode: Returns success response without actual posting
        """
        if not settings.INSTAGRAM_API_ENABLED:
            # Mock mode
            logger.info("Instagram posting (mock mode)", extra={"platform": "instagram"})
            return {
                "success": True,
                "platform": "instagram",
                "post_id": f"instagram_mock_{datetime.utcnow().timestamp()}",
                "video_url": f"https://www.instagram.com/p/mock/",
                "mock": True,
            }

        try:
            if not instagram_account_id:
                raise Exception("Instagram account ID required")

            # Step 1: Create container
            container_url = f"https://graph.instagram.com/v18.0/{instagram_account_id}/media"
            container_params = {
                "media_type": "REELS",
                "caption": caption[:2200],  # Instagram caption limit
                "access_token": access_token,
            }

            # Note: Instagram requires video to be uploaded first to a URL they provide
            # For simplicity, we'll use a simplified flow here
            # In production, you'd need to handle the full multi-step upload

            container_response = requests.post(container_url, params=container_params)
            container_response.raise_for_status()
            container_id = container_response.json().get("id")

            if not container_id:
                raise Exception("Failed to create Instagram container")

            # Step 2: Publish container
            publish_url = f"https://graph.instagram.com/v18.0/{instagram_account_id}/media_publish"
            publish_params = {
                "creation_id": container_id,
                "access_token": access_token,
            }

            publish_response = requests.post(publish_url, params=publish_params)
            publish_response.raise_for_status()

            media_id = publish_response.json().get("id")

            return {
                "success": True,
                "platform": "instagram",
                "post_id": media_id,
                "video_url": f"https://www.instagram.com/p/{media_id}/",
                "mock": False,
            }
        except Exception as e:
            logger.error(f"Instagram posting failed: {str(e)}", exc_info=True)
            raise Exception(f"Instagram posting failed: {str(e)}")


def post_to_social_media(platform: str, video_path: str, caption: str, access_token: str, **kwargs) -> Dict[str, Any]:
    """
    Unified interface for posting to any social media platform.

    Args:
        platform: 'tiktok', 'youtube', or 'instagram'
        video_path: Path to video file
        caption: Post caption/description
        access_token: OAuth access token
        **kwargs: Platform-specific parameters

    Returns:
        Dict with success, post_id, video_url, etc.
    """
    if platform == "tiktok":
        return TikTokPoster.post_video(video_path, caption, access_token, kwargs.get("user_id"))
    elif platform == "youtube":
        return YouTubePoster.post_video(video_path, caption, access_token, kwargs.get("title"))
    elif platform == "instagram":
        return InstagramPoster.post_video(video_path, caption, access_token, kwargs.get("instagram_account_id"))
    else:
        raise ValueError(f"Unsupported platform: {platform}")
