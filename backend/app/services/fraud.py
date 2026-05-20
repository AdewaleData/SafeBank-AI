from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tables import FraudAlert, RiskLevel, Transaction, TransactionStatus, TransactionType
from app.utils.generators import generate_id


async def get_user_average_transfer(db: AsyncSession, user_id: str) -> Decimal:
    result = await db.execute(
        select(func.avg(Transaction.amount)).where(
            Transaction.sender_id == user_id,
            Transaction.type == TransactionType.TRANSFER,
            Transaction.status == TransactionStatus.COMPLETED,
        )
    )
    avg = result.scalar()
    return Decimal(str(avg)) if avg else Decimal("5000")


async def count_recent_transfers(db: AsyncSession, user_id: str, minutes: int = 10) -> int:
    since = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    result = await db.execute(
        select(func.count(Transaction.id)).where(
            Transaction.sender_id == user_id,
            Transaction.created_at >= since,
        )
    )
    return int(result.scalar() or 0)


def is_unusual_time() -> bool:
    hour = datetime.now().hour
    return hour < 5 or hour >= 23


async def analyze_transfer(
    db: AsyncSession,
    user_id: str,
    amount: Decimal,
) -> tuple[int, list[tuple[RiskLevel, str]]]:
    """
    Returns fraud risk score (0-100) and list of (risk_level, reason) alerts.
    """
    score = 0
    alerts: list[tuple[RiskLevel, str]] = []

    average = await get_user_average_transfer(db, user_id)
    if amount > average * 5:
        score += 45
        alerts.append(
            (
                RiskLevel.HIGH,
                f"Transfer amount ({amount}) is much higher than your usual average ({average:.2f}).",
            )
        )

    recent_count = await count_recent_transfers(db, user_id)
    if recent_count >= 3:
        score += 35
        alerts.append(
            (
                RiskLevel.HIGH,
                "Multiple transfers detected in a short period of time.",
            )
        )

    if is_unusual_time():
        score += 20
        alerts.append(
            (
                RiskLevel.MEDIUM,
                "Transfer initiated at an unusual time of day.",
            )
        )

    return min(score, 100), alerts


async def create_fraud_alerts(
    db: AsyncSession,
    user_id: str,
    alerts: list[tuple[RiskLevel, str]],
) -> None:
    for risk_level, reason in alerts:
        db.add(
            FraudAlert(
                id=generate_id(),
                user_id=user_id,
                risk_level=risk_level,
                reason=reason,
            )
        )


async def get_fraud_score(db: AsyncSession, user_id: str) -> int:
    result = await db.execute(
        select(FraudAlert).where(FraudAlert.user_id == user_id, FraudAlert.resolved.is_(False))
    )
    alerts = result.scalars().all()
    if not alerts:
        return 12
    score = 12
    for alert in alerts:
        if alert.risk_level == RiskLevel.HIGH:
            score += 28
        elif alert.risk_level == RiskLevel.MEDIUM:
            score += 15
        else:
            score += 8
    return min(score, 100)
