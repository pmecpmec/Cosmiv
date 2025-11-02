"""
Gaming platform OAuth integrations
Supports Steam, Xbox, PlayStation, and Nintendo Switch
Mock mode by default, real OAuth when configured
"""
import os
import logging
import requests
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from config import settings

logger = logging.getLogger(__name__)


class SteamOAuth:
    """Steam OpenID OAuth integration"""
    
    @staticmethod
    def get_authorize_url(redirect_uri: str, state: str) -> str:
        """
        Generate Steam OpenID authorization URL.
        Steam uses OpenID 2.0, not OAuth 2.0.
        """
        if not settings.STEAM_API_ENABLED:
            # Mock mode - return mock URL
            return f"http://localhost:3000/auth/steam/callback?mock=true&state={state}"
        
        try:
            # Steam OpenID discovery
            realm = redirect_uri.split('?')[0]
            return_url = f"{redirect_uri}?state={state}"
            
            # Steam OpenID endpoint
            steam_login_url = "https://steamcommunity.com/openid/login"
            params = {
                "openid.ns": "http://specs.openid.net/auth/2.0",
                "openid.mode": "checkid_setup",
                "openid.return_to": return_url,
                "openid.realm": realm,
                "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
                "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
            }
            
            # Build URL
            from urllib.parse import urlencode
            return f"{steam_login_url}?{urlencode(params)}"
        except Exception as e:
            logger.error(f"Steam OAuth URL generation failed: {str(e)}")
            raise
    
    @staticmethod
    def verify_callback(params: Dict[str, Any], redirect_uri: str) -> Dict[str, Any]:
        """Verify Steam OpenID callback and extract Steam ID"""
        if not settings.STEAM_API_ENABLED:
            # Mock mode - return mock user
            return {
                "platform_user_id": f"steam_mock_{datetime.utcnow().timestamp()}",
                "platform_username": "MockSteamUser",
                "access_token": "mock_steam_token",
                "refresh_token": None,
                "expires_at": None,
            }
        
        try:
            # Steam OpenID verification (simplified)
            # In production, you'd verify the OpenID response
            steam_id = params.get("openid.claimed_id", "").split("/")[-1]
            
            # Get user info from Steam API
            api_key = settings.STEAM_API_KEY
            summary_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={api_key}&steamids={steam_id}"
            response = requests.get(summary_url)
            response.raise_for_status()
            data = response.json()
            
            player = data.get("response", {}).get("players", [{}])[0]
            
            return {
                "platform_user_id": steam_id,
                "platform_username": player.get("personaname", "Steam User"),
                "access_token": f"steam_{steam_id}",  # Steam doesn't use OAuth tokens
                "refresh_token": None,
                "expires_at": None,
            }
        except Exception as e:
            logger.error(f"Steam OAuth verification failed: {str(e)}")
            raise


