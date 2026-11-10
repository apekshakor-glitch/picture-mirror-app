"""Game challenge presenting a target picture for players to mirror."""

import uuid
from typing import TYPE_CHECKING, Any, Dict, List
from sqlalchemy import Boolean, CheckConstraint, Index, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.round import Round
    from app.models.job import Job


class Challenge(Base, TimestampMixin):
    """
    Represents the curated reference target image and game configuration.
    Stores private S3 object keys; does not store binary image data.
    """
    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    theme: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    difficulty: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )
    reference_image_s3_key: Mapped[str] = mapped_column(
        String(512),
        unique=True,
        nullable=False,
    )
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    rounds: Mapped[List["Round"]] = relationship(
        "Round",
        back_populates="challenge",
    )
    jobs: Mapped[List["Job"]] = relationship(
        "Job",
        back_populates="challenge",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "difficulty IN ('easy', 'medium', 'hard')",
            name="chk_challenges_difficulty",
        ),
        Index(
            "idx_challenges_theme_diff_active",
            "theme",
            "difficulty",
            "is_active",
        ),
    )

    def __repr__(self) -> str:
        return f"<Challenge id={self.id} theme='{self.theme}' difficulty='{self.difficulty}' title='{self.title}'>"

