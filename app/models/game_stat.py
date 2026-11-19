"""Player game stats tracking rounds played and high scores per game and level."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, utc_now

if TYPE_CHECKING:
    from app.models.player import Player


class PlayerGameStat(Base, TimestampMixin):
    """
    Stores solo game statistics, rounds played, and high scores per level for a player.
    Supports games like 'prompt-mirror', 'emoji-charades', 'code-mirror', etc.
    """
    __tablename__ = "player_game_stats"

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
    game: Mapped[str] = mapped_column(
        String(64),
        default="prompt-mirror",
        nullable=False,
    )
    level: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    rounds_played: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    high_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Relationships
    player: Mapped["Player"] = relationship(
        "Player",
        back_populates="game_stats",
    )

    __table_args__ = (
        Index("uq_player_game_level", "player_id", "game", "level", unique=True),
        CheckConstraint("rounds_played >= 0", name="chk_game_stats_rounds"),
        CheckConstraint("high_score >= 0 AND high_score <= 100", name="chk_game_stats_score"),
    )

    def __repr__(self) -> str:
        return f"<PlayerGameStat player='{self.player_id}' game='{self.game}' level={self.level} high_score={self.high_score}>"

