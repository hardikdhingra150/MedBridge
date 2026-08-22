"""Add terminology releases, import jobs, and provenance.

Revision ID: 20260822_0001
Revises:
Create Date: 2026-08-22
"""
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260822_0001"
down_revision = None
branch_labels = None
depends_on = None


def _backfill_releases(
    bind,
    term_table: str,
    system: str,
) -> None:
    versions = list(
        bind.execute(
            sa.text(
                f"SELECT DISTINCT version FROM {term_table} "
                "WHERE version IS NOT NULL ORDER BY version"
            )
        ).scalars()
    )
    for index, version in enumerate(versions):
        release_id = uuid.uuid4()
        bind.execute(
            sa.text(
                "INSERT INTO terminology_releases "
                "(id, system, version, source_name, source_type, "
                "is_active, imported_by) "
                "VALUES (:id, :system, :version, :source_name, "
                ":source_type, :is_active, :imported_by)"
            ),
            {
                "id": release_id,
                "system": system,
                "version": version,
                "source_name": "Legacy MedBridge data",
                "source_type": "DEMO",
                "is_active": index == len(versions) - 1,
                "imported_by": "PHASE_8_MIGRATION",
            },
        )
        bind.execute(
            sa.text(
                f"UPDATE {term_table} SET release_id = :release_id "
                "WHERE version = :version"
            ),
            {"release_id": release_id, "version": version},
        )


def upgrade() -> None:
    op.create_table(
        "terminology_releases",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("system", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("source_name", sa.String(), nullable=False),
        sa.Column("source_type", sa.String(), nullable=False),
        sa.Column("source_uri", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column(
            "imported_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("imported_by", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "system",
            "version",
            name="uq_terminology_release_system_version",
        ),
    )
    op.create_index(
        "ix_terminology_releases_system",
        "terminology_releases",
        ["system"],
    )
    op.create_index(
        "uq_terminology_release_active_system",
        "terminology_releases",
        ["system"],
        unique=True,
        postgresql_where=sa.text("is_active"),
    )

    op.create_table(
        "import_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("release_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("terminology_system", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("source_name", sa.String(), nullable=False),
        sa.Column("imported_by", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("total_rows", sa.Integer(), nullable=False),
        sa.Column("imported_rows", sa.Integer(), nullable=False),
        sa.Column("rejected_rows", sa.Integer(), nullable=False),
        sa.Column("error_report", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["release_id"],
            ["terminology_releases.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_import_jobs_release_id", "import_jobs", ["release_id"])

    op.add_column(
        "namaste_terms",
        sa.Column("release_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column("namaste_terms", sa.Column("synonyms", sa.Text(), nullable=True))
    op.add_column(
        "icd_terms",
        sa.Column("release_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column("icd_terms", sa.Column("synonyms", sa.Text(), nullable=True))

    bind = op.get_bind()
    _backfill_releases(bind, "namaste_terms", "NAMASTE")
    _backfill_releases(bind, "icd_terms", "ICD11-TM2")

    op.alter_column("namaste_terms", "release_id", nullable=False)
    op.alter_column("icd_terms", "release_id", nullable=False)
    op.create_foreign_key(
        "fk_namaste_terms_release_id",
        "namaste_terms",
        "terminology_releases",
        ["release_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_icd_terms_release_id",
        "icd_terms",
        "terminology_releases",
        ["release_id"],
        ["id"],
    )
    op.drop_constraint("namaste_terms_code_key", "namaste_terms", type_="unique")
    op.drop_constraint("icd_terms_code_key", "icd_terms", type_="unique")
    op.create_unique_constraint(
        "uq_namaste_release_code",
        "namaste_terms",
        ["release_id", "code"],
    )
    op.create_unique_constraint(
        "uq_icd_release_code",
        "icd_terms",
        ["release_id", "code"],
    )
    op.create_index("ix_namaste_terms_release_id", "namaste_terms", ["release_id"])
    op.create_index("ix_icd_terms_release_id", "icd_terms", ["release_id"])
    op.create_index("ix_namaste_terms_code", "namaste_terms", ["code"])
    op.create_index("ix_icd_terms_code", "icd_terms", ["code"])
    op.create_index("ix_namaste_terms_display", "namaste_terms", ["display"])
    op.create_index("ix_icd_terms_display", "icd_terms", ["display"])
    op.drop_column("namaste_terms", "version")
    op.drop_column("icd_terms", "version")

    for table in ("concept_maps", "mapping_candidates"):
        op.add_column(
            table,
            sa.Column("source_release_id", postgresql.UUID(as_uuid=True), nullable=True),
        )
        op.add_column(
            table,
            sa.Column("target_release_id", postgresql.UUID(as_uuid=True), nullable=True),
        )

    op.add_column("concept_maps", sa.Column("reviewed_by", sa.String(), nullable=True))
    op.add_column(
        "concept_maps",
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column("concept_maps", sa.Column("review_comment", sa.Text(), nullable=True))
    op.add_column(
        "concept_maps",
        sa.Column(
            "mapping_method",
            sa.String(),
            server_default="EXPERT_REVIEW",
            nullable=False,
        ),
    )
    op.add_column(
        "mapping_candidates",
        sa.Column("definition_score", sa.Float(), nullable=True),
    )
    op.add_column(
        "mapping_candidates",
        sa.Column(
            "algorithm_version",
            sa.String(),
            server_default="lexical-v1",
            nullable=False,
        ),
    )

    bind.execute(
        sa.text(
            "UPDATE concept_maps cm SET "
            "source_release_id = nt.release_id, "
            "target_release_id = it.release_id "
            "FROM namaste_terms nt, icd_terms it "
            "WHERE cm.namaste_term_id = nt.id AND cm.icd_term_id = it.id"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE mapping_candidates mc SET "
            "source_release_id = nt.release_id, "
            "target_release_id = it.release_id "
            "FROM namaste_terms nt, icd_terms it "
            "WHERE mc.namaste_term_id = nt.id AND mc.icd_term_id = it.id"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE concept_maps SET mapping_method = CASE "
            "WHEN source = 'DEMO' THEN 'DEMO' "
            "WHEN source = 'EXPERT_REVIEW' THEN 'EXPERT_REVIEW' "
            "ELSE 'MANUAL_CURATED' END"
        )
    )
    bind.execute(
        sa.text(
            "UPDATE concept_maps cm SET reviewed_by = mc.reviewed_by, "
            "reviewed_at = mc.reviewed_at "
            "FROM mapping_candidates mc "
            "WHERE cm.namaste_term_id = mc.namaste_term_id "
            "AND cm.icd_term_id = mc.icd_term_id "
            "AND cm.source = 'EXPERT_REVIEW' AND mc.status = 'APPROVED'"
        )
    )

    for table in ("concept_maps", "mapping_candidates"):
        op.alter_column(table, "source_release_id", nullable=False)
        op.alter_column(table, "target_release_id", nullable=False)
        op.create_foreign_key(
            f"fk_{table}_source_release_id",
            table,
            "terminology_releases",
            ["source_release_id"],
            ["id"],
        )
        op.create_foreign_key(
            f"fk_{table}_target_release_id",
            table,
            "terminology_releases",
            ["target_release_id"],
            ["id"],
        )
        op.create_index(
            f"ix_{table}_source_release_id",
            table,
            ["source_release_id"],
        )
        op.create_index(
            f"ix_{table}_target_release_id",
            table,
            ["target_release_id"],
        )


def downgrade() -> None:
    raise RuntimeError(
        "This migration preserves multiple releases and cannot be safely downgraded "
        "to globally unique terminology codes. Restore from backup if required."
    )
