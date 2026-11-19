"""SQLAlchemy 2.x ORM models matching the DaRI AI Picture Mirror schema.

Corresponds to rds_schema.sql for challenges, players, rounds, attempts, results, and jobs.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Challenge(Base):
    """Game challenge presenting a target picture for players to mirror."""

    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    theme: Mapped[str] = mapped_column(String(64), nullable=False)
    difficulty: Mapped[str] = mapped_column(
        String(16),
        CheckConstraint("difficulty IN ('easy', 'medium', 'hard')"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    reference_image_s3_key: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    rounds: Mapped[List["Round"]] = relationship("Round", back_populates="challenge")
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="challenge")

    __table_args__ = (
        Index("idx_challenges_theme_diff_active", "theme", "difficulty", "is_active"),
    )


class Player(Base):
    """Player account linked to external authentication (Supabase)."""

    __tablename__ = "players"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    rounds: Mapped[List["Round"]] = relationship("Round", back_populates="player")

    __table_args__ = (
        Index("idx_players_last_active_at", "last_active_at"),
    )


class Round(Base):
    """A player's gameplay session tackling a specific challenge."""

    __tablename__ = "rounds"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("players.id", ondelete="CASCADE"),
        nullable=False,
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
    )
    selected_difficulty: Mapped[str] = mapped_column(
        String(16),
        CheckConstraint("selected_difficulty IN ('easy', 'medium', 'hard')"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("status IN ('created', 'in_progress', 'completed', 'abandoned')"),
        default="created",
        nullable=False,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    player: Mapped["Player"] = relationship("Player", back_populates="rounds")
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="rounds")
    attempts: Mapped[List["Attempt"]] = relationship("Attempt", back_populates="round", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_rounds_player_created", "player_id", "created_at"),
        Index("idx_rounds_challenge_id", "challenge_id"),
    )


class Attempt(Base):
    """An individual prompt submission by a player in a round."""

    __tablename__ = "attempts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("rounds.id", ondelete="CASCADE"),
        nullable=False,
    )
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    generated_image_s3_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    generation_status: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("generation_status IN ('pending', 'processing', 'completed', 'failed')"),
        default="pending",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("status IN ('submitted', 'generating', 'judging', 'completed', 'failed')"),
        default="submitted",
        nullable=False,
    )
    retry_count: Mapped[int] = mapped_column(
        Integer,
        CheckConstraint("retry_count >= 0"),
        default=0,
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    round: Mapped["Round"] = relationship("Round", back_populates="attempts")
    results: Mapped[List["Result"]] = relationship("Result", back_populates="attempt", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="attempt")

    __table_args__ = (
        Index("idx_attempts_round_created", "round_id", "created_at"),
    )


class Result(Base):
    """Evaluation result comparing the generated image to the reference image."""

    __tablename__ = "results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=False,
    )
    retry_sequence: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score: Mapped[Optional[int]] = mapped_column(
        Integer,
        CheckConstraint("score IS NULL OR (score >= 0 AND score <= 100)"),
        nullable=True,
    )
    score_category: Mapped[Optional[str]] = mapped_column(
        String(16),
        CheckConstraint("score_category IS NULL OR score_category IN ('Green', 'Amber', 'Red')"),
        nullable=True,
    )
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_provider: Mapped[str] = mapped_column(String(64), nullable=False)
    model_name: Mapped[str] = mapped_column(String(64), nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), nullable=False)
    rubric_version: Mapped[str] = mapped_column(String(32), nullable=False)
    usage_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    judging_status: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("judging_status IN ('pending', 'processing', 'completed', 'failed')"),
        default="pending",
        nullable=False,
    )
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    judged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    attempt: Mapped["Attempt"] = relationship("Attempt", back_populates="results")

    __table_args__ = (
        UniqueConstraint("attempt_id", "retry_sequence", name="uq_results_attempt_retry"),
        Index("idx_results_attempt_id", "attempt_id"),
        Index("idx_results_judging_status", "judging_status"),
    )


class Job(Base):
    """Background asynchronous processing job (image generation or judging)."""

    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_type: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("job_type IN ('image_generation', 'image_judging', 'scoring_retry')"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        CheckConstraint("status IN ('queued', 'running', 'completed', 'failed', 'retrying', 'cancelled')"),
        default="queued",
        nullable=False,
    )
    attempt_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("attempts.id", ondelete="CASCADE"),
        nullable=True,
    )
    challenge_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="CASCADE"),
        nullable=True,
    )
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(128), unique=True, nullable=True)
    retry_count: Mapped[int] = mapped_column(
        Integer,
        CheckConstraint("retry_count >= 0"),
        default=0,
        nullable=False,
    )
    max_retries: Mapped[int] = mapped_column(
        Integer,
        CheckConstraint("max_retries >= 0"),
        default=3,
        nullable=False,
    )
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    attempt: Mapped[Optional["Attempt"]] = relationship("Attempt", back_populates="jobs")
    challenge: Mapped[Optional["Challenge"]] = relationship("Challenge", back_populates="jobs")

    __table_args__ = (
        CheckConstraint(
            "(attempt_id IS NOT NULL AND challenge_id IS NULL) OR (attempt_id IS NULL AND challenge_id IS NOT NULL)",
            name="chk_jobs_target_entity",
        ),
        Index("idx_jobs_status_type_created", "status", "job_type", "created_at"),
    )
