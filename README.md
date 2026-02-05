# Module 5 - Full Stack Web Application

풀스택 웹 애플리케이션으로 프론트엔드(Next.js)와 백엔드(FastAPI)가 분리된 구조의 프로젝트입니다.

## 주요 기능

- CRUD API 엔드포인트 (FastAPI)
- 데이터 검증 및 타입 안전성 (Pydantic)
- RESTful API 아키텍처
- Next.js App Router 기반 프론트엔드
- Tailwind CSS를 활용한 스타일링
- SQLite 데이터베이스 연동

## 기술 스택

### Backend
- **Python 3.12**
- **FastAPI 0.109.0** - 고성능 웹 프레임워크
- **SQLAlchemy 2.0.25** - ORM (Object-Relational Mapping)
- **Pydantic 2.5.3** - 데이터 검증 및 직렬화
- **Uvicorn 0.27.0** - ASGI 서버
- **SQLite** - 경량 데이터베이스

### Frontend
- **Next.js 14.2** - React 프레임워크 (App Router)
- **React 18.2** - UI 라이브러리
- **TypeScript 5.0** - 타입 안전성
- **Tailwind CSS 3.4** - 유틸리티 CSS 프레임워크
- **ESLint** - 코드 품질 관리

## 프로젝트 구조

```
module5/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py         # FastAPI 앱 진입점, CORS 설정
│   │   ├── database.py     # SQLAlchemy 엔진 및 세션 관리
│   │   ├── models/         # SQLAlchemy ORM 모델 정의
│   │   ├── schemas/        # Pydantic 스키마 (요청/응답 검증)
│   │   └── routers/        # API 엔드포인트 (APIRouter)
│   │       └── examples.py # Example CRUD API
│   ├── requirements.txt    # Python 의존성
│   └── app.db             # SQLite 데이터베이스 (자동 생성)
│
├── frontend/               # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/           # Next.js App Router 페이지
│   │   │   ├── page.tsx   # 메인 페이지
│   │   │   ├── layout.tsx # 루트 레이아웃
│   │   │   └── globals.css # 전역 스타일
│   │   └── components/    # React 컴포넌트
│   ├── package.json       # Node.js 의존성
│   ├── next.config.js     # Next.js 설정 (API 프록시 포함)
│   ├── tsconfig.json      # TypeScript 설정
│   └── tailwind.config.ts # Tailwind CSS 설정
│
├── CLAUDE.md              # Claude Code 가이드
└── README.md              # 프로젝트 문서 (본 파일)
```

## 설치 방법

### 사전 요구사항
- **Node.js** 20.x 이상
- **Python** 3.12 이상
- **npm** 또는 **yarn**

### 1. 저장소 클론
```bash
git clone <repository-url>
cd module5
```

### 2. 백엔드 설치

#### Windows
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

#### macOS/Linux
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. 프론트엔드 설치
```bash
cd frontend
npm install
```

## 실행 방법

### 백엔드 실행 (포트 8000)

```bash
cd backend
.venv\Scripts\activate    # Windows
# source .venv/bin/activate  # macOS/Linux

uvicorn app.main:app --reload
```

백엔드 서버가 `http://localhost:8000`에서 실행됩니다.

#### API 문서 확인
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/health

### 프론트엔드 실행 (포트 3000)

새 터미널에서:
```bash
cd frontend
npm run dev
```

프론트엔드 서버가 `http://localhost:3000`에서 실행됩니다.

## 주요 API 엔드포인트

### Examples API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/examples` | 모든 예제 목록 조회 |
| GET | `/api/examples/{id}` | 특정 예제 조회 |
| POST | `/api/examples` | 새 예제 생성 |
| DELETE | `/api/examples/{id}` | 예제 삭제 |

### 요청/응답 예시

#### 예제 생성 (POST /api/examples)
```json
// Request Body
{
  "name": "Example 1",
  "description": "This is an example"
}

// Response
{
  "id": 1,
  "name": "Example 1",
  "description": "This is an example"
}
```

