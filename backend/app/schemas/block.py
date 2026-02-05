from datetime import datetime
from pydantic import BaseModel, Field


class BlockCreate(BaseModel):
    page_id: int
    type: str = Field(..., description="Block type: text, heading1, heading2, etc.")
    content: str | None = None
    order: float = 0.0


class BlockUpdate(BaseModel):
    type: str | None = None
    content: str | None = None
    order: float | None = None


class BlockResponse(BaseModel):
    id: int
    page_id: int
    type: str
    content: str | None
    order: float
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class BlockReorderRequest(BaseModel):
    """Request to reorder a block"""
    block_id: int
    new_order: float = Field(..., description="New order position (float for flexibility)")
