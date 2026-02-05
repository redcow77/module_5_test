from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, default="Untitled")
    icon = Column(String(10), nullable=True)  # Emoji
    parent_id = Column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, nullable=True)  # FK to users table (not implemented yet)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Self-referencing relationship for tree structure
    children = relationship(
        "Page",
        back_populates="parent",
        cascade="all, delete-orphan",
        foreign_keys=[parent_id]
    )
    parent = relationship(
        "Page",
        back_populates="children",
        remote_side=[id]
    )

    # Relationship to blocks with cascade delete
    blocks = relationship(
        "Block",
        back_populates="page",
        cascade="all, delete-orphan",
        order_by="Block.order"
    )
