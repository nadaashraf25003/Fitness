from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=lambda: f"mem-{uuid.uuid4().hex[:8]}")
    member_code = Column(String, nullable=True, index=True)
    barcode = Column(String, nullable=True, index=True)
    branch_id = Column(Integer, default=1, index=True)
    full_name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False, index=True)
    photo = Column(String, nullable=True)
    note = Column(String, nullable=True)
    gender = Column(String, default="other")  # male, female, other
    date_of_birth = Column(String, nullable=False, default="1995-01-01")
    join_date = Column(String, nullable=False)
    subscription_id = Column(String, nullable=False)
    plan_name = Column(String, nullable=False, default="Standard")
    status = Column(String, default="active", index=True)  # active, expiring, expired
    trainer_id = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
