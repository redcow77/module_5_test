"""
Claude AI 서비스 모듈

Anthropic Claude API를 사용하여 메모 요약 및 태그 자동 생성 기능 제공
"""

from typing import Dict, List, Optional
from anthropic import Anthropic, APIError

from app.config import settings


class ClaudeAIService:
    """
    Claude AI API 클라이언트 래퍼 클래스

    메모 요약 및 태그 생성을 담당합니다.
    """

    # Claude Haiku 모델 사용 (빠르고 저렴)
    MODEL = "claude-3-5-haiku-20241022"

    def __init__(self, api_key: Optional[str] = None):
        """
        Claude 클라이언트 초기화

        Args:
            api_key: Anthropic API 키 (없으면 설정에서 가져옴)

        Raises:
            ValueError: API 키가 없을 때
        """
        self.api_key = api_key or settings.anthropic_api_key
        if not self.api_key:
            raise ValueError("Anthropic API 키가 설정되지 않았습니다.")

        self.client = Anthropic(api_key=self.api_key)

    def summarize_memo(self, content: str) -> str:
        """
        메모 내용을 200자 이내로 요약

        Args:
            content: 메모 내용

        Returns:
            요약된 텍스트

        Raises:
            APIError: Claude API 에러
        """
        prompt = f"""다음 메모를 200자 이내로 간결하게 요약해주세요.
핵심 내용만 포함하고, 불필요한 말은 빼주세요.

메모 내용:
{content}

요약:"""

        try:
            message = self.client.messages.create(
                model=self.MODEL,
                max_tokens=300,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # 응답에서 텍스트 추출
            summary = message.content[0].text.strip()
            return summary

        except APIError as e:
            # API 에러를 상위로 전파
            raise e

    def generate_tags(self, content: str) -> List[str]:
        """
        메모 내용에서 핵심 키워드 태그 추출 (5개 이하)

        Args:
            content: 메모 내용

        Returns:
            태그 리스트 (최대 5개)

        Raises:
            APIError: Claude API 에러
        """
        prompt = f"""다음 메모에서 핵심 키워드를 5개 이하로 추출해주세요.
각 키워드는 쉼표로 구분하고, 단어나 짧은 구문으로 작성해주세요.

메모 내용:
{content}

키워드 (쉼표로 구분):"""

        try:
            message = self.client.messages.create(
                model=self.MODEL,
                max_tokens=100,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # 응답에서 텍스트 추출 및 태그 파싱
            tags_text = message.content[0].text.strip()
            # 쉼표로 분리하고 공백 제거
            tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]
            # 최대 5개로 제한
            return tags[:5]

        except APIError as e:
            raise e

    def process_memo(self, content: str) -> Dict[str, any]:
        """
        메모 내용을 AI로 처리 (요약 + 태그 생성)

        Args:
            content: 메모 내용

        Returns:
            {"summary": str, "tags": List[str]} 딕셔너리

        Raises:
            APIError: Claude API 에러
        """
        try:
            summary = self.summarize_memo(content)
            tags = self.generate_tags(content)

            return {
                "summary": summary,
                "tags": tags
            }

        except APIError as e:
            # API 에러를 상위로 전파
            raise e


# 편의를 위한 헬퍼 함수
def get_claude_service() -> ClaudeAIService:
    """
    ClaudeAIService 인스턴스 생성

    Returns:
        ClaudeAIService 인스턴스

    Raises:
        ValueError: API 키가 없을 때
    """
    return ClaudeAIService()
