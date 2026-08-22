"""Prevent duplicate verified mappings and pending candidates.

Revision ID: 20260822_0003
Revises: 20260822_0002
Create Date: 2026-08-22
"""
from alembic import op
import sqlalchemy as sa


revision = "20260822_0003"
down_revision = "20260822_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    bind.execute(
        sa.text(
            "WITH ranked AS ("
            " SELECT id, row_number() OVER ("
            " PARTITION BY namaste_term_id, icd_term_id"
            " ORDER BY CASE WHEN source = 'EXPERT_REVIEW' THEN 0 ELSE 1 END,"
            " reviewed_at DESC NULLS LAST, id"
            " ) AS position"
            " FROM concept_maps WHERE status = 'VERIFIED'"
            ") UPDATE concept_maps SET status = 'SUPERSEDED'"
            " FROM ranked WHERE concept_maps.id = ranked.id"
            " AND ranked.position > 1"
        )
    )
    bind.execute(
        sa.text(
            "WITH ranked AS ("
            " SELECT id, row_number() OVER ("
            " PARTITION BY namaste_term_id, icd_term_id"
            " ORDER BY created_at DESC NULLS LAST, id"
            " ) AS position"
            " FROM mapping_candidates WHERE status = 'PENDING'"
            ") UPDATE mapping_candidates SET status = 'SUPERSEDED'"
            " FROM ranked WHERE mapping_candidates.id = ranked.id"
            " AND ranked.position > 1"
        )
    )

    op.create_index(
        "uq_verified_concept_map_pair",
        "concept_maps",
        ["namaste_term_id", "icd_term_id"],
        unique=True,
        postgresql_where=sa.text("status = 'VERIFIED'"),
    )
    op.create_index(
        "uq_pending_mapping_candidate_pair",
        "mapping_candidates",
        ["namaste_term_id", "icd_term_id"],
        unique=True,
        postgresql_where=sa.text("status = 'PENDING'"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_pending_mapping_candidate_pair",
        table_name="mapping_candidates",
    )
    op.drop_index(
        "uq_verified_concept_map_pair",
        table_name="concept_maps",
    )
