"""
환경 변수 설정 관리 모듈

Notion API 키와 같은 민감한 정보를 .env 파일에서 읽어옵니다.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    애플리케이션 설정 클래스

    .env 파일에서 자동으로 환경 변수를 읽어옵니다.
    """
    notion_api_key: Optional[str] = None  # Notion Integration API 키

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# 전역 설정 인스턴스
settings = Settings()
