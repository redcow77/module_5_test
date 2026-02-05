from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True)  # Index for query performance
    type = Column(String(50), nullable=False)  # text, heading1, heading2, etc.
    content = Column(Text, nullable=True)  # JSON string for rich content
    order = Column(Float, nullable=False, default=0.0, index=True)  # Index for sorting performance
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship back to page
    page = relationship("Page", back_populates="blocks")
