"""Add game schema tables: players, app_settings, player_game_stats, challenges, rounds, attempts, results, jobs.

Revision ID: 002_game_schema
Revises: 001_initial_pictures
Create Date: 2026-11-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "002_game_schema"
down_revision: Union[str, None] = "001_initial_pictures"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # Check if existing players table has old UUID primary key; if so, replace it
    if "players" in existing_tables:
        cols = {c["name"]: str(c["type"]).lower() for c in inspector.get_columns("players")}
        if "uuid" in cols.get("id", ""):
            op.execute("DROP TABLE IF EXISTS players CASCADE")
            existing_tables.remove("players")

    # 1. players table (Google Email Authentication & Role-Based Access)
    if "players" not in existing_tables:
        op.create_table(
            "players",
            sa.Column("id", sa.String(length=64), primary_key=True, nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("name", sa.String(length=128), nullable=False),
            sa.Column("role", sa.String(length=32), server_default="participant", nullable=False),
            sa.Column("google_id", sa.String(length=128), nullable=True),
            sa.Column("avatar_url", sa.String(length=512), nullable=True),
            sa.Column("auth_provider", sa.String(length=32), server_default="google", nullable=False),
            sa.Column("openai_api_key", sa.String(length=512), nullable=True),
            sa.Column("device_token", sa.String(length=128), nullable=True),
            sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("last_active_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("email", name="uq_players_email"),
            sa.UniqueConstraint("google_id", name="uq_players_google_id"),
            sa.CheckConstraint("role IN ('admin', 'participant')", name="chk_players_role"),
            sa.CheckConstraint("auth_provider IN ('google', 'email')", name="chk_players_auth_provider"),
        )
        op.create_index("idx_players_email", "players", ["email"])
        op.create_index("idx_players_google_id", "players", ["google_id"])
        op.create_index("idx_players_last_active_at", "players", ["last_active_at"])
    else:
        # Table exists with correct type - check and add missing columns
        existing_cols = {c["name"] for c in inspector.get_columns("players")}
        if "google_id" not in existing_cols:
            op.add_column("players", sa.Column("google_id", sa.String(length=128), nullable=True))
        if "avatar_url" not in existing_cols:
            op.add_column("players", sa.Column("avatar_url", sa.String(length=512), nullable=True))
        if "auth_provider" not in existing_cols:
            op.add_column("players", sa.Column("auth_provider", sa.String(length=32), server_default="google", nullable=False))
        if "openai_api_key" not in existing_cols:
            op.add_column("players", sa.Column("openai_api_key", sa.String(length=512), nullable=True))
        if "device_token" not in existing_cols:
            op.add_column("players", sa.Column("device_token", sa.String(length=128), nullable=True))
        if "is_active" not in existing_cols:
            op.add_column("players", sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False))
        if "last_active_at" not in existing_cols:
            op.add_column("players", sa.Column("last_active_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # 2. app_settings table (Global settings & Admin OpenAI API Key storage)
    if "app_settings" not in existing_tables:
        op.create_table(
            "app_settings",
            sa.Column("key", sa.String(length=64), primary_key=True, nullable=False),
            sa.Column("value", sa.Text(), nullable=False),
            sa.Column("is_secret", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("updated_by_player_id", sa.String(length=64), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["updated_by_player_id"], ["players.id"], ondelete="SET NULL", name="fk_settings_player_id"),
        )

    # 3. player_game_stats table (Solo rounds played & high scores per level)
    if "player_game_stats" not in existing_tables:
        op.create_table(
            "player_game_stats",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("player_id", sa.String(length=64), nullable=False),
            sa.Column("game", sa.String(length=64), server_default="prompt-mirror", nullable=False),
            sa.Column("level", sa.Integer(), server_default="1", nullable=False),
            sa.Column("rounds_played", sa.Integer(), server_default="0", nullable=False),
            sa.Column("high_score", sa.Integer(), server_default="0", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE", name="fk_game_stats_player_id"),
            sa.UniqueConstraint("player_id", "game", "level", name="uq_player_game_level"),
            sa.CheckConstraint("rounds_played >= 0", name="chk_game_stats_rounds"),
            sa.CheckConstraint("high_score >= 0 AND high_score <= 100", name="chk_game_stats_score"),
        )
        op.create_index("idx_game_stats_player", "player_game_stats", ["player_id"])

    # 4. challenges table (Picture Mirror reference targets)
    if "challenges" not in existing_tables:
        op.create_table(
            "challenges",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("theme", sa.String(length=64), nullable=False),
            sa.Column("difficulty", sa.String(length=16), nullable=False),
            sa.Column("title", sa.String(length=128), nullable=False),
            sa.Column("reference_image_s3_key", sa.String(length=512), nullable=False),
            sa.Column("metadata_json", sa.JSON(), nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.CheckConstraint("difficulty IN ('easy', 'medium', 'hard')", name="chk_challenges_difficulty"),
            sa.UniqueConstraint("reference_image_s3_key", name="uq_challenges_s3_key"),
        )
        op.create_index(
            "idx_challenges_theme_diff_active",
            "challenges",
            ["theme", "difficulty", "is_active"],
        )

    # 5. rounds table (Game session between Player and Challenge)
    if "rounds" not in existing_tables:
        op.create_table(
            "rounds",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("player_id", sa.String(length=64), nullable=False),
            sa.Column("challenge_id", sa.Uuid(as_uuid=True), nullable=False),
            sa.Column("selected_difficulty", sa.String(length=16), nullable=False),
            sa.Column("status", sa.String(length=32), server_default="created", nullable=False),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["player_id"], ["players.id"], ondelete="CASCADE", name="fk_rounds_player_id"),
            sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT", name="fk_rounds_challenge_id"),
            sa.CheckConstraint("selected_difficulty IN ('easy', 'medium', 'hard')", name="chk_rounds_selected_difficulty"),
            sa.CheckConstraint("status IN ('created', 'in_progress', 'completed', 'abandoned')", name="chk_rounds_status"),
        )
        op.create_index("idx_rounds_player_created", "rounds", ["player_id", "created_at"])
        op.create_index("idx_rounds_challenge_id", "rounds", ["challenge_id"])

    # 6. attempts table (Player prompt and generated image S3 key)
    if "attempts" not in existing_tables:
        op.create_table(
            "attempts",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("round_id", sa.Uuid(as_uuid=True), nullable=False),
            sa.Column("prompt_text", sa.Text(), nullable=False),
            sa.Column("generated_image_s3_key", sa.String(length=512), nullable=True),
            sa.Column("generation_status", sa.String(length=32), server_default="pending", nullable=False),
            sa.Column("status", sa.String(length=32), server_default="submitted", nullable=False),
            sa.Column("retry_count", sa.Integer(), server_default="0", nullable=False),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["round_id"], ["rounds.id"], ondelete="CASCADE", name="fk_attempts_round_id"),
            sa.CheckConstraint("generation_status IN ('pending', 'processing', 'completed', 'failed')", name="chk_attempts_generation_status"),
            sa.CheckConstraint("status IN ('submitted', 'generating', 'judging', 'completed', 'failed')", name="chk_attempts_status"),
            sa.CheckConstraint("retry_count >= 0", name="chk_attempts_retry_count"),
        )
        op.create_index("idx_attempts_round_created", "attempts", ["round_id", "created_at"])

    # 7. results table (AI judging score, category, feedback)
    if "results" not in existing_tables:
        op.create_table(
            "results",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("attempt_id", sa.Uuid(as_uuid=True), nullable=False),
            sa.Column("retry_sequence", sa.Integer(), server_default="0", nullable=False),
            sa.Column("score", sa.Integer(), nullable=True),
            sa.Column("score_category", sa.String(length=16), nullable=True),
            sa.Column("feedback", sa.Text(), nullable=True),
            sa.Column("ai_provider", sa.String(length=64), nullable=False),
            sa.Column("model_name", sa.String(length=64), nullable=False),
            sa.Column("model_version", sa.String(length=64), nullable=False),
            sa.Column("rubric_version", sa.String(length=32), nullable=False),
            sa.Column("usage_metadata", sa.JSON(), nullable=False),
            sa.Column("judging_status", sa.String(length=32), server_default="pending", nullable=False),
            sa.Column("error_details", sa.JSON(), nullable=True),
            sa.Column("is_current", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("judged_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["attempt_id"], ["attempts.id"], ondelete="CASCADE", name="fk_results_attempt_id"),
            sa.CheckConstraint("score IS NULL OR (score >= 0 AND score <= 100)", name="chk_results_score_range"),
            sa.CheckConstraint("score_category IS NULL OR score_category IN ('Green', 'Amber', 'Red')", name="chk_results_score_category"),
            sa.CheckConstraint("judging_status IN ('pending', 'processing', 'completed', 'failed')", name="chk_results_judging_status"),
            sa.CheckConstraint(
                "(judging_status = 'completed' AND score IS NOT NULL AND feedback IS NOT NULL AND score_category IS NOT NULL) OR "
                "(judging_status IN ('pending', 'processing') AND score IS NULL) OR "
                "(judging_status = 'failed' AND score IS NULL)",
                name="chk_results_failure_not_zero",
            ),
            sa.CheckConstraint(
                "score IS NULL OR ("
                "(score >= 70 AND score_category = 'Green') OR "
                "(score >= 40 AND score < 70 AND score_category = 'Amber') OR "
                "(score >= 0 AND score < 40 AND score_category = 'Red')"
                ")",
                name="chk_results_category_score_alignment",
            ),
            sa.UniqueConstraint("attempt_id", "retry_sequence", name="uq_results_attempt_retry"),
        )
        op.create_index("idx_results_attempt_id", "results", ["attempt_id"])
        op.create_index("idx_results_judging_status", "results", ["judging_status"])

    # 8. jobs table (Asynchronous background Celery / SQS tasks)
    if "jobs" not in existing_tables:
        op.create_table(
            "jobs",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("job_type", sa.String(length=32), nullable=False),
            sa.Column("status", sa.String(length=32), server_default="queued", nullable=False),
            sa.Column("attempt_id", sa.Uuid(as_uuid=True), nullable=True),
            sa.Column("challenge_id", sa.Uuid(as_uuid=True), nullable=True),
            sa.Column("celery_task_id", sa.String(length=128), nullable=True),
            sa.Column("retry_count", sa.Integer(), server_default="0", nullable=False),
            sa.Column("max_retries", sa.Integer(), server_default="3", nullable=False),
            sa.Column("error_details", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["attempt_id"], ["attempts.id"], ondelete="CASCADE", name="fk_jobs_attempt_id"),
            sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="CASCADE", name="fk_jobs_challenge_id"),
            sa.CheckConstraint("job_type IN ('image_generation', 'image_judging', 'scoring_retry')", name="chk_jobs_job_type"),
            sa.CheckConstraint("status IN ('queued', 'running', 'completed', 'failed', 'retrying', 'cancelled')", name="chk_jobs_status"),
            sa.CheckConstraint(
                "(attempt_id IS NOT NULL AND challenge_id IS NULL) OR (attempt_id IS NULL AND challenge_id IS NOT NULL)",
                name="chk_jobs_target_entity",
            ),
            sa.CheckConstraint("retry_count >= 0 AND max_retries >= 0", name="chk_jobs_retry_counts"),
            sa.UniqueConstraint("celery_task_id", name="uq_jobs_celery_task_id"),
        )
        op.create_index("idx_jobs_status_type_created", "jobs", ["status", "job_type", "created_at"])


def downgrade() -> None:
    op.drop_table("jobs")
    op.drop_table("results")
    op.drop_table("attempts")
    op.drop_table("rounds")
    op.drop_table("challenges")
    op.drop_table("player_game_stats")
    op.drop_table("app_settings")
    op.drop_table("players")
