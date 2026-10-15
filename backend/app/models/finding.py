import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AccessibilityFinding(Base):
    __tablename__ = "accessibility_findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scan_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String, nullable=False, index=True)
    rule_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)  # critical, serious, moderate, minor
    wcag_tags = Column(Text, default="[]")     # JSON-encoded array of tags
    selector = Column(Text, nullable=False)
    html_snippet = Column(Text, nullable=True)
    failure_summary = Column(Text, nullable=True)
    recommended_fix = Column(Text, nullable=True)
    manual_test_notes = Column(Text, nullable=True)

    scan = relationship("ScanReport", back_populates="findings")
