import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.tables import EmergencyFreeze, Role, User, utcnow
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.utils.generators import generate_account_number, generate_id
from app.utils.security import create_access_token, hash_password, verify_password

logger = logging.getLogger("safebank.auth")
router = APIRouter(prefix="/auth", tags=["auth"])


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "fullname": user.fullname,
        "email": user.email,
        "phone": user.phone,
        "balance": float(user.balance),
        "account_number": user.account_number,
        "role": user.role.value,
        "is_frozen": user.is_frozen,
    }


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    logger.info("Register attempt for email=%s", body.email)
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    account_number = generate_account_number()
    while True:
        check = await db.execute(select(User).where(User.account_number == account_number))
        if not check.scalar_one_or_none():
            break
        account_number = generate_account_number()

    now = utcnow()
    user = User(
        id=generate_id(),
        fullname=body.fullname,
        email=body.email,
        phone=body.phone,
        password=hash_password(body.password),
        transaction_pin=hash_password(body.transaction_pin),
        balance=250000,
        account_number=account_number,
        role=Role.USER,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    await db.flush()

    freeze = EmergencyFreeze(id=generate_id(), user_id=user.id, frozen=False)
    db.add(freeze)

    token = create_access_token(user.id, {"role": user.role.value})
    logger.info("User registered id=%s account=%s", user.id, account_number)
    return TokenResponse(access_token=token, user=user_to_dict(user))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    logger.info("Login attempt for email=%s", body.email)
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id, {"role": user.role.value})
    logger.info("User logged in id=%s", user.id)
    return TokenResponse(access_token=token, user=user_to_dict(user))
