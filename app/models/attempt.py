"""Player prompt submission and synthesized image attempt model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.round import Round
    from app.models.result import Result
    from app.models.job import Job


class Attempt(Base, TimestampMixin):
    """
    Represents one player prompt submission within a round and its resulting synthesized image.
    Supports multiple scoring retries against the same generated image.
    """
    __tablename__ = "attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    round_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("rounds.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prompt_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    generated_image_s3_key: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
    )
    generation_status: Mapped[str] = mapped_column(
        String(32),
        default="pending",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        default="submitted",
        nullable=False,
    )
    retry_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    round: Mapped["Round"] = relationship(
        "Round",
        back_populates="attempts",
    )
    results: Mapped[List["Result"]] = relationship(
        "Result",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )
    jobs: Mapped[List["Job"]] = relationship(
        "Job",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "generation_status IN ('pending', 'processing', 'completed', 'failed')",
            name="chk_attempts_generation_status",
        ),
        CheckConstraint(
            "status IN ('submitted', 'generating', 'judging', 'completed', 'failed')",
            name="chk_attempts_status",
        ),
        CheckConstraint(
            "retry_count >= 0",
            name="chk_attempts_retry_count",
        ),
        Index("idx_attempts_round_created", "round_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Attempt id={self.id} round_id={self.round_id} status='{self.status}' retry_count={self.retry_count}>"

