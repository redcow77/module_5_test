from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Page, Block
from app.schemas import (
    PageCreate,
    PageUpdate,
    PageResponse,
    PageWithBlocksResponse,
)

router = APIRouter(prefix="/api/pages", tags=["pages"])


@router.get("/", response_model=list[PageResponse])
def get_pages(
    parent_id: int | None = Query(None, description="Filter by parent page ID"),
    db: Session = Depends(get_db),
):
    """Get all pages, optionally filtered by parent_id"""
    query = db.query(Page)
    if parent_id is not None:
        query = query.filter(Page.parent_id == parent_id)
    return query.all()


@router.get("/{page_id}", response_model=PageWithBlocksResponse)
def get_page(page_id: int, db: Session = Depends(get_db)):
    """Get a specific page with its blocks"""
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/", response_model=PageResponse)
def create_page(page: PageCreate, db: Session = Depends(get_db)):
    """Create a new page"""
    # Validate parent exists if parent_id is provided
    if page.parent_id is not None:
        parent = db.query(Page).filter(Page.id == page.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent page not found")

    db_page = Page(**page.model_dump())
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page


@router.patch("/{page_id}", response_model=PageResponse)
def update_page(page_id: int, page_update: PageUpdate, db: Session = Depends(get_db)):
    """Update a page"""
    db_page = db.query(Page).filter(Page.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")

    # Validate parent exists if parent_id is being updated
    if page_update.parent_id is not None:
        parent = db.query(Page).filter(Page.id == page_update.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent page not found")
        # Prevent circular reference (setting parent to self or descendant)
        if page_update.parent_id == page_id:
            raise HTTPException(status_code=400, detail="Page cannot be its own parent")

    # Update only provided fields
    update_data = page_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_page, key, value)

    db.commit()
    db.refresh(db_page)
    return db_page


@router.delete("/{page_id}")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    """Delete a page (cascade deletes blocks and child pages)"""
    db_page = db.query(Page).filter(Page.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")

    db.delete(db_page)
    db.commit()
    return {"message": "Page deleted successfully"}