## 아키텍처 설명

### API 프록시
프론트엔드의 `/api/*` 요청은 `next.config.js`의 `rewrites` 설정을 통해 백엔드(`http://localhost:8000`)로 자동 프록시됩니다. 이를 통해 CORS 문제 없이 API를 호출할 수 있습니다.

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ];
}
```

### 데이터베이스
- **SQLite** 파일(`app.db`)은 `backend/` 폴더에 자동 생성됩니다.
- 서버 첫 실행 시 SQLAlchemy가 테이블을 자동으로 생성합니다.
- 개발 환경에 적합하며, 별도의 데이터베이스 서버 설치가 필요 없습니다.

### CORS 설정
백엔드는 프론트엔드(`http://localhost:3000`)로부터의 요청을 허용하도록 CORS가 설정되어 있습니다.

## 개발 가이드

### 새로운 API 엔드포인트 추가

1. **모델 정의** (`backend/app/models/`)
```python
from sqlalchemy import Column, Integer, String
from app.database import Base

class YourModel(Base):
    __tablename__ = "your_table"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
```

2. **스키마 정의** (`backend/app/schemas/`)
```python
from pydantic import BaseModel

class YourModelCreate(BaseModel):
    name: str

class YourModelResponse(BaseModel):
    id: int
    name: str
```

3. **라우터 생성** (`backend/app/routers/`)
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/your-endpoint", tags=["your-tag"])

@router.get("/")
def get_items(db: Session = Depends(get_db)):
    # 구현
    pass
```

4. **라우터 등록** (`backend/app/main.py`)
```python
from app.routers import your_router
app.include_router(your_router.router)
```

### 프론트엔드 페이지 추가

1. `frontend/src/app/` 하위에 폴더 생성
2. `page.tsx` 파일 작성
3. Next.js App Router가 자동으로 라우팅 생성

## 에이전트 구조

이 프로젝트는 도메인별 전문 에이전트를 사용합니다.

### 서브에이전트 및 담당 영역

| 에이전트 | 담당 영역 | 주요 Skills |
|----------|----------|-------------|
| `be-agent` | API 엔드포인트, 스키마, 비즈니스 로직 | BE-CRUD, BE-TEST, BE-DEBUG |
| `fe-agent` | 페이지, 컴포넌트, API 연동, 스타일링 | FE-CRUD, FE-page, FE-api |
| `review-agent` | 코드 품질, 보안, 성능 검토 | CODE-REVIEW |

### 권장 작업 순서
```
1. BE (be-agent)  →  2. FE (fe-agent)  →  3. Review (선택)
   API 엔드포인트        화면/연동 구현         코드 리뷰
```

자세한 내용은 [CLAUDE.md](CLAUDE.md)를 참조하세요.

## 빌드 및 배포

### 프론트엔드 빌드
```bash
cd frontend
npm run build
npm start  # 프로덕션 모드 실행
```

### 백엔드 프로덕션 실행
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 문제 해결

### 백엔드가 실행되지 않을 때
- Python 가상환경이 활성화되었는지 확인
- 포트 8000이 이미 사용 중인지 확인
- `requirements.txt`의 모든 패키지가 설치되었는지 확인

### 프론트엔드에서 API 호출이 실패할 때
- 백엔드 서버가 실행 중인지 확인 (`http://localhost:8000/docs`)
- `next.config.js`의 프록시 설정 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 데이터베이스 초기화
```bash
cd backend
rm app.db  # 데이터베이스 파일 삭제
# 서버 재시작 시 자동으로 새로 생성됨
```

## 추가 문서

- [Porting Guide](.claude/docs/Porting_guide.md) - 상세한 설치 및 포팅 가이드
- [CLAUDE.md](CLAUDE.md) - Claude Code 작업 가이드

## 라이센스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 기여

버그 리포트, 기능 제안 및 풀 리퀘스트를 환영합니다.
