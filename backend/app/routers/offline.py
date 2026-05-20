import logging
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tables import OfflineQueue, SyncStatus, User
from app.schemas import OfflineTransferRequest
from app.utils.generators import generate_id

logger = logging.getLogger("safebank.offline")
router = APIRouter(prefix="/offline", tags=["offline"])


@router.post("/queue")
async def queue_offline_transfer(
    body: OfflineTransferRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info("Queueing offline transfer user=%s", user.id)
    entry = OfflineQueue(
        id=generate_id(),
        user_id=user.id,
        transaction_payload={
            "recipient_account": body.recipient_account,
            "amount": str(body.amount),
            "description": body.description,
        },
        sync_status=SyncStatus.PENDING,
    )
    db.add(entry)
    return {"success": True, "queue_id": entry.id, "message": "Saved. Will send when you are back online."}


@router.post("/sync")
async def sync_offline_queue(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logger.info("Syncing offline queue user=%s", user.id)
    result = await db.execute(
        select(OfflineQueue).where(
            OfflineQueue.user_id == user.id,
            OfflineQueue.sync_status == SyncStatus.PENDING,
        )
    )
    pending = result.scalars().all()
    synced = []
    failed = []

    for item in pending:
        item.sync_status = SyncStatus.SYNCED
        synced.append(item.id)

    return {
        "synced_count": len(synced),
        "failed_count": len(failed),
        "message": f"Synced {len(synced)} pending transfer(s).",
    }
