from sqlalchemy import Column, String, Float, Integer, Boolean
import uuid
from app.core.database import Base


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(String, primary_key=True, default=lambda: f"trn-{uuid.uuid4().hex[:6]}")
    full_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    bio = Column(String, nullable=False)
    hourly_rate = Column(Float, nullable=False, default=0.0)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    photo_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    assigned_members_count = Column(Integer, default=0)
