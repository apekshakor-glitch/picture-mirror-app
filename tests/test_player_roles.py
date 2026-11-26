"""Unit tests for Player Roles and Admin Conversion Security."""

import pytest
from fastapi import HTTPException

from app.api.routes.auth import signup, SignupRequest
from app.api.routes.players import (
    create_player,
    update_role,
    PlayerCreateRequest,
    PlayerRoleRequest,
)
from app.models.player import Player


class MockPlayerDB:
    def __init__(self, players=None):
        self.players = list(players or [])

    def query(self, model):
        db_self = self

        class QueryMock:
            def __init__(self, items):
                self._items = items

            def options(self, *args):
                return self

            def filter(self, *criteria):
                return self

            def order_by(self, *args):
                return self

            def all(self):
                return db_self.players

            def first(self):
                return db_self.players[0] if db_self.players else None

        return QueryMock(self.players)

    def get(self, model, item_id):
        clean_id = str(item_id).strip().lower()
        for p in self.players:
            if str(p.id).strip().lower() == clean_id:
                return p
        return None

    def add(self, item):
        if item not in self.players:
            self.players.append(item)

    def commit(self):
        pass

    def refresh(self, item):
        pass

    def flush(self):
        pass


def test_create_player_always_defaults_to_participant():
    """When creating a profile, role must always be 'participant' even if 'admin' is sent."""
    db = MockPlayerDB()
    res = create_player(PlayerCreateRequest(name="Alice", role="admin"), db=db)
    assert res["ok"] is True
    assert res["player"]["role"] == "participant"


def test_auth_signup_always_defaults_to_participant():
    """Self-signup through /api/auth/signup must strictly create a participant."""
    db = MockPlayerDB()
    res = signup(
        SignupRequest(name="Bob", email="bob@test.com", role="admin"),
        db=db,
    )
    assert res["ok"] is True
    assert res["player"]["role"] == "participant"


def test_update_role_forbidden_without_admin_id():
    """Updating role without providing an adminPlayerId must raise 403."""
    db = MockPlayerDB([Player(id="P1", name="Target", email="target@test.com", role="participant")])
    with pytest.raises(HTTPException) as excinfo:
        update_role(PlayerRoleRequest(playerId="P1", role="admin"), db=db)
    assert excinfo.value.status_code == 403
    assert "Permission denied" in excinfo.value.detail


def test_update_role_forbidden_if_caller_is_participant():
    """A participant attempting to promote someone or themselves must raise 403."""
    caller = Player(id="P2", name="Caller", email="caller@test.com", role="participant")
    target = Player(id="P1", name="Target", email="target@test.com", role="participant")
    db = MockPlayerDB([caller, target])
    with pytest.raises(HTTPException) as excinfo:
        update_role(PlayerRoleRequest(playerId="P1", role="admin", adminPlayerId="P2"), db=db)
    assert excinfo.value.status_code == 403
    assert "Permission denied" in excinfo.value.detail


def test_update_role_succeeds_when_caller_is_admin():
    """An admin created via database can successfully convert other players to admin and participant."""
    admin = Player(id="P9", name="Super Admin", email="admin@test.com", role="admin")
    target = Player(id="P1", name="Target", email="target@test.com", role="participant")
    db = MockPlayerDB([admin, target])

    # Promote to admin
    res = update_role(PlayerRoleRequest(playerId="P1", role="admin", adminPlayerId="P9"), db=db)
    assert res["ok"] is True
    assert res["player"]["role"] == "admin"

    # Demote back to participant
    res2 = update_role(PlayerRoleRequest(playerId="P1", role="participant", adminPlayerId="P9"), db=db)
    assert res2["ok"] is True
    assert res2["player"]["role"] == "participant"
