"""
Memos API 라우터

AI 요약 및 태그 자동 생성 기능을 포함한 메모 CRUD API
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from anthropic import APIError

from app.database import get_db
from app.models.memo import Memo
from app.schemas.memo import MemoCreate, MemoUpdate, MemoResponse
from app.services.claude_ai import get_claude_service


router = APIRouter(prefix="/api/memos", tags=["memos"])


@router.get("/", response_model=list[MemoResponse])
def get_memos(
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(100, ge=1, le=100, description="가져올 항목 수"),
    db: Session = Depends(get_db),
):
    """메모 목록 조회 (최신순)"""
    memos = (
        db.query(Memo)
        .order_by(Memo.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return memos


@router.get("/search", response_model=list[MemoResponse])
def search_memos(
    q: str = Query(..., min_length=1, description="검색어"),
    db: Session = Depends(get_db),
):
    """
    메모 검색 (제목, 내용, AI 요약에서 검색)

    태그는 Python에서 추가 필터링합니다.
    """
    # SQLite LIKE 검색 (제목, 내용, AI 요약)
    search_pattern = f"%{q}%"
    memos = (
        db.query(Memo)
        .filter(
            (Memo.title.like(search_pattern))
            | (Memo.content.like(search_pattern))
            | (Memo.ai_summary.like(search_pattern))
        )
        .order_by(Memo.created_at.desc())
        .all()
    )

    # 태그에서도 검색 (Python 필터링)
    result = []
    for memo in memos:
        # 이미 매칭된 경우 추가
        if memo in result:
            continue

        # 태그에서 검색
        if memo.tags:
            for tag in memo.tags:
                if q.lower() in tag.lower():
                    result.append(memo)
                    break

    # 이미 result에 없는 memos 추가
    for memo in memos:
        if memo not in result:
            result.append(memo)

    return result


@router.get("/{memo_id}", response_model=MemoResponse)
def get_memo(memo_id: int, db: Session = Depends(get_db)):
    """메모 상세 조회"""
    memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    return memo


@router.post("/", response_model=MemoResponse)
def create_memo(memo: MemoCreate, db: Session = Depends(get_db)):
    """
    메모 생성 + AI 요약 및 태그 자동 생성

    AI 처리 실패 시에도 메모는 저장됩니다 (Graceful degradation).
    """
    # 1. 메모 먼저 저장
    db_memo = Memo(
        title=memo.title,
        content=memo.content,
        user_id=memo.user_id,
    )
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)

    # 2. Claude AI 처리 (실패해도 메모는 저장됨)
    try:
        claude_service = get_claude_service()
        ai_result = claude_service.process_memo(memo.content)

        db_memo.ai_summary = ai_result["summary"]
        db_memo.tags = ai_result["tags"]
        db.commit()
        db.refresh(db_memo)
    except ValueError as e:
        # API 키 미설정 시 경고만 출력
        print(f"Claude AI service unavailable: {e}")
    except APIError as e:
        # Claude API 에러 시 경고만 출력
        print(f"Claude API error: {e}")
    except Exception as e:
        # 기타 예외 발생 시 경고만 출력
        print(f"Unexpected error during AI processing: {e}")

    return db_memo


@router.patch("/{memo_id}", response_model=MemoResponse)
def update_memo(
    memo_id: int,
    memo_update: MemoUpdate,
    db: Session = Depends(get_db),
):
    """메모 수정 (AI 요약/태그는 유지됨)"""
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    # 제공된 필드만 업데이트
    update_data = memo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_memo, key, value)

    db.commit()
    db.refresh(db_memo)
    return db_memo


@router.delete("/{memo_id}")
def delete_memo(memo_id: int, db: Session = Depends(get_db)):
    """메모 삭제"""
    try:
        db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
        if not db_memo:
            raise HTTPException(status_code=404, detail="Memo not found")

        db.delete(db_memo)
        db.commit()
        return {"message": "Memo deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to delete memo: {str(e)}"
        )


@router.post("/{memo_id}/regenerate-ai", response_model=MemoResponse)
def regenerate_ai_summary_and_tags(memo_id: int, db: Session = Depends(get_db)):
    """
    AI 요약 및 태그 재생성

    기존 메모의 내용을 기반으로 AI 요약과 태그를 다시 생성합니다.
    """
    db_memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not db_memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    try:
        claude_service = get_claude_service()
        ai_result = claude_service.process_memo(db_memo.content)

        db_memo.ai_summary = ai_result["summary"]
        db_memo.tags = ai_result["tags"]
        db.commit()
        db.refresh(db_memo)

        return db_memo
    except ValueError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Claude AI service unavailable: {str(e)}"
        )
    except APIError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Claude API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
