"""FastAPI Router for Arcade Tournaments.

Stores and manages tournament brackets and multiplayer events.
Matches the exact contract expected by www/app.js.
"""

import json
import random
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.app_setting import AppSetting

router = APIRouter(prefix="/api/tournaments", tags=["Tournaments"])


# --- Schemas ---

class TournamentCreateRequest(BaseModel):
    name: Optional[str] = "Tournament"
    game: Optional[str] = "prompt-mirror"
    bracket: Optional[List[Any]] = []
    players: Optional[Dict[str, Any]] = {}
    levels: Optional[List[int]] = [1]


# --- Helper to load and save tournament data in PostgreSQL ---

def _get_tournaments_dict(db: Session) -> Dict[str, Any]:
    setting = db.get(AppSetting, "arcade_tournaments")
    if setting and setting.value:
        try:
            return json.loads(setting.value)
        except Exception:
            return {}
    return {}


def _save_tournaments_dict(db: Session, data: Dict[str, Any]) -> None:
    setting = db.get(AppSetting, "arcade_tournaments")
    raw_json = json.dumps(data)
    if not setting:
        setting = AppSetting(
            key="arcade_tournaments",
            value=raw_json,
            is_secret=False,
        )
        db.add(setting)
    else:
        setting.value = raw_json
    db.commit()


# --- Endpoints ---

@router.get("")
def list_tournaments(game: Optional[str] = None, db: Session = Depends(get_db)):
    """List tournaments, optionally filtered by game."""
    t_dict = _get_tournaments_dict(db)
    tournaments = list(t_dict.values())
    if game:
        tournaments = [t for t in tournaments if t.get("game") == game]
    return {"tournaments": tournaments}


@router.post("/create")
def create_tournament(payload: TournamentCreateRequest, db: Session = Depends(get_db)):
    """Create a new tournament bracket."""
    t_dict = _get_tournaments_dict(db)
    tid = f"T{random.randint(1000, 9999)}"
    tournament = {
        "id": tid,
        "name": payload.name or "Tournament",
        "game": payload.game or "prompt-mirror",
        "createdAt": time.time(),
        "status": "ready",
        "bracket": payload.bracket or [],
        "players": payload.players or {},
        "levels": payload.levels or [1],
    }
    t_dict[tid] = tournament
    _save_tournaments_dict(db, t_dict)

    return {"ok": True, "tournament": tournament}


@router.get("/{tournament_id}")
def get_tournament(tournament_id: str, db: Session = Depends(get_db)):
    """Get tournament details by ID."""
    t_dict = _get_tournaments_dict(db)
    tournament = t_dict.get(tournament_id.strip())
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found.")
    return {"ok": True, "tournament": tournament}

