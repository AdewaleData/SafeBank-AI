import enum
from datetime import datetime, timezone
from decimal import Decimal


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def pg_enum(enum_cls: type[enum.Enum], name: str) -> Enum:
    """Map to Prisma-created PostgreSQL enum types (e.g. Role, not role)."""
    return Enum(
        enum_cls,
        name=name,
        create_type=False,
        values_callable=lambda obj: [member.value for member in obj],
    )


class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class TransactionType(str, enum.Enum):
    TRANSFER = "TRANSFER"
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    BILL_PAYMENT = "BILL_PAYMENT"


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    FLAGGED = "FLAGGED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    fullname: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    password: Mapped[str] = mapped_column(String)
    transaction_pin: Mapped[str | None] = mapped_column(String, nullable=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"))
    account_number: Mapped[str] = mapped_column(String, unique=True, index=True)
    role: Mapped[Role] = mapped_column(pg_enum(Role, "Role"), default=Role.USER)
    is_frozen: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), default=utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utcnow,
        onupdate=utcnow,
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    sender_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    receiver_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    type: Mapped[TransactionType] = mapped_column(pg_enum(TransactionType, "TransactionType"))
    status: Mapped[TransactionStatus] = mapped_column(
        pg_enum(TransactionStatus, "TransactionStatus"), default=TransactionStatus.PENDING
    )
    reference: Mapped[str] = mapped_column(String, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"))
    risk_level: Mapped[RiskLevel] = mapped_column(pg_enum(RiskLevel, "RiskLevel"))
    reason: Mapped[str] = mapped_column(Text)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    month: Mapped[str] = mapped_column(String)


class EmergencyFreeze(Base):
    __tablename__ = "emergency_freeze"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    frozen: Mapped[bool] = mapped_column(Boolean, default=False)
    frozen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class OfflineQueue(Base):
    __tablename__ = "offline_queue"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"))
    transaction_payload: Mapped[dict] = mapped_column(JSONB)
    sync_status: Mapped[SyncStatus] = mapped_column(
        pg_enum(SyncStatus, "SyncStatus"), default=SyncStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
