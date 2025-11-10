"""
Community/Server API Endpoints
Discord-like server and channel management
"""

from fastapi import APIRouter, Depends, HTTPException, Body, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from db import get_session
from sqlmodel import select, and_
from models_community import Server, Channel, ServerMember, Message, ServerInvite, ServerType, ChannelType
from models import User
from auth import get_current_user, get_current_admin_user, get_current_user_optional
from datetime import datetime, timedelta
import secrets
import json

router = APIRouter(prefix="/v2/communities", tags=["communities"])


class ServerCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    server_type: str = "public"  # public, private, unlisted


class ChannelCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    channel_type: str = "text"  # text, voice, video, announcements


class MessageCreateRequest(BaseModel):
    content: str
    attachments: Optional[List[str]] = None
    video_id: Optional[str] = None
    reply_to_id: Optional[str] = None


@router.post("/servers")
async def create_server(
    request: ServerCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """Create a new community server"""
    with get_session() as session:
        server_id = f"server_{secrets.token_urlsafe(12)}"
        invite_code = secrets.token_urlsafe(8)

        server = Server(
            server_id=server_id,
            name=request.name,
            description=request.description,
            owner_id=current_user.user_id,
            server_type=ServerType(request.server_type),
            invite_code=invite_code,
            member_count=1,
        )

        session.add(server)

        # Add owner as member
        member = ServerMember(
            server_id=server_id,
            user_id=current_user.user_id,
            role="owner",
        )
        session.add(member)

        # Create default channels
        default_channels = [
            {"name": "general", "type": ChannelType.TEXT},
            {"name": "announcements", "type": ChannelType.ANNOUNCEMENTS},
        ]

        for idx, ch_data in enumerate(default_channels):
            channel = Channel(
                channel_id=f"channel_{secrets.token_urlsafe(12)}",
                server_id=server_id,
                name=ch_data["name"],
                channel_type=ch_data["type"],
                position=idx,
            )
            session.add(channel)

        session.commit()
        session.refresh(server)

        return {
            "server_id": server_id,
            "invite_code": invite_code,
            "message": "Server created successfully",
        }


@router.get("/servers")
async def list_servers(
    server_type: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """List public servers (or user's servers if authenticated)"""
    with get_session() as session:
        if current_user:
            # Get user's servers
            memberships = session.exec(select(ServerMember).where(ServerMember.user_id == current_user.user_id)).all()
            server_ids = [m.server_id for m in memberships]

            if server_ids:
                servers = session.exec(select(Server).where(Server.server_id.in_(server_ids))).all()
            else:
                servers = []
        else:
            # Public servers only
            servers = session.exec(select(Server).where(Server.server_type == ServerType.PUBLIC)).limit(50).all()

        return {
            "servers": [
                {
                    "server_id": s.server_id,
                    "name": s.name,
                    "description": s.description,
                    "member_count": s.member_count,
                    "icon_url": s.icon_url,
                }
                for s in servers
            ]
        }


@router.post("/servers/{server_id}/join")
async def join_server(
    server_id: str,
    invite_code: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user),
):
    """Join a server (requires invite code for private/unlisted)"""
    with get_session() as session:
        server = session.exec(select(Server).where(Server.server_id == server_id)).first()

        if not server:
            raise HTTPException(status_code=404, detail="Server not found")

        # Check if already member
        existing = session.exec(
            select(ServerMember).where(
                ServerMember.server_id == server_id, ServerMember.user_id == current_user.user_id
            )
        ).first()

        if existing:
            return {"message": "Already a member", "server_id": server_id}

        # Check permissions
        if server.server_type != ServerType.PUBLIC:
            if not invite_code or invite_code != server.invite_code:
                raise HTTPException(status_code=403, detail="Invalid invite code")

        # Join server
        member = ServerMember(
            server_id=server_id,
            user_id=current_user.user_id,
            role="member",
        )
        session.add(member)

        server.member_count += 1
        session.add(server)
        session.commit()

        return {"message": "Joined server successfully", "server_id": server_id}


@router.get("/servers/{server_id}/channels")
async def list_channels(
    server_id: str,
    current_user: User = Depends(get_current_user),
):
    """List channels in a server"""
    with get_session() as session:
        # Check membership
        member = session.exec(
            select(ServerMember).where(
                ServerMember.server_id == server_id, ServerMember.user_id == current_user.user_id
            )
        ).first()

        if not member:
            raise HTTPException(status_code=403, detail="Not a member of this server")

        channels = session.exec(select(Channel).where(Channel.server_id == server_id).order_by(Channel.position)).all()

        return {
            "channels": [
                {
                    "channel_id": c.channel_id,
                    "name": c.name,
                    "description": c.description,
                    "channel_type": c.channel_type.value,
                    "message_count": c.message_count,
                }
                for c in channels
            ]
        }


@router.get("/channels/{channel_id}/messages")
async def get_messages(
    channel_id: str,
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = Query(None),  # message_id for pagination
    current_user: User = Depends(get_current_user),
):
    """Get messages in a channel"""
    with get_session() as session:
        channel = session.exec(select(Channel).where(Channel.channel_id == channel_id)).first()

        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Check membership
        member = session.exec(
            select(ServerMember).where(
                ServerMember.server_id == channel.server_id, ServerMember.user_id == current_user.user_id
            )
        ).first()

        if not member:
            raise HTTPException(status_code=403, detail="Not a member")

        # Get messages
        query = select(Message).where(Message.channel_id == channel_id).order_by(Message.created_at.desc()).limit(limit)

        if before:
            before_msg = session.exec(select(Message).where(Message.message_id == before)).first()
            if before_msg:
                query = query.where(Message.created_at < before_msg.created_at)

        messages = session.exec(query).all()
        messages.reverse()  # Oldest first

        return {
            "messages": [
                {
                    "message_id": m.message_id,
                    "user_id": m.user_id,
                    "content": m.content,
                    "attachments": json.loads(m.attachments) if m.attachments else [],
                    "video_id": m.video_id,
                    "created_at": m.created_at.isoformat(),
                }
                for m in messages
            ]
        }


@router.post("/channels/{channel_id}/messages")
async def send_message(
    channel_id: str,
    request: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a message in a channel"""
    with get_session() as session:
        channel = session.exec(select(Channel).where(Channel.channel_id == channel_id)).first()

        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Check membership
        member = session.exec(
            select(ServerMember).where(
                ServerMember.server_id == channel.server_id, ServerMember.user_id == current_user.user_id
            )
        ).first()

        if not member or member.is_banned or member.is_muted:
            raise HTTPException(status_code=403, detail="Cannot send messages")

        # Create message
        message_id = f"msg_{secrets.token_urlsafe(12)}"
        message = Message(
            message_id=message_id,
            channel_id=channel_id,
            server_id=channel.server_id,
            user_id=current_user.user_id,
            content=request.content,
            attachments=json.dumps(request.attachments) if request.attachments else None,
            video_id=request.video_id,
            reply_to_id=request.reply_to_id,
        )

        session.add(message)
        channel.message_count += 1
        session.add(channel)
        session.commit()

        return {
            "message_id": message_id,
            "message": "Message sent successfully",
        }
