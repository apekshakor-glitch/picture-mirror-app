"""FastAPI Router for Player Profiles and Game Stats.

Matches the exact contract expected by www/app.js.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.game_stat import PlayerGameStat
from app.models.player import Player, generate_player_id

router = APIRouter(prefix="/api/players", tags=["Players & Profiles"])


# --- Schemas ---

class PlayerLoginRequest(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    deviceToken: Optional[str] = None
    force: bool = False


class PlayerResolveRequest(BaseModel):
    name: str


class PlayerCreateRequest(BaseModel):
    name: str
    role: str = "participant"
    email: Optional[str] = None
    deviceToken: Optional[str] = None


class PlayerLogoutRequest(BaseModel):
    id: Optional[str] = None
    deviceToken: Optional[str] = None


class PlayerEventRequest(BaseModel):
    playerId: str
    game: str = "prompt-mirror"
    type: str = "solo"
    score: Optional[int] = None
    level: Optional[int] = 1
    won: Optional[bool] = None
    stageLabel: Optional[str] = None
    stageRank: Optional[int] = None


class PlayerRoleRequest(BaseModel):
    playerId: Optional[str] = None
    id: Optional[str] = None
    role: str = "participant"


class PlayerDeleteRequest(BaseModel):
    playerId: Optional[str] = None
    id: Optional[str] = None


# --- Endpoints ---

@router.get("")
def list_players(db: Session = Depends(get_db)):
    """List all registered players with their games/stats."""
    players = (
        db.query(Player)
        .options(joinedload(Player.game_stats))
        .order_by(Player.name.asc())
        .all()
    )
    return {"players": [p.to_dict() for p in players]}


@router.get("/{player_id}")
def get_player(player_id: str, db: Session = Depends(get_db)):
    """Fetch player details by ID or Name; auto-provisions if accessed by name."""
    clean_id = player_id.strip()
    p = (
        db.query(Player)
        .options(joinedload(Player.game_stats))
        .filter(Player.id == clean_id)
        .first()
    )
    if not p:
        p = (
            db.query(Player)
            .options(joinedload(Player.game_stats))
            .filter(Player.name.ilike(clean_id))
            .first()
        )
    if not p and clean_id:
        # Auto-provision player if accessed by new name
        pid = generate_player_id()
        p = Player(
            id=pid,
            name=clean_id,
            email=f"{clean_id.lower().replace(' ', '.')}@dari.ai",
            role="participant",
        )
        db.add(p)
        db.commit()
        db.refresh(p)

    if p:
        return {"ok": True, "player": p.to_dict()}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown player ID.")


@router.post("/login")
def login_player(payload: PlayerLoginRequest, db: Session = Depends(get_db)):
    """Sign in as player by ID or Name."""
    query_id = (payload.id or "").strip()
    p = None
    if query_id:
        p = (
            db.query(Player)
            .options(joinedload(Player.game_stats))
            .filter(Player.id.ilike(query_id))
            .first()
        )
    if not p and payload.name:
        p = (
            db.query(Player)
            .options(joinedload(Player.game_stats))
            .filter(Player.name.ilike(payload.name.strip()))
            .first()
        )

    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown player ID.")

    if payload.deviceToken:
        p.device_token = payload.deviceToken
    p.last_active_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    return {"ok": True, "status": "ok", "player": p.to_dict()}


@router.post("/resolve")
def resolve_player(payload: PlayerResolveRequest, db: Session = Depends(get_db)):
    """Finds an existing player by name or auto-provisions a new one."""
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name is required.")

    p = (
        db.query(Player)
        .options(joinedload(Player.game_stats))
        .filter(Player.name.ilike(name))
        .first()
    )
    if not p:
        pid = generate_player_id()
        p = Player(
            id=pid,
            name=name,
            email=f"{name.lower().replace(' ', '.')}@dari.ai",
            role="participant",
        )
        db.add(p)
        db.commit()
        db.refresh(p)

    return {"ok": True, "player": p.to_dict()}


@router.post("/create")
def create_player(payload: PlayerCreateRequest, db: Session = Depends(get_db)):
    """Explicitly creates a new player profile."""
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name is required.")

    valid_role = "admin" if payload.role == "admin" else "participant"
    email = payload.email.strip().lower() if payload.email else f"{name.lower().replace(' ', '.')}@dari.ai"

    # Ensure unique email if collision
    existing = db.query(Player).filter(Player.email == email).first()
    if existing:
        email = f"{name.lower().replace(' ', '.')}.{generate_player_id().lower()}@dari.ai"

    p = Player(
        id=generate_player_id(),
        name=name,
        email=email,
        role=valid_role,
        device_token=payload.deviceToken,
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    return {"ok": True, "player": p.to_dict()}


@router.post("/logout")
def logout_player(payload: Optional[PlayerLogoutRequest] = None):
    """Acknowledge player logout."""
    return {"ok": True}


@router.post("/event")
def record_event(payload: PlayerEventRequest, db: Session = Depends(get_db)):
    """Records gameplay event, updates rounds played and level high score."""
    pid = payload.playerId.strip()
    p = db.get(Player, pid)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found.")

    game_name = payload.game or "prompt-mirror"
    level_num = payload.level or 1
    score_val = max(0, min(100, int(payload.score or 0)))

    # Find or create stat record
    stat = (
        db.query(PlayerGameStat)
        .filter(
            PlayerGameStat.player_id == p.id,
            PlayerGameStat.game == game_name,
            PlayerGameStat.level == level_num,
        )
        .first()
    )
    if not stat:
        stat = PlayerGameStat(
            player_id=p.id,
            game=game_name,
            level=level_num,
            rounds_played=1,
            high_score=score_val,
        )
        db.add(stat)
    else:
        stat.rounds_played += 1
        stat.high_score = max(stat.high_score, score_val)

    p.last_active_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(p)

    return {"ok": True, "player": p.to_dict()}


@router.post("/role")
def update_role(payload: PlayerRoleRequest, db: Session = Depends(get_db)):
    """Toggles player role between 'admin' and 'participant'."""
    pid = (payload.playerId or payload.id or "").strip()
    p = db.get(Player, pid)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found.")

    p.role = "admin" if payload.role == "admin" else "participant"
    db.commit()
    db.refresh(p)

    return {"ok": True, "player": p.to_dict()}


@router.post("/delete")
def delete_player(payload: PlayerDeleteRequest, db: Session = Depends(get_db)):
    """Deletes a player profile and associated stats."""
    pid = (payload.playerId or payload.id or "").strip()
    p = db.get(Player, pid)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found.")

    db.delete(p)
    db.commit()
    return {"ok": True}

