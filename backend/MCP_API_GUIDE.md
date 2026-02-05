# MCP API 사용 가이드

## 개요
Notion API를 통해 노션 페이지를 가져와서 우리 시스템에 저장하는 기능입니다.

## 사전 준비

### 1. Notion Integration 생성
1. https://www.notion.so/my-integrations 접속
2. "New integration" 클릭
3. Integration 이름 입력 (예: "My App")
4. "Submit" 클릭
5. "Internal Integration Token" 복사 (secret_로 시작하는 긴 문자열)

### 2. Notion 페이지에 Integration 연결
1. 가져올 Notion 페이지 열기
2. 우측 상단 "..." 메뉴 클릭
3. "Connections" 선택
4. 생성한 Integration 검색 및 연결

### 3. Notion 페이지 ID 확인
페이지 URL에서 32자 해시 부분이 페이지 ID입니다.

```
https://www.notion.so/My-Page-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
                              ↑ 이 부분이 페이지 ID
```

하이픈(-)이 포함되어 있으면 제거해주세요:
```
a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
→ a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 4. 환경 변수 설정
`backend/.env` 파일 생성 (또는 `.env.example` 복사):

```bash
cp .env.example .env
```

`.env` 파일에 API 키 입력:
```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxx
```

### 5. 패키지 설치
```bash
cd backend
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

## API 엔드포인트

### POST /api/mcp/import

Notion 페이지를 가져와서 우리 시스템에 저장합니다.

**요청 본문:**
```json
{
  "notion_page_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "parent_id": null
}
```

**필드 설명:**
- `notion_page_id` (필수): Notion 페이지 ID (32자 해시)
- `parent_id` (선택): 우리 시스템에서 부모 페이지 ID

**응답 (성공 - 201 Created):**
```json
{
  "page_id": 1,
  "blocks_count": 10,
  "notion_page_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "title": "My Notion Page",
  "icon": "📄"
}
```

**응답 필드 설명:**
- `page_id`: 생성된 페이지 ID
- `blocks_count`: 가져온 블록 수
- `notion_page_id`: 원본 Notion 페이지 ID
- `title`: 페이지 제목
- `icon`: 페이지 아이콘 (이모지)

## 에러 처리

### 401 Unauthorized
```json
{
  "detail": "Notion API 키가 설정되지 않았습니다. .env 파일에 NOTION_API_KEY를 추가해주세요."
}
```
**해결 방법:** `.env` 파일에 `NOTION_API_KEY` 추가

### 404 Not Found (Notion 페이지)
```json
{
  "detail": "Notion 페이지를 찾을 수 없습니다. 페이지 ID: xxx"
}
```
**해결 방법:**
- 페이지 ID가 올바른지 확인
- Integration이 페이지에 연결되어 있는지 확인

### 404 Not Found (부모 페이지)
```json
{
  "detail": "부모 페이지를 찾을 수 없습니다. ID: xxx"
}
```
**해결 방법:** `parent_id`를 올바른 페이지 ID로 수정하거나 null로 설정

### 502 Bad Gateway
```json
{
  "detail": "Notion API 에러: object_not_found"
}
```
**해결 방법:** Notion API 상태 확인 또는 페이지 권한 확인

## 지원하는 블록 타입

| Notion 블록 타입 | 우리 시스템 타입 | 설명 |
|------------------|------------------|------|
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

지원하지 않는 블록 타입(이미지, 파일, 임베드 등)은 자동으로 건너뜁니다.

## 테스트 방법

### 1. Swagger UI 사용
1. 백엔드 서버 실행
   ```bash
   cd backend
   .venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. http://localhost:8000/docs 접속

3. "POST /api/mcp/import" 엔드포인트 선택

4. "Try it out" 클릭

5. 요청 본문 입력:
   ```json
   {
     "notion_page_id": "your-32-char-page-id",
     "parent_id": null
   }
   ```

6. "Execute" 클릭

### 2. cURL 사용
```bash
curl -X POST "http://localhost:8000/api/mcp/import" \
  -H "Content-Type: application/json" \
  -d '{
    "notion_page_id": "your-32-char-page-id",
    "parent_id": null
  }'
```

### 3. 프론트엔드에서 사용
```typescript
// frontend/src/lib/api.ts에 추가
export async function importNotionPage(notionPageId: string, parentId?: number) {
  const response = await fetch('/api/mcp/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notion_page_id: notionPageId,
      parent_id: parentId
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to import page');
  }

  return response.json();
}
```

## 주의사항

1. **API 키 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요. (이미 `.gitignore`에 포함됨)

2. **페이지 권한**: Integration이 페이지에 연결되어 있어야 접근 가능합니다.

3. **Rate Limit**: Notion API는 초당 3회 요청 제한이 있습니다. 대량 가져오기 시 주의하세요.

4. **블록 제한**: 현재는 기본 텍스트 블록만 지원합니다. 이미지, 파일 등은 추후 추가될 예정입니다.

5. **중첩 블록**: 현재는 최상위 레벨 블록만 가져옵니다. 토글 내부의 블록 등은 지원하지 않습니다.

## 문제 해결

### "Notion API 키가 설정되지 않았습니다"
- `.env` 파일이 `backend/` 디렉토리에 있는지 확인
- `NOTION_API_KEY` 값이 올바르게 입력되었는지 확인
- 서버 재시작

### "object_not_found" 에러
- Integration이 페이지에 연결되어 있는지 확인
- 페이지 ID가 올바른지 확인 (32자, 하이픈 제거)

### 블록이 가져와지지 않음
- Notion 페이지에 블록이 실제로 있는지 확인
- 지원하지 않는 블록 타입인지 확인

## 추가 개발 아이디어

- [ ] 이미지 블록 지원 (URL 저장)
- [ ] 중첩 블록 지원 (토글, 컬럼 등)
- [ ] 테이블 블록 지원
- [ ] 데이터베이스 뷰 지원
- [ ] 주기적 동기화 (Webhook)
- [ ] 양방향 동기화 (우리 시스템 → Notion)
