# Phase 3: MCP 연동 - Notion API 통합 완료

## 구현 개요

Notion API를 통해 노션 페이지를 가져와 우리 시스템에 저장하는 기능을 구현했습니다.

## 생성된 파일 목록

### 1. 핵심 파일
```
backend/app/
├── config.py                    # 환경 변수 설정 관리
├── services/
│   ├── __init__.py
│   └── mcp_notion.py           # Notion API 클라이언트 서비스
├── schemas/
│   └── mcp.py                  # MCP 요청/응답 스키마
└── routers/
    └── mcp.py                  # MCP Import API 엔드포인트
```

### 2. 설정 파일
```
backend/
├── .env.example                # 환경 변수 템플릿
├── requirements.txt            # 업데이트됨 (notion-client, pydantic-settings 추가)
└── MCP_API_GUIDE.md           # API 사용 가이드
```

### 3. 테스트 파일
```
backend/
└── test_mcp_import.py         # 간단한 테스트 스크립트
```

### 4. 수정된 파일
```
backend/app/
└── main.py                     # MCP 라우터 등록 추가
```

## 빠른 시작 가이드

### 1. 패키지 설치
```bash
cd backend
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Notion Integration 생성
1. https://www.notion.so/my-integrations 접속
2. "New integration" 클릭하여 생성
3. API 키 복사 (secret_로 시작)

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일 편집:
```
NOTION_API_KEY=secret_your_actual_api_key_here
```

### 4. Notion 페이지 준비
1. 가져올 페이지에서 "..." 메뉴 → "Connections" → Integration 연결
2. 페이지 URL에서 32자 ID 복사

### 5. 서버 실행
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

### 6. 테스트
```bash
python test_mcp_import.py <your_32_char_page_id>
```

또는 Swagger UI: http://localhost:8000/docs

## API 명세

### POST /api/mcp/import

**요청:**
```json
{
  "notion_page_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "parent_id": null
}
```

**응답 (201 Created):**
```json
{
  "page_id": 1,
  "blocks_count": 10,
  "notion_page_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "title": "My Notion Page",
  "icon": "📄"
}
```

## 지원하는 Notion 블록 타입

| Notion | 우리 시스템 | 비고 |
|--------|-------------|------|
| paragraph | text | 일반 텍스트 |
| heading_1 | heading1 | 제목 1 |
| heading_2 | heading2 | 제목 2 |
| heading_3 | heading3 | 제목 3 |
| bulleted_list_item | bullet_list | 불릿 리스트 |
| numbered_list_item | numbered_list | 번호 리스트 |
| to_do | todo | 체크박스 |
| code | code | 코드 블록 |
| quote | quote | 인용구 |
| divider | divider | 구분선 |

## 에러 처리

| 상태 코드 | 설명 | 해결 방법 |
|-----------|------|-----------|
| 401 | API 키 없음 | .env 파일 확인 |
| 404 | 페이지/부모 페이지 없음 | ID 확인 및 Integration 연결 확인 |
| 502 | Notion API 에러 | Notion API 상태 확인 |

## 코드 구조 설명

### 1. config.py
- Pydantic Settings를 사용한 환경 변수 관리
- .env 파일 자동 로딩

### 2. services/mcp_notion.py
주요 클래스 및 함수:
- `NotionService`: Notion API 클라이언트 래퍼
- `get_notion_page()`: 페이지 정보 조회
- `get_notion_blocks()`: 블록 목록 조회 (페이지네이션 처리)
- `convert_notion_blocks_to_our_format()`: 블록 타입 변환

블록 변환 로직:
- Rich text 배열에서 순수 텍스트 추출
- To-do 블록의 체크 상태 처리
- 코드 블록의 언어 정보 보존

### 3. routers/mcp.py
- POST /api/mcp/import 엔드포인트
- 에러 처리 (API 키, 페이지 없음, API 에러)
- 트랜잭션 관리 (실패 시 롤백)

### 4. schemas/mcp.py
- `NotionImportRequest`: 요청 검증 (페이지 ID 32자 확인)
- `NotionImportResponse`: 응답 형식 정의

## 보안 고려사항

1. **.env 파일**: Git에 커밋되지 않도록 .gitignore에 포함됨
2. **API 키 검증**: 시작 시 API 키 존재 여부 확인
3. **에러 메시지**: 민감한 정보 노출 방지

## 제한사항 및 추후 개선 사항

### 현재 제한사항
- 최상위 레벨 블록만 지원 (중첩 블록 미지원)
- 이미지, 파일 등 미디어 블록 미지원
- 테이블, 데이터베이스 뷰 미지원

### 추후 개선 계획
- [ ] 이미지 블록 지원 (URL 저장)
- [ ] 중첩 블록 지원 (토글 내부 블록)
- [ ] 테이블 블록 지원
- [ ] 주기적 동기화 (Webhook 활용)
- [ ] 양방향 동기화 (우리 시스템 → Notion)

## 테스트 방법

### 1. 단위 테스트
```bash
pytest backend/test/test_mcp.py
```

### 2. 통합 테스트 (수동)
1. 테스트 Notion 페이지 생성
2. Integration 연결
3. 테스트 스크립트 실행:
   ```bash
   python test_mcp_import.py <page_id>
   ```
4. 프론트엔드에서 확인:
   ```
   http://localhost:3000/pages/<generated_page_id>
   ```

### 3. Swagger UI 테스트
1. http://localhost:8000/docs 접속
2. POST /api/mcp/import 선택
3. "Try it out" 클릭
4. 요청 본문 입력 및 실행

## 문제 해결

### "Notion API 키가 설정되지 않았습니다"
- `.env` 파일이 `backend/` 디렉토리에 있는지 확인
- 서버 재시작

### "object_not_found" 에러
- Integration이 페이지에 연결되어 있는지 확인
- 페이지 ID에 하이픈(-)이 있다면 제거

### 블록이 가져와지지 않음
- 지원하지 않는 블록 타입인지 확인
- Notion API 응답 확인 (디버깅 로그 추가)

## 참고 문서

- [MCP_API_GUIDE.md](./MCP_API_GUIDE.md) - 상세 API 사용 가이드
- [Notion API 문서](https://developers.notion.com/)
- [Pydantic Settings 문서](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

## 작업 완료 체크리스트

- [x] config.py 생성 - 환경 변수 관리
- [x] services/mcp_notion.py 생성 - Notion API 클라이언트
- [x] routers/mcp.py 생성 - Import 엔드포인트
- [x] schemas/mcp.py 생성 - 요청/응답 스키마
- [x] requirements.txt 업데이트
- [x] main.py 업데이트 - 라우터 등록
- [x] .env.example 생성
- [x] 문서 작성 (MCP_API_GUIDE.md)
- [x] 테스트 스크립트 작성
- [x] 에러 처리 구현
- [x] 코드 주석 추가

## 수정한 파일 요약

### 새로 생성된 파일 (8개)
1. `backend/app/config.py`
2. `backend/app/services/__init__.py`
3. `backend/app/services/mcp_notion.py`
4. `backend/app/schemas/mcp.py`
5. `backend/app/routers/mcp.py`
6. `backend/.env.example`
7. `backend/MCP_API_GUIDE.md`
8. `backend/test_mcp_import.py`

### 수정된 파일 (2개)
1. `backend/app/main.py` - MCP 라우터 import 및 등록
2. `backend/requirements.txt` - notion-client, pydantic-settings 추가

## 다음 단계 (프론트엔드 연동)

프론트엔드에서 Notion Import 기능을 사용하려면:

1. API 함수 추가 (`frontend/src/lib/api.ts`):
```typescript
export async function importNotionPage(notionPageId: string, parentId?: number) {
  const response = await fetch('/api/mcp/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notion_page_id: notionPageId, parent_id: parentId }),
  });
  if (!response.ok) throw new Error('Failed to import');
  return response.json();
}
```

2. UI 컴포넌트 추가 (Import 버튼, 입력 폼 등)

3. 사이드바에 "Import from Notion" 메뉴 추가

---

**작성자:** Backend Agent (BE-CRUD Skill)
**작성일:** 2026-02-05
