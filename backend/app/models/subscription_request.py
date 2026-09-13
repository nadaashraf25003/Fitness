from sqlalchemy import Column, String, Integer, Float, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class SubscriptionRequest(Base):
    __tablename__ = "subscription_requests"

    id = Column(String, primary_key=True, default=lambda: f"req-{uuid.uuid4().hex[:8]}")
    branch_id = Column(Integer, default=1, index=True)
    member_id = Column(String, nullable=True, index=True)
    member_code = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    plan_id = Column(String, nullable=False, default="plan-standard")
    plan_name = Column(String, nullable=False, default="Standard Plan")
    requested_start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    duration = Column(Integer, default=1)
    price = Column(Float, default=500.0)
    paid_amount = Column(Float, default=500.0)
    payment_method = Column(String, default="كاش")
    request_type = Column(String, default="new", index=True)  # new, renew, extend, cancel
    status = Column(String, default="pending", index=True)  # pending, approved, rejected
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
