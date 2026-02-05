"""
Memo Pydantic 스키마

메모 관련 요청/응답 검증 스키마
"""

from datetime import datetime
from pydantic import BaseModel, Field


class MemoCreate(BaseModel):
    """메모 생성 요청 스키마"""
    title: str = Field(..., min_length=1, max_length=500, description="메모 제목")
    content: str = Field(..., min_length=1, description="메모 내용")
    user_id: int | None = None


class MemoUpdate(BaseModel):
    """메모 수정 요청 스키마"""
    title: str | None = Field(None, min_length=1, max_length=500)
    content: str | None = Field(None, min_length=1)


class MemoResponse(BaseModel):
    """메모 응답 스키마"""
    id: int
    title: str
    content: str
    ai_summary: str | None
    tags: list[str] | None
    user_id: int | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