class XboxOAuth:
    """Xbox Live OAuth integration"""
    
    @staticmethod
    def get_authorize_url(redirect_uri: str, state: str) -> str:
        """Generate Xbox Live OAuth authorization URL"""
        if not settings.XBOX_API_ENABLED:
            return f"http://localhost:3000/auth/xbox/callback?mock=true&state={state}"
        
        try:
            client_id = settings.XBOX_CLIENT_ID
            scope = "XboxLive.signin XboxLive.offline_access"
            
            auth_url = "https://login.live.com/oauth20_authorize.srf"
            params = {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
                "scope": scope,
                "state": state,
            }
            
            from urllib.parse import urlencode
            return f"{auth_url}?{urlencode(params)}"
        except Exception as e:
            logger.error(f"Xbox OAuth URL generation failed: {str(e)}")
            raise
    
    @staticmethod
    async def exchange_code(code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for Xbox tokens"""
        if not settings.XBOX_API_ENABLED:
            return {
                "platform_user_id": f"xbox_mock_{datetime.utcnow().timestamp()}",
                "platform_username": "MockXboxUser",
                "access_token": "mock_xbox_token",
                "refresh_token": "mock_xbox_refresh",
                "expires_at": (datetime.utcnow() + timedelta(days=90)).isoformat(),
            }
        
        try:
            client_id = settings.XBOX_CLIENT_ID
            client_secret = settings.XBOX_CLIENT_SECRET
            
            # Exchange code for tokens
            token_url = "https://login.live.com/oauth20_token.srf"
            data = {
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            token_data = response.json()
            
            # Get Xbox user info
            user_url = "https://userinfo.xboxlive.com/users/me/profile"
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_response = requests.get(user_url, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            return {
                "platform_user_id": user_data.get("id", ""),
                "platform_username": user_data.get("Gamertag", "Xbox User"),
                "access_token": token_data["access_token"],
                "refresh_token": token_data.get("refresh_token"),
                "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
            }
        except Exception as e:
            logger.error(f"Xbox OAuth exchange failed: {str(e)}")
            raise


class PlayStationOAuth:
    """PlayStation Network OAuth integration"""
    
    @staticmethod
    def get_authorize_url(redirect_uri: str, state: str) -> str:
        """Generate PSN OAuth authorization URL"""
        if not settings.PLAYSTATION_API_ENABLED:
            return f"http://localhost:3000/auth/playstation/callback?mock=true&state={state}"
        
        try:
            client_id = settings.PLAYSTATION_CLIENT_ID
            scope = "psn:clientapp"
            
            auth_url = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/authorize"
            params = {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
                "scope": scope,
                "state": state,
            }
            
            from urllib.parse import urlencode
            return f"{auth_url}?{urlencode(params)}"
        except Exception as e:
            logger.error(f"PlayStation OAuth URL generation failed: {str(e)}")
            raise
    
    @staticmethod
    async def exchange_code(code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for PSN tokens"""
        if not settings.PLAYSTATION_API_ENABLED:
            return {
                "platform_user_id": f"psn_mock_{datetime.utcnow().timestamp()}",
                "platform_username": "MockPSNUser",
                "access_token": "mock_psn_token",
                "refresh_token": "mock_psn_refresh",
                "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            }
        
        try:
            client_id = settings.PLAYSTATION_CLIENT_ID
            client_secret = settings.PLAYSTATION_CLIENT_SECRET
            
            token_url = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token"
            data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            token_data = response.json()
            
            # Get PSN user info
            user_url = "https://us-prof.np.community.playstation.net/userProfile/v1/users/me/profile2"
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_response = requests.get(user_url, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            return {
                "platform_user_id": user_data.get("onlineId", ""),
                "platform_username": user_data.get("onlineId", "PSN User"),
                "access_token": token_data["access_token"],
                "refresh_token": token_data.get("refresh_token"),
                "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
            }
        except Exception as e:
            logger.error(f"PlayStation OAuth exchange failed: {str(e)}")
            raise


class NintendoOAuth:
    """Nintendo Switch OAuth integration"""
    
    @staticmethod
    def get_authorize_url(redirect_uri: str, state: str) -> str:
        """Generate Nintendo OAuth authorization URL"""
        if not settings.NINTENDO_API_ENABLED:
            return f"http://localhost:3000/auth/nintendo/callback?mock=true&state={state}"
        
        try:
            client_id = settings.NINTENDO_CLIENT_ID
            scope = "openid user"
            
            auth_url = "https://accounts.nintendo.com/connect/1.0.0/authorize"
            params = {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
                "scope": scope,
                "state": state,
            }
            
            from urllib.parse import urlencode
            return f"{auth_url}?{urlencode(params)}"
        except Exception as e:
            logger.error(f"Nintendo OAuth URL generation failed: {str(e)}")
            raise
    
    @staticmethod
    async def exchange_code(code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for Nintendo tokens"""
        if not settings.NINTENDO_API_ENABLED:
            return {
                "platform_user_id": f"nintendo_mock_{datetime.utcnow().timestamp()}",
                "platform_username": "MockNintendoUser",
                "access_token": "mock_nintendo_token",
                "refresh_token": "mock_nintendo_refresh",
                "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            }
        
        try:
            client_id = settings.NINTENDO_CLIENT_ID
            client_secret = settings.NINTENDO_CLIENT_SECRET
            
            token_url = "https://accounts.nintendo.com/connect/1.0.0/api/token"
            data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            token_data = response.json()
            
            # Get Nintendo user info
            user_url = "https://api.accounts.nintendo.com/2.0.0/users/me"
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            user_response = requests.get(user_url, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            return {
                "platform_user_id": user_data.get("id", ""),
                "platform_username": user_data.get("nickname", "Nintendo User"),
                "access_token": token_data["access_token"],
                "refresh_token": token_data.get("refresh_token"),
                "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
            }
        except Exception as e:
            logger.error(f"Nintendo OAuth exchange failed: {str(e)}")
            raise


def get_oauth_handler(provider: str):
    """Get OAuth handler for platform"""
    handlers = {
        "steam": SteamOAuth,
        "xbox": XboxOAuth,
        "playstation": PlayStationOAuth,
        "switch": NintendoOAuth,
    }
    return handlers.get(provider.lower())


# Add refresh_token methods to OAuth handlers that support it

def _xbox_refresh_token(refresh_token: str) -> Dict[str, Any]:
    """Refresh Xbox Live OAuth token"""
    if not settings.XBOX_API_ENABLED:
        # Mock refresh
        return {
            "access_token": f"mock_xbox_token_{datetime.utcnow().timestamp()}",
            "refresh_token": refresh_token,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        }
    
    try:
        token_url = "https://login.live.com/oauth20_token.srf"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.XBOX_CLIENT_ID,
            "client_secret": settings.XBOX_CLIENT_SECRET,
        }
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        token_data = response.json()
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token", refresh_token),
            "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
        }
    except Exception as e:
        logger.error(f"Xbox token refresh failed: {str(e)}")
        raise

# Attach refresh methods to classes as static methods
XboxOAuth.refresh_token = staticmethod(_xbox_refresh_token)


def _playstation_refresh_token(refresh_token: str) -> Dict[str, Any]:
    """Refresh PlayStation OAuth token"""
    if not settings.PLAYSTATION_API_ENABLED:
        # Mock refresh
        return {
            "access_token": f"mock_psn_token_{datetime.utcnow().timestamp()}",
            "refresh_token": refresh_token,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        }
    
    try:
        token_url = "https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.PLAYSTATION_CLIENT_ID,
            "client_secret": settings.PLAYSTATION_CLIENT_SECRET,
        }
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        token_data = response.json()
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token", refresh_token),
            "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
        }
    except Exception as e:
        logger.error(f"PlayStation token refresh failed: {str(e)}")
        raise

PlayStationOAuth.refresh_token = staticmethod(_playstation_refresh_token)


def _nintendo_refresh_token(refresh_token: str) -> Dict[str, Any]:
    """Refresh Nintendo OAuth token"""
    if not settings.NINTENDO_API_ENABLED:
        # Mock refresh
        return {
            "access_token": f"mock_nintendo_token_{datetime.utcnow().timestamp()}",
            "refresh_token": refresh_token,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        }
    
    try:
        token_url = "https://accounts.nintendo.com/connect/1.0.0/api/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.NINTENDO_CLIENT_ID,
            "client_secret": settings.NINTENDO_CLIENT_SECRET,
        }
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        token_data = response.json()
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token", refresh_token),
            "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
        }
    except Exception as e:
        logger.error(f"Nintendo token refresh failed: {str(e)}")
        raise

NintendoOAuth.refresh_token = staticmethod(_nintendo_refresh_token)

