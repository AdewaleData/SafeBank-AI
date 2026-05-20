import logging

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.tables import FraudAlert, Transaction, User

logger = logging.getLogger("safebank.admin")
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def admin_dashboard(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    logger.info("Admin dashboard accessed by=%s", admin.id)
    users_count = await db.execute(select(func.count(User.id)))
    tx_count = await db.execute(select(func.count(Transaction.id)))
    alerts_count = await db.execute(select(func.count(FraudAlert.id)).where(FraudAlert.resolved.is_(False)))

    volume = await db.execute(select(func.coalesce(func.sum(Transaction.amount), 0)))
    return {
        "total_users": users_count.scalar() or 0,
        "total_transactions": tx_count.scalar() or 0,
        "active_fraud_alerts": alerts_count.scalar() or 0,
        "transaction_volume": float(volume.scalar() or 0),
    }


@router.get("/users")
async def list_users(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return {
        "users": [
            {
                "id": u.id,
                "fullname": u.fullname,
                "email": u.email,
                "balance": float(u.balance),
                "account_number": u.account_number,
                "is_frozen": u.is_frozen,
                "role": u.role.value,
            }
            for u in users
        ]
    }


@router.get("/transactions")
async def admin_transactions(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).order_by(Transaction.created_at.desc()).limit(50))
    txs = result.scalars().all()
    return {
        "transactions": [
            {
                "id": t.id,
                "amount": float(t.amount),
                "status": t.status.value,
                "reference": t.reference,
                "created_at": t.created_at.isoformat(),
            }
            for t in txs
        ]
    }


@router.get("/fraud")
async def admin_fraud(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FraudAlert).order_by(FraudAlert.created_at.desc()).limit(50))
    alerts = result.scalars().all()
    return {
        "alerts": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "risk_level": a.risk_level.value,
                "reason": a.reason,
                "resolved": a.resolved,
                "created_at": a.created_at.isoformat(),
            }
            for a in alerts
        ]
    }
