"""Initial schema migration creating pictures placeholder table.

Revision ID: 001_initial_pictures
Revises: 
Create Date: 2026-11-03 20:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_initial_pictures"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create pictures table if not already existing."""
    op.create_table(
        "pictures",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("s3_key", sa.String(length=512), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False, server_default="image/jpeg"),
        sa.Column("file_size_bytes", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pictures_id"), "pictures", ["id"], unique=False)
    op.create_index(op.f("ix_pictures_s3_key"), "pictures", ["s3_key"], unique=True)


def downgrade() -> None:
    """Drop pictures table and indices."""
    op.drop_index(op.f("ix_pictures_s3_key"), table_name="pictures")
    op.drop_index(op.f("ix_pictures_id"), table_name="pictures")
    op.drop_table("pictures")
