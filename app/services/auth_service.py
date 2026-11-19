"""Authentication and API Key Management Service for DaRI AI.

Implements Google Email Authentication, user provisioning, and Admin OpenAI API Key storage.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.models.player import Player, generate_player_id
from app.models.app_setting import AppSetting


def get_player_by_email(db: Session, email: str) -> Optional[Player]:
    """Finds a player by email (case-insensitive)."""
    if not email:
        return None
    clean_email = email.strip().lower()
    return db.query(Player).filter(Player.email.ilike(clean_email)).first()


def get_player_by_id(db: Session, player_id: str) -> Optional[Player]:
    """Finds a player by ID (e.g. 'P1234')."""
    if not player_id:
        return None
    return db.get(Player, player_id.strip())


def authenticate_google_user(
    db: Session,
    email: str,
    name: Optional[str] = None,
    google_id: Optional[str] = None,
    avatar_url: Optional[str] = None,
    role: str = "participant",
    auto_create: bool = True,
) -> Dict[str, Any]:
    """
    Handles Google Email Authentication milestone:
    1. Checks if the email already exists in the database.
    2. If it exists: allows user to enter homescreen, updates last_active_at.
    3. If it is a new email: creates a new user ID (e.g. 'P4821') and stores user and email in PostgreSQL.
    """
    clean_email = (email or "").strip().lower()
    if not clean_email or "@" not in clean_email:
        return {"ok": False, "error": "A valid Google email address is required."}

    # 1. Check existing player by email or google_id
    player = get_player_by_email(db, clean_email)
    if not player and google_id:
        player = db.query(Player).filter(Player.google_id == google_id).first()

    if player:
        # Existing user -> Update profile info and last active time
        if google_id and not player.google_id:
            player.google_id = google_id
        if avatar_url and not player.avatar_url:
            player.avatar_url = avatar_url
        if name and not player.name:
            player.name = name
        player.last_active_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(player)

        return {
            "ok": True,
            "is_new": False,
            "player": player.to_dict(),
            "message": f"Welcome back, {player.name}!",
        }

    # 2. User does not exist -> Create new user id and store in database
    if auto_create:
        display_name = name or clean_email.split("@")[0].replace(".", " ").title()
        new_player = Player(
            id=generate_player_id(),
            email=clean_email,
            name=display_name,
            role=role if role in ("admin", "participant") else "participant",
            google_id=google_id,
            avatar_url=avatar_url,
            auth_provider="google",
        )
        db.add(new_player)
        db.commit()
        db.refresh(new_player)

        return {
            "ok": True,
            "is_new": True,
            "player": new_player.to_dict(),
            "message": f"New user created successfully for {new_player.name}.",
        }

    # If caller requested two-stage onboarding
    return {
        "ok": True,
        "is_new": True,
        "google_user": {
            "name": name or clean_email.split("@")[0].title(),
            "email": clean_email,
            "google_id": google_id,
            "avatar": avatar_url or "",
        },
    }


def register_player(
    db: Session,
    name: str,
    email: str,
    role: str = "participant",
    google_id: Optional[str] = None,
    avatar_url: Optional[str] = None,
    device_token: Optional[str] = None,
    openai_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Registers a new player with explicit role ('admin' | 'participant')
    and optional OpenAI API Key if role is admin.
    """
    clean_email = (email or "").strip().lower()
    clean_name = (name or "").strip()

    if not clean_email or "@" not in clean_email:
        return {"ok": False, "error": "Valid email is required."}
    if not clean_name:
        return {"ok": False, "error": "Name is required."}

    # Check duplicate
    existing = get_player_by_email(db, clean_email)
    if existing:
        return {
            "ok": False,
            "error": "An account with this email already exists.",
            "is_new": False,
            "player": existing.to_dict(),
        }

    valid_role = "admin" if role == "admin" else "participant"

    new_player = Player(
        id=generate_player_id(),
        email=clean_email,
        name=clean_name,
        role=valid_role,
        google_id=google_id,
        avatar_url=avatar_url,
        device_token=device_token,
        auth_provider="google" if google_id else "email",
    )

    db.add(new_player)
    db.flush()

    # If admin role and API key is provided, store the OpenAI API Key
    if valid_role == "admin" and openai_api_key:
        clean_key = openai_api_key.strip()
        new_player.openai_api_key = clean_key
        # Also store in app_settings for global backend use
        save_api_key(db, clean_key, admin_player=new_player)

    db.commit()
    db.refresh(new_player)

    return {
        "ok": True,
        "player": new_player.to_dict(),
    }


def save_api_key(
    db: Session,
    api_key: str,
    admin_player_id: Optional[str] = None,
    admin_player: Optional[Player] = None,
) -> Dict[str, Any]:
    """
    Stores the OpenAI API Key in the database (app_settings and admin player record).
    Validates that only users with the 'admin' role can save or update the API key.
    """
    clean_key = (api_key or "").strip()
    if not clean_key:
        return {"ok": False, "error": "API key cannot be empty."}

    # Check admin privileges if a player is performing the action
    admin = admin_player
    if not admin and admin_player_id:
        admin = get_player_by_id(db, admin_player_id)
        if not admin:
            return {"ok": False, "error": "Admin player not found."}
        if admin.role != "admin":
            return {"ok": False, "error": "Permission denied: Only admin users can configure API keys."}

    # 1. Update or create global AppSetting
    setting = db.get(AppSetting, "openai_api_key")
    if not setting:
        setting = AppSetting(
            key="openai_api_key",
            value=clean_key,
            is_secret=True,
            updated_by_player_id=admin.id if admin else None,
        )
        db.add(setting)
    else:
        setting.value = clean_key
        setting.updated_by_player_id = admin.id if admin else None
        setting.updated_at = datetime.now(timezone.utc)

    # 2. Also record key on admin player if provided
    if admin:
        admin.openai_api_key = clean_key

    db.commit()
    return {"ok": True, "message": "OpenAI API Key successfully saved in database."}


def get_api_key(db: Session) -> Dict[str, Any]:
    """
    Retrieves whether an OpenAI API Key exists in the database.
    Matches frontend GET /api/key endpoint schema.
    """
    setting = db.get(AppSetting, "openai_api_key")
    if setting and setting.value:
        return {"ok": True, "has_key": True, "api_key": setting.value}
    return {"ok": True, "has_key": False, "api_key": ""}


def clear_api_key(db: Session, admin_player_id: Optional[str] = None) -> Dict[str, Any]:
    """Clears the OpenAI API Key from the database."""
    if admin_player_id:
        admin = get_player_by_id(db, admin_player_id)
        if admin and admin.role != "admin":
            return {"ok": False, "error": "Permission denied: Only admin users can clear the API key."}
        if admin:
            admin.openai_api_key = None

    setting = db.get(AppSetting, "openai_api_key")
    if setting:
        db.delete(setting)
        db.commit()

    return {"ok": True, "message": "API Key cleared."}

