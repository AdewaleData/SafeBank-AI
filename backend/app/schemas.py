from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    fullname: str = Field(min_length=2)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8)
    transaction_pin: str = Field(min_length=4, max_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PinVerifyRequest(BaseModel):
    pin: str = Field(min_length=4, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class TransferRequest(BaseModel):
    recipient_account: str
    amount: Decimal = Field(gt=0)
    description: str | None = None
    pin: str = Field(min_length=4, max_length=6)


class OfflineTransferRequest(BaseModel):
    recipient_account: str
    amount: Decimal = Field(gt=0)
    description: str | None = None


class ProfileUpdateRequest(BaseModel):
    fullname: str | None = None
    phone: str | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class PinChangeRequest(BaseModel):
    current_pin: str
    new_pin: str = Field(min_length=4, max_length=6)


class UserResponse(BaseModel):
    id: str
    fullname: str
    email: str
    phone: str | None
    balance: float
    account_number: str
    role: str
    is_frozen: bool

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: str
    amount: float
    type: str
    status: str
    reference: str
    description: str | None
    category: str | None
    created_at: datetime
    counterparty_name: str | None = None
    direction: str | None = None
