"""Create or update the SafeBank AI admin account. Run: python scripts/create_admin.py"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import bcrypt
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.tables import EmergencyFreeze, Role, User, utcnow
from app.utils.generators import generate_id


async def main() -> None:
    email = "admin@safebank.ai"
    password = bcrypt.hashpw(b"Admin@12345", bcrypt.gensalt()).decode()
    pin = bcrypt.hashpw(b"1234", bcrypt.gensalt()).decode()

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        now = utcnow()

        if user:
            user.fullname = "SafeBank Admin"
            user.password = password
            user.transaction_pin = pin
            user.role = Role.ADMIN
            user.is_frozen = False
            user.updated_at = now
            print("Updated admin user.")
        else:
            user = User(
                id=generate_id(),
                fullname="SafeBank Admin",
                email=email,
                phone="+2348000000001",
                password=password,
                transaction_pin=pin,
                balance=1000000,
                account_number="5012345678",
                role=Role.ADMIN,
                is_frozen=False,
                created_at=now,
                updated_at=now,
            )
            db.add(user)
            await db.flush()
            db.add(EmergencyFreeze(id=generate_id(), user_id=user.id, frozen=False))
            print("Created admin user.")

        await db.commit()

    print("\nAdmin: admin@safebank.ai / Admin@12345 / PIN 1234 / Account 5012345678")


if __name__ == "__main__":
    asyncio.run(main())
