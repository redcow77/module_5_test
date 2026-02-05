from datetime import datetime
from pydantic import BaseModel, Field


class PageCreate(BaseModel):
    title: str = "Untitled"
    icon: str | None = None
    parent_id: int | None = None
    user_id: int | None = None


class PageUpdate(BaseModel):
    title: str | None = None
    icon: str | None = None
    parent_id: int | None = None


class PageResponse(BaseModel):
    id: int
    title: str
    icon: str | None
    parent_id: int | None
    user_id: int | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class PageWithBlocksResponse(PageResponse):
    """Page response with its blocks included"""
    blocks: list["BlockResponse"] = []

    class Config:
        from_attributes = True


# Import at the end to avoid circular dependency
from app.schemas.block import BlockResponse
PageWithBlocksResponse.model_rebuild()
