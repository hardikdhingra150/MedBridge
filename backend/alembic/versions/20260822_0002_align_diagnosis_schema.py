"""Align the legacy diagnosis table with its SQLAlchemy model.

Revision ID: 20260822_0002
Revises: 20260822_0001
Create Date: 2026-08-22
"""
from alembic import op
import sqlalchemy as sa


revision = "20260822_0002"
down_revision = "20260822_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {
        column["name"]
        for column in inspector.get_columns("diagnoses")
    }
    if "created_at" not in columns:
        op.add_column(
            "diagnoses",
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
        )

    indexes = {
        index["name"]
        for index in inspector.get_indexes("diagnoses")
    }
    if "ix_diagnoses_patient_id" not in indexes:
        op.create_index(
            "ix_diagnoses_patient_id",
            "diagnoses",
            ["patient_id"],
        )


def downgrade() -> None:
    op.drop_index("ix_diagnoses_patient_id", table_name="diagnoses")
