"""AI judging evaluation result model comparing generated and reference images."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utc_now

if TYPE_CHECKING:
    from app.models.attempt import Attempt


class Result(Base):
    """
    Stores AI judging output for an attempt.
    Supports multiple evaluations per attempt for scoring retries.
    Failure is NEVER stored as a score of 0.
    """
    __tablename__ = "results"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    retry_sequence: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    score: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    score_category: Mapped[Optional[str]] = mapped_column(
        String(16),
        nullable=True,
    )
    feedback: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    ai_provider: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    model_version: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    rubric_version: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )
    usage_metadata: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    judging_status: Mapped[str] = mapped_column(
        String(32),
        default="pending",
        nullable=False,
    )
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    is_current: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    judged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    attempt: Mapped["Attempt"] = relationship(
        "Attempt",
        back_populates="results",
    )

    __table_args__ = (
        CheckConstraint(
            "score IS NULL OR (score >= 0 AND score <= 100)",
            name="chk_results_score",
        ),
        CheckConstraint(
            "score_category IS NULL OR score_category IN ('Green', 'Amber', 'Red')",
            name="chk_results_score_category",
        ),
        CheckConstraint(
            "judging_status IN ('pending', 'processing', 'completed', 'failed')",
            name="chk_results_judging_status",
        ),
        Index(
            "uq_results_attempt_retry",
            "attempt_id",
            "retry_sequence",
            unique=True,
        ),
        Index("idx_results_attempt_id", "attempt_id"),
        Index("idx_results_judging_status", "judging_status"),
    )

    def __repr__(self) -> str:
        return f"<Result id={self.id} attempt_id={self.attempt_id} score={self.score} status='{self.judging_status}'>"

