"""Player model representing authenticated players and admin role management."""

import random
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, utc_now

if TYPE_CHECKING:
    from app.models.round import Round
    from app.models.game_stat import PlayerGameStat
    from app.models.app_setting import AppSetting


def generate_player_id() -> str:
    """Generates a player ID matching the frontend format: 'P' + 4 random digits (e.g. 'P4821')."""
    return f"P{random.randint(1000, 9999)}"


class Player(Base, TimestampMixin):
    """
    Represents a player authenticated via Google Email Authentication.
    Supports role-based access ('admin' vs 'participant') and admin OpenAI API key storage.
    """
    __tablename__ = "players"

    id: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
        default=generate_player_id,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(32),
        default="participant",
        nullable=False,
    )
    google_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        unique=True,
        nullable=True,
        index=True,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
    )
    auth_provider: Mapped[str] = mapped_column(
        String(32),
        default="google",
        nullable=False,
    )
    openai_api_key: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
    )
    device_token: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )

    # Relationships
    rounds: Mapped[List["Round"]] = relationship(
        "Round",
        back_populates="player",
        cascade="all, delete-orphan",
    )
    game_stats: Mapped[List["PlayerGameStat"]] = relationship(
        "PlayerGameStat",
        back_populates="player",
        cascade="all, delete-orphan",
    )
    settings_updated: Mapped[List["AppSetting"]] = relationship(
        "AppSetting",
        back_populates="updated_by_player",
    )

    __table_args__ = (
        CheckConstraint(
            "role IN ('admin', 'participant')",
            name="chk_players_role",
        ),
        CheckConstraint(
            "auth_provider IN ('google', 'email')",
            name="chk_players_auth_provider",
        ),
    )

    def to_dict(self) -> dict:
        """Returns player dictionary matching frontend expected JSON schema."""
        games_dict = {}
        if hasattr(self, "game_stats") and self.game_stats:
            for stat in self.game_stats:
                g = stat.game or "prompt-mirror"
                if g not in games_dict:
                    games_dict[g] = {"solo": {"roundsPlayed": 0, "highScores": {}}}
                games_dict[g]["solo"]["roundsPlayed"] = max(
                    games_dict[g]["solo"]["roundsPlayed"],
                    stat.rounds_played,
                )
                games_dict[g]["solo"]["highScores"][str(stat.level)] = stat.high_score

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "googleId": self.google_id,
            "avatar": self.avatar_url,
            "authProvider": self.auth_provider,
            "hasApiKey": bool(self.openai_api_key),
            "createdAt": self.created_at.timestamp() if self.created_at else None,
            "games": games_dict,
        }

    def __repr__(self) -> str:
        return f"<Player id='{self.id}' email='{self.email}' role='{self.role}'>"

