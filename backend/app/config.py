"""
환경 변수 설정 관리 모듈

Notion API 키와 같은 민감한 정보를 .env 파일에서 읽어옵니다.

.env 파일 설정 예시:
NOTION_API_KEY=your_notion_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

참고: ANTHROPIC_API_KEY는 AI 메모장 기능 사용 시 필요합니다.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """
    애플리케이션 설정 클래스

    .env 파일에서 자동으로 환경 변수를 읽어옵니다.
    """
    notion_api_key: Optional[str] = None  # Notion Integration API 키
    anthropic_api_key: Optional[str] = None  # Anthropic Claude API 키

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def validate_notion_api_key(self) -> bool:
        """
        Notion API 키가 설정되었는지 확인

        Returns:
            bool: API 키가 유효하면 True, 아니면 False
        """
        return self.notion_api_key is not None and len(self.notion_api_key) > 0

    def get_notion_api_key(self) -> str:
        """
        Notion API 키 반환. 키가 없으면 명확한 에러 발생.

        Returns:
            str: Notion API 키

        Raises:
            ValueError: API 키가 설정되지 않은 경우
        """
        if not self.validate_notion_api_key():
            raise ValueError(
                "NOTION_API_KEY is not configured. "
                "Please set it in .env file or environment variables. "
                "Get your API key from: https://www.notion.so/my-integrations"
            )
        return self.notion_api_key


# 전역 설정 인스턴스
settings = Settings()
