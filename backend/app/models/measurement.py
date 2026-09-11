from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime, timezone
import uuid
from app.core.database import Base


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String, primary_key=True, default=lambda: f"meas-{uuid.uuid4().hex[:8]}")
    member_id = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    body_fat_percentage = Column(Float, nullable=True)
    chest_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    hips_cm = Column(Float, nullable=True)
    arms_cm = Column(Float, nullable=True)
    thighs_cm = Column(Float, nullable=True)
    bmi = Column(Float, nullable=False)
    bmi_category = Column(String, nullable=False)  # underweight, normal, overweight, obese
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
