import random
import string
import uuid
from datetime import datetime


def generate_id() -> str:
    return str(uuid.uuid4()).replace("-", "")[:25]


def generate_account_number() -> str:
    """Generate realistic 10-digit Nigerian-style account number."""
    prefix = random.choice(["20", "30", "40", "50", "60"])
    suffix = "".join(str(random.randint(0, 9)) for _ in range(10 - len(prefix)))
    return f"{prefix}{suffix}"


def generate_transaction_reference() -> str:
    year = datetime.now().year
    code = "".join(random.choices(string.digits, k=6))
    return f"SBK-{year}-{code}"
