from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class Claim(Base):
    __tablename__ = "claims"

    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    text           = Column(Text, nullable=False)
    # Maps to API field "sourcePlatform"
    sourcePlatform = Column(String(50), nullable=False)
    category       = Column(String(50), nullable=False)
    # Maps to API field "sourceLink"
    sourceLink     = Column(String(2000), nullable=True)
    # Exact spec strings: "Unverified" | "Verified True" | "False" | "Misleading"
    status         = Column(String(50), nullable=False, default="Unverified")
    # Exact spec strings: "High Risk" | "Normal"
    riskLevel      = Column(String(20), nullable=False, default="Normal")
    # JSON-encoded list of {"type": str, "reason": str} dicts
    flags          = Column(Text, nullable=False, default="[]")
    # Maps to API field "reviewerNote"
    reviewerNote   = Column(Text, nullable=True)
    # Maps to API fields "submittedAt" / "reviewedAt"
    submittedAt    = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    reviewedAt     = Column(DateTime, nullable=True)
