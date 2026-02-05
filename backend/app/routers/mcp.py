"""
MCP (Notion API 연동) 라우터

Notion에서 페이지를 가져와 우리 시스템에 저장하는 엔드포인트를 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from notion_client.errors import APIResponseError

from app.database import get_db
from app.schemas.mcp import NotionImportRequest, NotionImportResponse
from app.services.mcp_notion import get_notion_service, NotionService
from app.models import Page, Block
from app.config import settings


router = APIRouter(prefix="/api/mcp", tags=["MCP"])


@router.post("/import", response_model=NotionImportResponse, status_code=status.HTTP_201_CREATED)
def import_notion_page(
    request: NotionImportRequest,
    db: Session = Depends(get_db)
):
    """
    Notion 페이지를 가져와서 우리 시스템에 저장

    Args:
        request: Notion 페이지 ID와 선택적 부모 페이지 ID
        db: 데이터베이스 세션

    Returns:
        생성된 페이지 정보와 가져온 블록 수

    Raises:
        HTTPException:
            - 401: Notion API 키가 설정되지 않음
            - 404: Notion 페이지를 찾을 수 없음
            - 502: Notion API 에러
    """
    try:
        # Validate API key first
        try:
            api_key = settings.get_notion_api_key()
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

        # Notion 서비스 초기화
        try:
            notion_service = get_notion_service()
        except ValueError as e:
            # API 키가 없을 때
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Notion API 키가 설정되지 않았습니다. .env 파일에 NOTION_API_KEY를 추가해주세요."
            )

        # Notion 페이지 정보 가져오기
        try:
            notion_page = notion_service.get_notion_page(request.notion_page_id)
        except APIResponseError as e:
            # Notion API 에러 처리
            if e.code == "object_not_found":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Notion 페이지를 찾을 수 없습니다. 페이지 ID: {request.notion_page_id}"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Notion API 에러: {e.message}"
                )

        # 페이지 제목 및 아이콘 추출
        title = notion_service.extract_page_title(notion_page)
        icon = notion_service.extract_page_icon(notion_page)

        # 부모 페이지 검증 (제공된 경우)
        if request.parent_id is not None:
            parent_page = db.query(Page).filter(Page.id == request.parent_id).first()
            if not parent_page:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"부모 페이지를 찾을 수 없습니다. ID: {request.parent_id}"
                )

        # 새 페이지 생성
        new_page = Page(
            title=title,
            icon=icon,
            parent_id=request.parent_id
        )
        db.add(new_page)
        db.flush()  # ID 생성을 위해 flush

        # Notion 블록 가져오기
        try:
            notion_blocks = notion_service.get_notion_blocks(request.notion_page_id)
        except APIResponseError as e:
            # 블록 가져오기 실패 시 페이지 롤백
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Notion 블록 가져오기 실패: {e.message}"
            )

        # 블록 변환 및 저장
        our_blocks = notion_service.convert_notion_blocks_to_our_format(notion_blocks)

        for block_data in our_blocks:
            new_block = Block(
                page_id=new_page.id,
                type=block_data["type"],
                content=block_data["content"],
                order=block_data["order"]
            )
            db.add(new_block)

        # 커밋
        db.commit()
        db.refresh(new_page)

        # 응답 생성
        return NotionImportResponse(
            page_id=new_page.id,
            blocks_count=len(our_blocks),
            notion_page_id=request.notion_page_id,
            title=title,
            icon=icon
        )

    except HTTPException:
        # HTTPException은 그대로 전파
        raise
    except Exception as e:
        # 예상치 못한 에러
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"서버 내부 에러: {str(e)}"
        )
