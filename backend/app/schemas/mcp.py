"""
MCP (Notion API) 관련 Pydantic 스키마

Notion API 연동을 위한 요청/응답 검증 스키마입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional


class NotionImportRequest(BaseModel):
    """
    Notion 페이지 가져오기 요청 스키마
    """
    notion_page_id: str = Field(
        ...,
        description="Notion 페이지 ID (32자 해시)",
        min_length=32,
        max_length=32,
        json_schema_extra={"example": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"}
    )
    parent_id: Optional[int] = Field(
        None,
        description="가져온 페이지의 부모 페이지 ID (선택사항)"
    )


class NotionImportResponse(BaseModel):
    """
    Notion 페이지 가져오기 응답 스키마
    """
    page_id: int = Field(..., description="생성된 페이지 ID")
    blocks_count: int = Field(..., description="가져온 블록 수")
    notion_page_id: str = Field(..., description="원본 Notion 페이지 ID")
    title: str = Field(..., description="페이지 제목")
    icon: Optional[str] = Field(None, description="페이지 아이콘 (이모지)")

    class Config:
        json_schema_extra = {
            "example": {
                "page_id": 1,
                "blocks_count": 10,
                "notion_page_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
                "title": "My Notion Page",
                "icon": "📄"
            }
        }
