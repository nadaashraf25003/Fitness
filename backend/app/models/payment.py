from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: f"pay-{uuid.uuid4().hex[:8]}")
    branch_id = Column(Integer, default=1, index=True)
    member_id = Column(String, nullable=False, index=True)
    member_name = Column(String, nullable=False)
    subscription_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    method = Column(String, default="cash")  # cash, visa/card, transfer, online
    status = Column(String, default="paid")  # paid, partial, unpaid
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
