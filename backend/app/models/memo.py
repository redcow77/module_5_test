"""
Memo 모델

AI 요약 및 태그 자동 생성 기능을 포함한 메모 모델
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func

from app.database import Base


class Memo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)  # AI 생성 요약
    tags = Column(JSON, nullable=True)  # AI 생성 태그 리스트 ["tag1", "tag2"]
    user_id = Column(Integer, nullable=True)  # FK to users table (not implemented yet)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
