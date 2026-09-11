from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    price_per_month = Column(Float, nullable=False, default=500.0)
    offers = Column(String, nullable=True)
