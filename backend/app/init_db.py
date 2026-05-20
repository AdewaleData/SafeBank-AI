import logging

from sqlalchemy import text

from app.database import Base, engine

logger = logging.getLogger("safebank.init_db")

# Import all models so their metadata is registered on Base before create_all
import app.models.tables  # noqa: F401

# PostgreSQL enum types (models use create_type=False — we create enums manually).
_ENUM_TYPES: list[tuple[str, list[str]]] = [
    ("Role", ["USER", "ADMIN"]),
    ("TransactionType", ["TRANSFER", "DEPOSIT", "WITHDRAWAL", "BILL_PAYMENT"]),
    ("TransactionStatus", ["PENDING", "COMPLETED", "FAILED", "FLAGGED"]),
    ("RiskLevel", ["LOW", "MEDIUM", "HIGH"]),
    ("SyncStatus", ["PENDING", "SYNCED", "FAILED"]),
]


async def _ensure_enum(conn, type_name: str, values: list[str]) -> None:
    """Create enum if missing. PG does not support CREATE TYPE IF NOT EXISTS on all versions."""
    quoted_values = ", ".join(f"'{v}'" for v in values)
    sql = f"""
    DO $$ BEGIN
        CREATE TYPE "{type_name}" AS ENUM ({quoted_values});
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;
    """
    await conn.execute(text(sql))
    logger.debug("Ensured enum type '%s' exists", type_name)


async def init_db() -> None:
    """Create PostgreSQL enum types and tables on startup (safe to run repeatedly)."""
    logger.info("Initialising database …")
    async with engine.begin() as conn:
        for type_name, values in _ENUM_TYPES:
            await _ensure_enum(conn, type_name, values)

        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database initialisation complete")
