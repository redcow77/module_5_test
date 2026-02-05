"""
MCP Notion Import 기능 테스트 스크립트

사용법:
    python test_mcp_import.py <notion_page_id>

예제:
    python test_mcp_import.py a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
"""

import sys
import requests
import json


def test_mcp_import(notion_page_id: str, parent_id: int = None):
    """
    MCP Import API 테스트

    Args:
        notion_page_id: Notion 페이지 ID (32자)
        parent_id: 부모 페이지 ID (선택사항)
    """
    url = "http://localhost:8000/api/mcp/import"

    payload = {
        "notion_page_id": notion_page_id,
        "parent_id": parent_id
    }

    print(f"🚀 Notion 페이지 가져오기 시작...")
    print(f"📄 페이지 ID: {notion_page_id}")
    print(f"🔗 API 호출: {url}")
    print()

    try:
        response = requests.post(url, json=payload)

        if response.status_code == 201:
            result = response.json()
            print("✅ 성공!")
            print(f"📝 제목: {result['title']}")
            print(f"🆔 생성된 페이지 ID: {result['page_id']}")
            print(f"📦 가져온 블록 수: {result['blocks_count']}")
            if result.get('icon'):
                print(f"🎨 아이콘: {result['icon']}")
            print()
            print("✨ 이제 프론트엔드에서 확인해보세요:")
            print(f"   http://localhost:3000/pages/{result['page_id']}")

        elif response.status_code == 401:
            print("❌ 에러: Notion API 키가 설정되지 않았습니다.")
            print("   해결 방법: .env 파일에 NOTION_API_KEY를 추가하세요.")
            print("   예: NOTION_API_KEY=secret_xxxxx")

        elif response.status_code == 404:
            error = response.json()
            print(f"❌ 에러: {error['detail']}")
            print("   해결 방법:")
            print("   1. 페이지 ID가 올바른지 확인하세요 (32자)")
            print("   2. Integration이 Notion 페이지에 연결되어 있는지 확인하세요")

        elif response.status_code == 502:
            error = response.json()
            print(f"❌ 에러: Notion API 문제")
            print(f"   상세: {error['detail']}")

        else:
            print(f"❌ 에러 ({response.status_code})")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("❌ 에러: 서버에 연결할 수 없습니다.")
        print("   해결 방법: 백엔드 서버가 실행 중인지 확인하세요.")
        print("   실행 명령어: cd backend && uvicorn app.main:app --reload")

    except Exception as e:
        print(f"❌ 예상치 못한 에러: {str(e)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python test_mcp_import.py <notion_page_id>")
        print("예제: python test_mcp_import.py a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6")
        sys.exit(1)

    notion_page_id = sys.argv[1]

    # 페이지 ID 검증
    if len(notion_page_id) != 32:
        print(f"⚠️  경고: 페이지 ID 길이가 32자가 아닙니다. (현재: {len(notion_page_id)}자)")
        print("   하이픈(-)이 포함되어 있다면 제거해주세요.")
        print()

    test_mcp_import(notion_page_id)
