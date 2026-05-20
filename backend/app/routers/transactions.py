import logging
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import (
    EmergencyFreeze,
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
)
from app.schemas import TransferRequest
from app.services.fraud import analyze_transfer, create_fraud_alerts
from app.utils.generators import generate_id, generate_transaction_reference
from app.utils.security import verify_password

logger = logging.getLogger("safebank.transactions")
router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    search: str | None = None,
    filter_type: str | None = Query(None, alias="filter"),
    page: int = 1,
    limit: int = 20,
):
    logger.info("Listing transactions user=%s page=%s", user.id, page)
    query = select(Transaction).where(
        or_(Transaction.sender_id == user.id, Transaction.receiver_id == user.id)
    )

    if filter_type == "in":
        query = query.where(Transaction.receiver_id == user.id)
    elif filter_type == "out":
        query = query.where(Transaction.sender_id == user.id)
    elif filter_type == "bills":
        query = query.where(Transaction.type == TransactionType.BILL_PAYMENT)

    query = query.order_by(Transaction.created_at.desc())
    result = await db.execute(query)
    all_tx = result.scalars().all()

    items = []
    for tx in all_tx:
        direction = "out" if tx.sender_id == user.id else "in"
        counterparty_id = tx.receiver_id if direction == "out" else tx.sender_id
        name = ""
        if counterparty_id:
            cp = await db.get(User, counterparty_id)
            name = cp.fullname if cp else ""
        if search and search.lower() not in (name + tx.reference + (tx.description or "")).lower():
            continue
        items.append(
            {
                "id": tx.id,
                "amount": float(tx.amount),
                "type": tx.type.value,
                "status": tx.status.value,
                "reference": tx.reference,
                "description": tx.description,
                "category": tx.category,
                "created_at": tx.created_at.isoformat(),
                "direction": direction,
                "counterparty_name": name or "Account transfer",
            }
        )

    start = (page - 1) * limit
    paginated = items[start : start + limit]
    return {"items": paginated, "total": len(items), "page": page, "limit": limit}


@router.get("/beneficiaries/recent")
async def recent_beneficiaries(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Fetching recent beneficiaries for user=%s", user.id)
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.sender_id == user.id,
            Transaction.receiver_id.isnot(None),
            Transaction.status == TransactionStatus.COMPLETED,
        )
        .order_by(Transaction.created_at.desc())
        .limit(20)
    )
    txs = result.scalars().all()
    seen: set[str] = set()
    beneficiaries = []
    for tx in txs:
        if not tx.receiver_id or tx.receiver_id in seen:
            continue
        seen.add(tx.receiver_id)
        recipient = await db.get(User, tx.receiver_id)
        if recipient:
            beneficiaries.append(
                {
                    "id": recipient.id,
                    "fullname": recipient.fullname,
                    "account_number": recipient.account_number,
                }
            )
        if len(beneficiaries) >= 8:
            break
    return {"beneficiaries": beneficiaries}


@router.get("/validate/{account_number}")
async def validate_recipient(
    account_number: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if account_number == user.account_number:
        raise HTTPException(status_code=400, detail="Cannot transfer to your own account")
    result = await db.execute(select(User).where(User.account_number == account_number))
    recipient = result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Account not found")
    return {
        "id": recipient.id,
        "fullname": recipient.fullname,
        "account_number": recipient.account_number,
    }


@router.post("/transfer")
async def transfer_money(
    body: TransferRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Transfer request from user=%s amount=%s", user.id, body.amount)

    if user.is_frozen:
        raise HTTPException(status_code=403, detail="Your account is frozen. Unfreeze to send money.")

    freeze = await db.execute(select(EmergencyFreeze).where(EmergencyFreeze.user_id == user.id))
    freeze_row = freeze.scalar_one_or_none()
    if freeze_row and freeze_row.frozen:
        raise HTTPException(status_code=403, detail="Outgoing transfers are disabled while your account is frozen.")

    if not user.transaction_pin or not verify_password(body.pin, user.transaction_pin):
        raise HTTPException(status_code=401, detail="Incorrect PIN")

    result = await db.execute(select(User).where(User.account_number == body.recipient_account))
    recipient = result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if recipient.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself")

    amount = Decimal(str(body.amount))
    if user.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    risk_score, alerts = await analyze_transfer(db, user.id, amount)
    tx_status = TransactionStatus.COMPLETED
    if risk_score >= 60:
        tx_status = TransactionStatus.FLAGGED
        await create_fraud_alerts(db, user.id, alerts)

    reference = generate_transaction_reference()
    tx = Transaction(
        id=generate_id(),
        sender_id=user.id,
        receiver_id=recipient.id,
        amount=amount,
        type=TransactionType.TRANSFER,
        status=tx_status,
        reference=reference,
        description=body.description,
        category="Transfer",
    )
    user.balance -= amount
    recipient.balance += amount
    db.add(tx)
    await db.flush()

    logger.info("Transfer completed ref=%s status=%s risk=%s", reference, tx_status.value, risk_score)
    completed_at = tx.created_at.isoformat() if tx.created_at else None
    return {
        "success": True,
        "reference": reference,
        "status": tx_status.value,
        "risk_score": risk_score,
        "flagged": tx_status == TransactionStatus.FLAGGED,
        "message": "Transfer completed successfully"
        if tx_status == TransactionStatus.COMPLETED
        else "Transfer completed but flagged for review",
        "new_balance": float(user.balance),
        "amount": float(amount),
        "recipient_name": recipient.fullname,
        "recipient_account": recipient.account_number,
        "created_at": completed_at,
    }
