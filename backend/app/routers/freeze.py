import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import EmergencyFreeze, User
from app.schemas import PinVerifyRequest
from app.utils.security import verify_password

logger = logging.getLogger("safebank.freeze")
router = APIRouter(prefix="/freeze", tags=["freeze"])


@router.get("/status")
async def freeze_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmergencyFreeze).where(EmergencyFreeze.user_id == user.id))
    row = result.scalar_one_or_none()
    frozen = row.frozen if row else user.is_frozen
    return {
        "frozen": frozen,
        "frozen_at": row.frozen_at.isoformat() if row and row.frozen_at else None,
    }


@router.post("/activate")
async def freeze_account(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logger.info("Freezing account user=%s", user.id)
    result = await db.execute(select(EmergencyFreeze).where(EmergencyFreeze.user_id == user.id))
    row = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if row:
        row.frozen = True
        row.frozen_at = now
    user.is_frozen = True
    return {"success": True, "frozen": True, "message": "Your account has been frozen."}


@router.post("/deactivate")
async def unfreeze_account(
    body: PinVerifyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Unfreeze request user=%s", user.id)
    if not user.transaction_pin or not verify_password(body.pin, user.transaction_pin):
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    result = await db.execute(select(EmergencyFreeze).where(EmergencyFreeze.user_id == user.id))
    row = result.scalar_one_or_none()
    if row:
        row.frozen = False
        row.frozen_at = None
    user.is_frozen = False
    return {"success": True, "frozen": False, "message": "Your account is active again."}
