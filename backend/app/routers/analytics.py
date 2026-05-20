import logging
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import Analytics, Transaction, TransactionStatus, TransactionType, User

logger = logging.getLogger("safebank.analytics")
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
async def spending_analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logger.info("Loading analytics for user=%s", user.id)
    result = await db.execute(select(Analytics).where(Analytics.user_id == user.id))
    rows = result.scalars().all()

    if not rows:
        tx_result = await db.execute(
            select(Transaction).where(
                Transaction.sender_id == user.id,
                Transaction.status == TransactionStatus.COMPLETED,
                Transaction.type != TransactionType.DEPOSIT,
            )
        )
        txs = tx_result.scalars().all()
        categories: dict[str, float] = defaultdict(float)
        for tx in txs:
            cat = tx.category or "Other"
            categories[cat] += float(tx.amount)
        if not categories:
            categories = {
                "Food & Drinks": 45000,
                "Transport": 32000,
                "Shopping": 28000,
                "Bills": 55000,
                "Entertainment": 18000,
                "Other": 12000,
            }
    else:
        categories = {r.category: float(r.amount) for r in rows}

    total = sum(categories.values()) or 1
    breakdown = [
        {
            "category": cat,
            "amount": amt,
            "percentage": round((amt / total) * 100, 1),
        }
        for cat, amt in sorted(categories.items(), key=lambda x: -x[1])
    ]

    chart_data = [{"name": b["category"], "value": b["amount"]} for b in breakdown]

    top = breakdown[0]["category"] if breakdown else "Food & Drinks"
    insight = f"You spent the most on {top} this month."
    if breakdown and len(breakdown) > 1:
        insight += f" {breakdown[1]['category']} is your second largest category."

    monthly = [
        {"month": "Jan", "amount": 180000},
        {"month": "Feb", "amount": 210000},
        {"month": "Mar", "amount": 195000},
        {"month": "Apr", "amount": 240000},
        {"month": "May", "amount": int(total)},
    ]

    return {
        "total_expenses": total,
        "breakdown": breakdown,
        "chart_data": chart_data,
        "monthly_chart": monthly,
        "insight": insight,
    }
