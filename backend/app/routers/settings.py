import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import User
from app.schemas import PasswordChangeRequest, PinChangeRequest, ProfileUpdateRequest
from app.utils.security import hash_password, verify_password

logger = logging.getLogger("safebank.settings")
router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/profile")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "fullname": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "account_number": user.account_number,
    }


@router.patch("/profile")
async def update_profile(
    body: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.fullname:
        user.fullname = body.fullname
    if body.phone is not None:
        user.phone = body.phone
    logger.info("Profile updated user=%s", user.id)
    return {"success": True}


@router.post("/change-password")
async def change_password(
    body: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, user.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    user.password = hash_password(body.new_password)
    logger.info("Password changed user=%s", user.id)
    return {"success": True}


@router.post("/change-pin")
async def change_pin(
    body: PinChangeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.transaction_pin or not verify_password(body.current_pin, user.transaction_pin):
        raise HTTPException(status_code=401, detail="Current PIN is incorrect")
    user.transaction_pin = hash_password(body.new_pin)
    logger.info("PIN changed user=%s", user.id)
    return {"success": True}
