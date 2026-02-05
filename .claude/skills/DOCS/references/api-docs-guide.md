# API 문서 작성 가이드

## FastAPI 자동 문서

FastAPI는 자동으로 API 문서를 생성합니다:

### Swagger UI
- URL: `http://localhost:8000/docs`
- 인터랙티브 API 테스트 가능
- OAuth2 인증 지원

### ReDoc
- URL: `http://localhost:8000/redoc`
- 깔끔한 읽기 전용 문서
- 다운로드 가능

## Docstring 작성

### 함수 레벨 문서

```python
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    사용자 목록을 조회합니다.

    Parameters:
    - **skip**: 건너뛸 항목 수 (기본값: 0)
    - **limit**: 최대 반환 항목 수 (기본값: 100, 최대: 1000)

    Returns:
    - 사용자 목록 (UserResponse 객체 배열)

    Raises:
    - 500: 서버 에러
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

### 스키마 문서화

```python
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    """사용자 생성 요청 스키마"""

    name: str = Field(
        ...,
        title="이름",
        description="사용자 이름 (1-100자)",
        min_length=1,
        max_length=100,
        example="홍길동"
    )
    email: str = Field(
        ...,
        title="이메일",
        description="유효한 이메일 주소",
        example="user@example.com"
    )
    age: int = Field(
        ...,
        title="나이",
        description="사용자 나이 (0-150)",
        ge=0,
        le=150,
        example=25
    )

    class Config:
        schema_extra = {
            "example": {
                "name": "홍길동",
                "email": "hong@example.com",
                "age": 30
            }
        }
```

## API 문서 구조

### 1. 개요

```markdown
# API 문서

## 기본 정보
- Base URL: `http://localhost:8000`
- API Version: v1
- Content-Type: `application/json`

## 인증
모든 API는 Bearer 토큰 인증을 사용합니다.

\`\`\`bash
Authorization: Bearer <your-token>
\`\`\`
```

### 2. 엔드포인트 목록

```markdown
## 엔드포인트

### 사용자 (Users)

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/users` | 사용자 목록 조회 | No |
| POST | `/api/users` | 새 사용자 생성 | Yes |
| GET | `/api/users/{id}` | 사용자 상세 조회 | No |
| PUT | `/api/users/{id}` | 사용자 정보 수정 | Yes |
| DELETE | `/api/users/{id}` | 사용자 삭제 | Yes |
```

### 3. 상세 설명

```markdown
## GET /api/users

사용자 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| skip | integer | No | 0 | 건너뛸 항목 수 |
| limit | integer | No | 100 | 최대 반환 항목 수 (최대: 1000) |

**Example Request**

\`\`\`bash
curl -X GET "http://localhost:8000/api/users?skip=0&limit=10"
\`\`\`

### 응답

**Success Response (200 OK)**

\`\`\`json
[
  {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "age": 30,
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "김철수",
    "email": "kim@example.com",
    "age": 25,
    "created_at": "2024-01-02T00:00:00Z"
  }
]
\`\`\`

**Error Responses**

| 코드 | 설명 |
|------|------|
| 500 | Internal Server Error |

---

## POST /api/users

새 사용자를 생성합니다.

### 요청

**Headers**

\`\`\`
Content-Type: application/json
Authorization: Bearer <token>
\`\`\`

**Body**

\`\`\`json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "age": 30
}
\`\`\`

**Schema**

| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| name | string | Yes | 1-100자 | 사용자 이름 |
| email | string | Yes | 이메일 형식 | 이메일 주소 |
| age | integer | Yes | 0-150 | 나이 |

**Example Request**

\`\`\`bash
curl -X POST "http://localhost:8000/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com",
    "age": 30
  }'
\`\`\`

### 응답

**Success Response (201 Created)**

\`\`\`json
{
  "id": 3,
  "name": "홍길동",
  "email": "hong@example.com",
  "age": 30,
  "created_at": "2024-01-03T00:00:00Z"
}
\`\`\`

**Error Responses**

| 코드 | 설명 | 예시 |
|------|------|------|
| 400 | Bad Request | 잘못된 요청 형식 |
| 401 | Unauthorized | 인증 토큰 없음 |
| 422 | Validation Error | 이메일 형식 오류 |
| 500 | Internal Server Error | 서버 에러 |

**Validation Error Example (422)**

\`\`\`json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
\`\`\`
```

### 4. 인증

```markdown
## 인증

### JWT 토큰 발급

**POST /api/auth/login**

\`\`\`bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
\`\`\`

**Response**

\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
\`\`\`

### 토큰 사용

모든 보호된 엔드포인트에 다음 헤더를 포함:

\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`
```

### 5. 에러 코드

```markdown
## 에러 코드

| 코드 | 이름 | 설명 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 성공 (응답 본문 없음) |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 422 | Validation Error | 유효성 검증 실패 |
| 500 | Internal Server Error | 서버 에러 |
```

## 도구 및 생성기

### Swagger/OpenAPI
- FastAPI 자동 생성
- `/openapi.json` 엔드포인트

### Postman
- OpenAPI 스펙 import
- 컬렉션 공유

### Insomnia
- API 테스트 및 문서화

## API 문서 체크리스트

- [ ] 모든 엔드포인트 문서화
- [ ] 요청/응답 예시 포함
- [ ] 에러 케이스 설명
- [ ] 인증 방법 명시
- [ ] 파라미터 제약 사항 기술
- [ ] 스키마 정의 완료
- [ ] 실제 동작하는 예시 제공
- [ ] 버전 정보 명시
