import logging

from sqlalchemy import text

from app.database import Base, engine

logger = logging.getLogger("safebank.init_db")

# Import all models so their metadata is registered on Base before create_all
import app.models.tables  # noqa: F401

# PostgreSQL enum types used by the models.
# These are declared with create_type=False in the model definitions, so
# SQLAlchemy will not emit CREATE TYPE statements automatically.  We create
# them here with IF NOT EXISTS so the operation is safe on every startup.
_ENUM_TYPES: list[tuple[str, list[str]]] = [
    ("Role", ["USER", "ADMIN"]),
    ("TransactionType", ["TRANSFER", "DEPOSIT", "WITHDRAWAL", "BILL_PAYMENT"]),
    ("TransactionStatus", ["PENDING", "COMPLETED", "FAILED", "FLAGGED"]),
    ("RiskLevel", ["LOW", "MEDIUM", "HIGH"]),
    ("SyncStatus", ["PENDING", "SYNCED", "FAILED"]),
]


async def init_db() -> None:
    """Create PostgreSQL enum types and all database tables on startup."""
    logger.info("Initialising database …")
    async with engine.begin() as conn:
        # Create enum types first — tables depend on them.
        for type_name, values in _ENUM_TYPES:
            quoted_values = ", ".join(f"'{v}'" for v in values)
            await conn.execute(
                text(f"CREATE TYPE IF NOT EXISTS \"{type_name}\" AS ENUM ({quoted_values})")
            )
            logger.debug("Ensured enum type '%s' exists", type_name)

        # Create all tables that are not yet present in the database.
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database initialisation complete")
