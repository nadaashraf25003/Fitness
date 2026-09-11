from sqlalchemy import Column, String, Float, Integer, Boolean, JSON
import uuid
from app.core.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=lambda: f"plan-{uuid.uuid4().hex[:6]}")
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    duration_months = Column(Integer, nullable=False, default=1)
    features = Column(JSON, default=list)  # Stored as list of strings
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
