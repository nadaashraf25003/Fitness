from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db, require_roles
from app.models.user import User
from app.models.payment import Payment
from app.schemas.report import PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])


class PaymentCreate(BaseModel):
    member_id: str
    member_name: str
    subscription_id: str
    amount: float
    date: str
    method: str = "cash"
    status: str = "paid"
    branch_id: Optional[int] = 1


@router.get("", response_model=List[PaymentResponse])
def get_all_payments(
    branch_id: int = 1,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Get all payments for a branch."""
    payments = db.query(Payment).filter(Payment.branch_id == branch_id).order_by(Payment.date.desc()).all()
    return payments


@router.get("/member/{member_id}", response_model=List[PaymentResponse])
def get_member_payments(
    member_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Get all payments for a specific member."""
    payments = (
        db.query(Payment)
        .filter(Payment.member_id == member_id)
        .order_by(Payment.date.desc())
        .all()
    )
    return payments


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(["admin", "staff"])),
):
    """Create a new payment record."""
    payment = Payment(
        branch_id=data.branch_id or 1,
        member_id=data.member_id,
        member_name=data.member_name,
        subscription_id=data.subscription_id,
        amount=data.amount,
        date=data.date,
        method=data.method,
        status=data.status,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
