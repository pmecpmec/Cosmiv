"""Add account lockout fields to user table

Revision ID: 001_add_lockout
Revises: 
Create Date: 2025-01-28 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '001_add_lockout'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add failed_login_attempts column
    op.add_column('user', sa.Column('failed_login_attempts', sa.Integer(), nullable=True, server_default='0'))
    
    # Add account_locked_until column
    # Use DateTime for PostgreSQL, TEXT for SQLite
    op.add_column('user', sa.Column('account_locked_until', sa.DateTime(), nullable=True))
    
    # Set default value for existing rows
    op.execute("UPDATE user SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL")


def downgrade() -> None:
    # Remove account_locked_until column
    op.drop_column('user', 'account_locked_until')
    
    # Remove failed_login_attempts column
    op.drop_column('user', 'failed_login_attempts')

