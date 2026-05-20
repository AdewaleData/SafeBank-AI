import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import Analytics, Transaction, TransactionStatus, TransactionType, User
from app.services.fraud import get_fraud_score

logger = logging.getLogger("safebank.dashboard")
router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logger.info("Loading dashboard for user=%s", user.id)
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.receiver_id == user.id,
            Transaction.status == TransactionStatus.COMPLETED,
            Transaction.created_at >= month_start,
        )
    )
    income = float(income_result.scalar() or 0)

    expense_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.sender_id == user.id,
            Transaction.status == TransactionStatus.COMPLETED,
            Transaction.created_at >= month_start,
            Transaction.type != TransactionType.DEPOSIT,
        )
    )
    expenses = float(expense_result.scalar() or 0)

    tx_result = await db.execute(
        select(Transaction)
        .where(or_(Transaction.sender_id == user.id, Transaction.receiver_id == user.id))
        .order_by(Transaction.created_at.desc())
        .limit(8)
    )
    transactions = tx_result.scalars().all()

    recent = []
    for tx in transactions:
        direction = "out" if tx.sender_id == user.id else "in"
        counterparty_id = tx.receiver_id if direction == "out" else tx.sender_id
        name = "You"
        if counterparty_id:
            cp = await db.get(User, counterparty_id)
            name = cp.fullname if cp else "Unknown"
        recent.append(
            {
                "id": tx.id,
                "amount": float(tx.amount),
                "type": tx.type.value,
                "status": tx.status.value,
                "reference": tx.reference,
                "description": tx.description,
                "created_at": tx.created_at.isoformat(),
                "direction": direction,
                "counterparty_name": name,
            }
        )

    fraud_score = await get_fraud_score(db, user.id)
    insights = []
    if expenses > income:
        insights.append("Your spending this month is higher than your income. Consider reviewing top categories.")
    if fraud_score > 50:
        insights.append("We detected unusual activity. Review your fraud alerts for details.")
    else:
        insights.append("Your account activity looks healthy. Keep monitoring your spending patterns.")

    savings_goal = 500000
    savings_progress = min(int((float(user.balance) / savings_goal) * 100), 100)

    return {
        "balance": float(user.balance),
        "account_number": user.account_number,
        "is_frozen": user.is_frozen,
        "income": income,
        "expenses": expenses,
        "savings_progress": savings_progress,
        "fraud_score": fraud_score,
        "insights": insights,
        "recent_transactions": recent,
    }
