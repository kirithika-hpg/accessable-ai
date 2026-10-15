import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ScanReport(Base):
    __tablename__ = "scan_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_url = Column(String, nullable=False, index=True)
    status = Column(String, default="pending", nullable=False)  # pending, scanning, completed, failed
    error_message = Column(Text, nullable=True)
    total_issues = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    serious_count = Column(Integer, default=0)
    moderate_count = Column(Integer, default=0)
    minor_count = Column(Integer, default=0)
    accessibility_score = Column(Float, default=100.0)
    scan_duration_ms = Column(Float, default=0.0)
    scanned_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to individual issue findings
    findings = relationship("AccessibilityFinding", back_populates="scan", cascade="all, delete-orphan")
