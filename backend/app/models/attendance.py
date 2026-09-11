from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(String, primary_key=True, default=lambda: f"att-{uuid.uuid4().hex[:8]}")
    branch_id = Column(Integer, default=1, index=True)
    member_id = Column(String, nullable=False, index=True)
    member_name = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    check_in_time = Column(String, nullable=False)
    check_out_time = Column(String, nullable=True)
    trainer_name = Column(String, nullable=True)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
