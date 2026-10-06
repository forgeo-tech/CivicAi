"""SQLAlchemy ORM models for incidents and work orders."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    issue_type = Column(String, nullable=False)
    confidence = Column(Float, default=0.0)
    severity = Column(String, default="medium")
    priority_score = Column(Float, default=0.0)
    priority_reasons = Column(Text, default="")
    status = Column(String, default="reported")  # reported, verified, fixed, ignored
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    location_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    work_orders = relationship("WorkOrder", back_populates="incident", cascade="all, delete-orphan")


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    title = Column(String, default="Infrastructure Repair")
    description = Column(Text, default="")
    status = Column(String, default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="work_orders")
