from sqlmodel import SQLModel, create_engine, Session
from config import settings
from models import Job
import os

if settings.USE_POSTGRES:
    engine = create_engine(settings.POSTGRES_DSN, pool_pre_ping=True)
else:
    os.makedirs(os.path.dirname(settings.DB_PATH), exist_ok=True)
    engine = create_engine(f"sqlite:///{settings.DB_PATH}", connect_args={"check_same_thread": False})


def init_db():
    """Initialize database with all models"""
    # Import all models to register them with SQLModel
    from models import (
        Job, Clip, Render, User, AuthProvider, UserAuth, DiscoveredClip,
        Entitlement, WeeklyMontage, SocialConnection, SocialPost,
        JobEngagement, SocialPostEngagement, StylePerformance, UserAnalytics
    )
    from models_community import (
        Server, Channel, ServerMember, Message, DirectMessage,
        ServerInvite, Post, Follow, LinkedProfile,
        PostLike, FeedAlgorithm, FeedCache
    )
    from models_ai import (
        ContentVersion, CodeGeneration, UXAnalysis, AITask, VideoEnhancement
    )
    
    SQLModel.metadata.create_all(engine)
    _apply_migrations()


def get_session() -> Session:
    return Session(engine)


def _apply_migrations() -> None:
    """Lightweight migrations for existing deployments."""
    if engine.dialect.name == "sqlite":
        _ensure_sqlite_columns(
            table=Job.__tablename__ if hasattr(Job, "__tablename__") else "job",
            columns={
                "stage": "TEXT DEFAULT 'queued'",
                "progress": "INTEGER DEFAULT 0",
                "started_at": "DATETIME",
                "finished_at": "DATETIME",
                "last_error_at": "DATETIME",
            },
        )


def _ensure_sqlite_columns(table: str, columns: dict) -> None:
    with engine.begin() as conn:
        existing = conn.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
        existing_cols = {row[1] for row in existing}
        for name, ddl in columns.items():
            if name not in existing_cols:
                conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}")
