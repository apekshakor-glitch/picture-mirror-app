"""Game round session model linking players and challenges."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.player import Player
    from app.models.challenge import Challenge
    from app.models.attempt import Attempt


class Round(Base, TimestampMixin):
    """
    Represents one Picture Mirror game session between a Player and a Challenge.
    """
    __tablename__ = "rounds"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    player_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("players.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    selected_difficulty: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        default="created",
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
    player: Mapped["Player"] = relationship(
        "Player",
        back_populates="rounds",
    )
    challenge: Mapped["Challenge"] = relationship(
        "Challenge",
        back_populates="rounds",
    )
    attempts: Mapped[List["Attempt"]] = relationship(
        "Attempt",
        back_populates="round",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "selected_difficulty IN ('easy', 'medium', 'hard')",
            name="chk_rounds_selected_difficulty",
        ),
        CheckConstraint(
            "status IN ('created', 'in_progress', 'completed', 'abandoned')",
            name="chk_rounds_status",
        ),
        Index("idx_rounds_player_created", "player_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Round id={self.id} player_id='{self.player_id}' status='{self.status}'>"

