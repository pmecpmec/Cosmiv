from sqlmodel import SQLModel, create_engine, Session
from config import settings
import os

if settings.USE_POSTGRES:
    engine = create_engine(settings.POSTGRES_DSN, pool_pre_ping=True)
else:
    os.makedirs(os.path.dirname(settings.DB_PATH), exist_ok=True)
    engine = create_engine(f"sqlite:///{settings.DB_PATH}", connect_args={"check_same_thread": False})


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)
