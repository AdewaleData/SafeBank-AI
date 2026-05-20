import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import FraudAlert, User
from app.services.fraud import get_fraud_score

logger = logging.getLogger("safebank.fraud")
router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.get("/alerts")
async def get_alerts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    filter: str | None = None,
):
    logger.info("Fetching fraud alerts user=%s filter=%s", user.id, filter)
    query = select(FraudAlert).where(FraudAlert.user_id == user.id).order_by(FraudAlert.created_at.desc())
    result = await db.execute(query)
    alerts = result.scalars().all()

    items = []
    for a in alerts:
        if filter == "high" and a.risk_level.value != "HIGH":
            continue
        if filter == "resolved" and not a.resolved:
            continue
        if filter == "active" and a.resolved:
            continue
        items.append(
            {
                "id": a.id,
                "risk_level": a.risk_level.value,
                "reason": a.reason,
                "resolved": a.resolved,
                "created_at": a.created_at.isoformat(),
            }
        )

    score = await get_fraud_score(db, user.id)
    high_priority = any(i["risk_level"] == "HIGH" and not i["resolved"] for i in items)

    return {"alerts": items, "fraud_score": score, "has_high_priority": high_priority}


@router.patch("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    alert = await db.get(FraudAlert, alert_id)
    if not alert or alert.user_id != user.id:
        return {"success": False}
    alert.resolved = True
    logger.info("Alert resolved id=%s", alert_id)
    return {"success": True}
