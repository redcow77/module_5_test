"""
Notion API 연동 서비스 모듈

Notion API를 통해 페이지와 블록을 가져오고,
우리 시스템 형식으로 변환하는 기능을 제공합니다.
"""

from typing import List, Dict, Any, Optional
from notion_client import Client
from notion_client.errors import APIResponseError

from app.config import settings


# Notion 블록 타입을 우리 시스템 블록 타입으로 매핑
NOTION_TO_OUR_BLOCK_TYPE = {
    "paragraph": "text",
    "heading_1": "heading1",
    "heading_2": "heading2",
    "heading_3": "heading3",
    "bulleted_list_item": "bullet_list",
    "numbered_list_item": "numbered_list",
    "to_do": "todo",
    "code": "code",
    "quote": "quote",
    "divider": "divider",
}


class NotionService:
    """
    Notion API 클라이언트 래퍼 클래스

    Notion API 호출 및 데이터 변환을 담당합니다.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Notion 클라이언트 초기화

        Args:
            api_key: Notion API 키 (없으면 설정에서 가져옴)

        Raises:
            ValueError: API 키가 없을 때
        """
        self.api_key = api_key or settings.notion_api_key
        if not self.api_key:
            raise ValueError("Notion API 키가 설정되지 않았습니다.")

        self.client = Client(auth=self.api_key)

    def get_notion_page(self, page_id: str) -> Dict[str, Any]:
        """
        Notion 페이지 정보 조회

        Args:
            page_id: Notion 페이지 ID (32자 해시)

        Returns:
            페이지 정보 딕셔너리

        Raises:
            APIResponseError: Notion API 에러
        """
        try:
            page = self.client.pages.retrieve(page_id=page_id)
            return page
        except APIResponseError as e:
            # Notion API 에러를 그대로 전파
            raise e

    def get_notion_blocks(self, block_id: str) -> List[Dict[str, Any]]:
        """
        Notion 블록 목록 조회

        Args:
            block_id: Notion 블록 ID (페이지 ID와 동일)

        Returns:
            블록 정보 리스트

        Raises:
            APIResponseError: Notion API 에러
        """
        try:
            # 블록 목록 가져오기 (페이지네이션 처리)
            blocks = []
            has_more = True
            start_cursor = None

            while has_more:
                response = self.client.blocks.children.list(
                    block_id=block_id,
                    start_cursor=start_cursor,
                    page_size=100
                )
                blocks.extend(response.get("results", []))
                has_more = response.get("has_more", False)
                start_cursor = response.get("next_cursor")

            return blocks
        except APIResponseError as e:
            raise e

    def extract_rich_text_content(self, rich_text_array: List[Dict[str, Any]]) -> str:
        """
        Notion rich text 배열에서 순수 텍스트 추출

        Args:
            rich_text_array: Notion rich text 객체 배열

        Returns:
            합쳐진 텍스트 문자열
        """
        if not rich_text_array:
            return ""

        return "".join([rt.get("plain_text", "") for rt in rich_text_array])

    def extract_page_title(self, page: Dict[str, Any]) -> str:
        """
        Notion 페이지에서 제목 추출

        Args:
            page: Notion 페이지 객체

        Returns:
            페이지 제목 (없으면 "Untitled")
        """
        properties = page.get("properties", {})

        # title 속성 찾기 (속성 이름이 다양할 수 있음)
        for prop_name, prop_value in properties.items():
            if prop_value.get("type") == "title":
                title_array = prop_value.get("title", [])
                title = self.extract_rich_text_content(title_array)
                return title if title else "Untitled"

        return "Untitled"

    def extract_page_icon(self, page: Dict[str, Any]) -> Optional[str]:
        """
        Notion 페이지에서 아이콘 추출

        Args:
            page: Notion 페이지 객체

        Returns:
            이모지 아이콘 (없으면 None)
        """
        icon = page.get("icon")
        if icon and icon.get("type") == "emoji":
            return icon.get("emoji")
        return None

    def convert_notion_block_to_our_format(
        self, notion_block: Dict[str, Any], order: float
    ) -> Dict[str, Any]:
        """
        Notion 블록을 우리 시스템 형식으로 변환

        Args:
            notion_block: Notion 블록 객체
            order: 블록 순서

        Returns:
            우리 시스템 블록 형식의 딕셔너리
        """
        block_type = notion_block.get("type")
        our_block_type = NOTION_TO_OUR_BLOCK_TYPE.get(block_type, "text")

        # 블록 내용 추출
        block_data = notion_block.get(block_type, {})
        content = ""

        # 텍스트 기반 블록들
        if block_type in [
            "paragraph",
            "heading_1",
            "heading_2",
            "heading_3",
            "bulleted_list_item",
            "numbered_list_item",
            "quote",
        ]:
            rich_text = block_data.get("rich_text", [])
            content = self.extract_rich_text_content(rich_text)

        # To-do 블록
        elif block_type == "to_do":
            rich_text = block_data.get("rich_text", [])
            text = self.extract_rich_text_content(rich_text)
            checked = block_data.get("checked", False)
            # 체크 상태를 마크다운 형식으로 표현
            content = f"[{'x' if checked else ' '}] {text}"

        # 코드 블록
        elif block_type == "code":
            rich_text = block_data.get("rich_text", [])
            content = self.extract_rich_text_content(rich_text)
            language = block_data.get("language", "")
            if language:
                content = f"```{language}\n{content}\n```"

        # Divider는 내용 없음
        elif block_type == "divider":
            content = "---"

        return {
            "type": our_block_type,
            "content": content,
            "order": order,
        }

    def convert_notion_blocks_to_our_format(
        self, notion_blocks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Notion 블록 배열을 우리 시스템 형식으로 변환

        Args:
            notion_blocks: Notion 블록 객체 리스트

        Returns:
            우리 시스템 블록 형식의 리스트
        """
        our_blocks = []

        for idx, notion_block in enumerate(notion_blocks):
            # 지원하지 않는 블록 타입은 건너뛰기
            block_type = notion_block.get("type")
            if block_type not in NOTION_TO_OUR_BLOCK_TYPE:
                continue

            our_block = self.convert_notion_block_to_our_format(
                notion_block, order=float(idx)
            )
            our_blocks.append(our_block)

        return our_blocks


# 편의를 위한 헬퍼 함수들

def get_notion_service() -> NotionService:
    """
    NotionService 인스턴스 생성

    Returns:
        NotionService 인스턴스

    Raises:
        ValueError: API 키가 없을 때
    """
    return NotionService()
