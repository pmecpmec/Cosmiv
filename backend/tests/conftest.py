import os
import sys

import pytest
from sqlmodel import SQLModel, create_engine

# Ensure backend/src is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import db  # noqa: E402


@pytest.fixture(autouse=True)
def in_memory_db(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    monkeypatch.setattr(db, "engine", engine, raising=False)
    SQLModel.metadata.create_all(engine)
    db.init_db()
    yield
