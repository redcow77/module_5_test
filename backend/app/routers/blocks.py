from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Block, Page
from app.schemas import (
    BlockCreate,
    BlockUpdate,
    BlockResponse,
    BlockReorderRequest,
)

router = APIRouter(prefix="/api", tags=["blocks"])


@router.get("/pages/{page_id}/blocks", response_model=list[BlockResponse])
def get_page_blocks(page_id: int, db: Session = Depends(get_db)):
    """Get all blocks for a specific page, ordered by the order field"""
    # Verify page exists
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    blocks = db.query(Block).filter(Block.page_id == page_id).order_by(Block.order).all()
    return blocks


@router.post("/blocks", response_model=BlockResponse)
def create_block(block: BlockCreate, db: Session = Depends(get_db)):
    """Create a new block"""
    # Verify page exists
    page = db.query(Page).filter(Page.id == block.page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    db_block = Block(**block.model_dump())
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block


@router.patch("/blocks/{block_id}", response_model=BlockResponse)
def update_block(block_id: int, block_update: BlockUpdate, db: Session = Depends(get_db)):
    """Update a block"""
    db_block = db.query(Block).filter(Block.id == block_id).first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Block not found")

    # Update only provided fields
    update_data = block_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_block, key, value)

    db.commit()
    db.refresh(db_block)
    return db_block


@router.delete("/blocks/{block_id}")
def delete_block(block_id: int, db: Session = Depends(get_db)):
    """Delete a block"""
    db_block = db.query(Block).filter(Block.id == block_id).first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Block not found")

    db.delete(db_block)
    db.commit()
    return {"message": "Block deleted successfully"}


@router.post("/blocks/reorder", response_model=BlockResponse)
def reorder_block(reorder: BlockReorderRequest, db: Session = Depends(get_db)):
    """
    Reorder a block by updating its order field.
    Use float values for flexible positioning (e.g., 1.0, 1.5, 2.0).
    To place between blocks with order 1.0 and 2.0, use 1.5.
    """
    db_block = db.query(Block).filter(Block.id == reorder.block_id).first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Block not found")

    db_block.order = reorder.new_order
    db.commit()
    db.refresh(db_block)
    return db_block
