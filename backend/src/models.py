from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class JobStatus:
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default=JobStatus.PENDING)
    target_duration: int = Field(default=60)
    error: Optional[str] = None

class Clip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    path: str
    original_name: str

class Render(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    output_path: str
    format: str = Field(default="landscape")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# New Big Road models
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # external or generated id
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuthProvider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # steam, xbox, playstation, switch

class UserAuth(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    provider: str = Field(index=True)
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DiscoveredClip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    provider: str = Field(index=True)
    external_id: str = Field(index=True)
    title: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)

class Entitlement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    plan: str = Field(default="free")  # free, pro
    expires_at: Optional[datetime] = None
