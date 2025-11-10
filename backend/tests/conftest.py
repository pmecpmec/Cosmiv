import os
import sys

import pytest
from sqlmodel import SQLModel, create_engine

# Set testing environment variable before any imports
os.environ["TESTING"] = "1"

# Ensure backend/src is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import db  # noqa: E402


@pytest.fixture(autouse=True, scope="function")
def in_memory_db(monkeypatch):
    """
    Create an in-memory SQLite database for each test.
    Patches the db module's engine before any imports that use it.
    This fixture runs automatically before each test.
    """
    # Import all models to ensure they're registered with SQLModel.metadata
    # This must happen before creating tables
    from models import (
        Job, Clip, Render, User, AuthProvider, UserAuth, DiscoveredClip,
        Entitlement, WeeklyMontage, SocialConnection, SocialPost,
        JobEngagement, SocialPostEngagement, StylePerformance, UserAnalytics,
        UploadedClip
    )
    
    # Create in-memory SQLite database
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    
    # CRITICAL: The issue is that db.get_session() uses the module-level 'engine' variable
    # We need to patch BOTH the engine variable AND the get_session function
    # Patch the engine variable first
    monkeypatch.setattr(db, "engine", test_engine, raising=False)
    
    # Then patch get_session to always use the current db.engine
    # This ensures it always uses the patched engine
    from sqlmodel import Session
    
    def get_test_session():
        # Always use db.engine, which is now the test engine
        # This ensures even if modules imported get_session, they'll use the patched version
        return Session(db.engine)
    
    monkeypatch.setattr(db, "get_session", get_test_session, raising=False)
    
    # Also ensure that any modules that imported get_session get the patched version
    # by patching it in their namespace
    import sys
    for module_name, module in list(sys.modules.items()):
        if module_name.startswith('api_') or module_name.startswith('services.') or module_name in ['auth', 'tasks']:
            if hasattr(module, 'get_session'):
                # Check if it's the same function object
                try:
                    if module.get_session is db.get_session or (hasattr(module.get_session, '__module__') and module.get_session.__module__ == 'db'):
                        monkeypatch.setattr(module, 'get_session', get_test_session, raising=False)
                except:
                    pass
    
    # Create all tables using the shared SQLModel metadata
    # Models must be imported above for this to work
    SQLModel.metadata.create_all(test_engine)
    
    # Verify tables were created
    from sqlalchemy import inspect
    inspector = inspect(test_engine)
    created_tables = inspector.get_table_names()
    assert "user" in created_tables, f"User table not created. Tables: {created_tables}"
    
    # CRITICAL: Reload modules that import get_session at module level
    # This ensures they use the patched function instead of a cached reference
    import sys
    modules_to_reload = [
        'api_auth',
        'api_accounts_v2',
        'api_billing_v2',
        'api_v2',
        'auth',
        'api_social_v2',
        'api_admin',
        'api_weekly_montages',
        'api_profiles',
        'api_feed',
        'api_communities',
        'api_analytics',
        'api_ai',
        'api_ai_content',
        'api_ai_code',
        'api_ai_ux',
        'api_ai_video',
        'api_upload',
        'services.job_state',
        'services.ai_content_renewal',
        'services.ai_video_enhancer',
        'services.analytics',
        'services.feed_algorithm',
        'services.ai_ux_analyzer',
        'services.ai_code_generator',
        'tasks',
    ]
    
    for module_name in modules_to_reload:
        if module_name in sys.modules:
            # Patch get_session in the module if it has it
            module = sys.modules[module_name]
            if hasattr(module, 'get_session'):
                monkeypatch.setattr(module, 'get_session', get_test_session, raising=False)
    
    # Verify that get_session() returns a session using the test engine
    test_session = db.get_session()
    assert test_session.bind is test_engine, f"get_session() is not using the patched engine! Session engine: {test_session.bind.url}, Test engine: {test_engine.url}"
    test_session.close()
    
    # CRITICAL: Patch get_session in all modules that import it
    # This ensures they all use the test engine
    import sys
    for module_name, module in list(sys.modules.items()):
        if hasattr(module, 'get_session'):
            try:
                # Check if it's the db.get_session function
                if (hasattr(module.get_session, '__module__') and 
                    module.get_session.__module__ == 'db') or \
                   module.get_session is db.get_session:
                    # Patch it to use the test session
                    monkeypatch.setattr(module, 'get_session', get_test_session, raising=False)
            except (AttributeError, TypeError):
                pass
    
    # Verify api_auth uses the patched engine
    if 'api_auth' in sys.modules:
        api_auth_module = sys.modules['api_auth']
        if hasattr(api_auth_module, 'get_session'):
            test_session2 = api_auth_module.get_session()
            assert test_session2.bind is test_engine, f"api_auth.get_session() is not using the patched engine! Session engine: {test_session2.bind.url}, Test engine: {test_engine.url}"
            test_session2.close()
    
    yield
    
    # Cleanup: drop all tables after test
    SQLModel.metadata.drop_all(test_engine)
