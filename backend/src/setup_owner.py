"""
Setup script to initialize owner account for pmec
Run this once to create the owner account
"""

from db import get_session, init_db
from models import User, UserRole
from auth import get_password_hash
import secrets


def setup_owner():
    """Create owner account for pmec"""
    init_db()  # Ensure database is initialized

    with get_session() as session:
        # Check if owner already exists
        existing_owner = session.exec(
            session.query(User).where((User.username == "pmec") | (User.role == UserRole.OWNER))
        ).first()

        if existing_owner:
            # Update existing user to owner
            existing_owner.role = UserRole.OWNER
            existing_owner.is_admin = True
            existing_owner.is_online = False
            session.add(existing_owner)
            session.commit()
            print(f"✅ Updated user '{existing_owner.username}' to OWNER role")
            return existing_owner

        # Generate secure password (user should change this)
        temp_password = secrets.token_urlsafe(16)

        owner = User(
            user_id=f"owner_{secrets.token_urlsafe(8)}",
            username="pmec",
            email="pmec@cosmiv.com",  # Update this with real email
            password_hash=get_password_hash(temp_password),
            role=UserRole.OWNER,
            is_admin=True,
            is_active=True,
            is_online=False,
            storage_limit_mb=500000.0,  # 500 GB for owner
        )

        session.add(owner)
        session.commit()
        session.refresh(owner)

        print("=" * 60)
        print("✅ OWNER ACCOUNT CREATED")
        print("=" * 60)
        print(f"Username: pmec")
        print(f"Email: pmec@cosmiv.com")
        print(f"Temporary Password: {temp_password}")
        print("")
        print("⚠️  IMPORTANT: Change password immediately after first login!")
        print("=" * 60)

        return owner


if __name__ == "__main__":
    setup_owner()
