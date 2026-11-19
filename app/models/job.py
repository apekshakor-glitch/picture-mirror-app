"""Asynchronous background processing job tracking model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utc_now

if TYPE_CHECKING:
    from app.models.attempt import Attempt
    from app.models.challenge import Challenge


class Job(Base):
    """
    Tracks asynchronous background operations (image generation, judging, retry)
    dispatched via Celery and Amazon SQS.
    """
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    job_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        default="queued",
        nullable=False,
    )
    attempt_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    challenge_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("challenges.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    celery_task_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        unique=True,
        nullable=True,
    )
    retry_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    max_retries: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    attempt: Mapped[Optional["Attempt"]] = relationship(
        "Attempt",
        back_populates="jobs",
    )
    challenge: Mapped[Optional["Challenge"]] = relationship(
        "Challenge",
        back_populates="jobs",
    )

    __table_args__ = (
        CheckConstraint(
            "job_type IN ('image_generation', 'image_judging', 'scoring_retry')",
            name="chk_jobs_job_type",
        ),
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'retrying', 'cancelled')",
            name="chk_jobs_status",
        ),
        CheckConstraint(
            "retry_count >= 0",
            name="chk_jobs_retry_count",
        ),
        CheckConstraint(
            "max_retries >= 0",
            name="chk_jobs_max_retries",
        ),
        CheckConstraint(
            "(attempt_id IS NOT NULL AND challenge_id IS NULL) OR (attempt_id IS NULL AND challenge_id IS NOT NULL)",
            name="chk_jobs_target_entity",
        ),
        Index("idx_jobs_status_type_created", "status", "job_type", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} type='{self.job_type}' status='{self.status}' retry_count={self.retry_count}>"

