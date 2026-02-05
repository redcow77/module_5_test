# README 작성 가이드

## 기본 구조

### 1. 헤더 섹션

```markdown
# 프로젝트 이름

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://github.com/user/repo/workflows/tests/badge.svg)](https://github.com/user/repo/actions)

짧고 명확한 프로젝트 설명 (1-2문장)

![Screenshot](docs/images/screenshot.png)
```

### 2. 목차 (선택적, 긴 README용)

```markdown
## 목차
- [주요 기능](#주요-기능)
- [시작하기](#시작하기)
- [사용법](#사용법)
- [API 문서](#api-문서)
- [기여하기](#기여하기)
- [라이센스](#라이센스)
```

### 3. 주요 기능

```markdown
## 주요 기능

- ✨ **기능 1**: 간단한 설명
- 🚀 **기능 2**: 간단한 설명
- 🔒 **기능 3**: 간단한 설명
```

### 4. 기술 스택

```markdown
## 기술 스택

**Backend**
- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite

**Frontend**
- Next.js 14
- TypeScript
- Tailwind CSS
- React Testing Library
```

### 5. 시작하기

```markdown
## 시작하기

### 필수 요구사항
- Node.js 18+
- Python 3.12+
- npm 또는 yarn

### 설치

1. 레포지토리 클론
\`\`\`bash
git clone https://github.com/username/project.git
cd project
\`\`\`

2. 의존성 설치

**백엔드**
\`\`\`bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
\`\`\`

**프론트엔드**
\`\`\`bash
cd frontend
npm install
\`\`\`

3. 환경 변수 설정
\`\`\`bash
cp .env.example .env
# .env 파일 편집
\`\`\`

### 실행

**백엔드 (localhost:8000)**
\`\`\`bash
cd backend
uvicorn app.main:app --reload
\`\`\`

**프론트엔드 (localhost:3000)**
\`\`\`bash
cd frontend
npm run dev
\`\`\`
```

### 6. 사용법

```markdown
## 사용법

### 기본 예시

\`\`\`typescript
import { fetchUsers } from '@/lib/api'

const users = await fetchUsers()
console.log(users)
\`\`\`

### API 호출

\`\`\`bash
curl -X GET http://localhost:8000/api/users
\`\`\`
```

### 7. 프로젝트 구조

```markdown
## 프로젝트 구조

\`\`\`
project/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
└── README.md
\`\`\`
```

### 8. API 문서

```markdown
## API 문서

자동 생성된 API 문서는 다음에서 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 주요 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users` | 사용자 목록 조회 |
| POST | `/api/users` | 새 사용자 생성 |
| GET | `/api/users/{id}` | 사용자 상세 조회 |
```

### 9. 테스트

```markdown
## 테스트

**백엔드 테스트**
\`\`\`bash
cd backend
pytest
\`\`\`

**프론트엔드 테스트**
\`\`\`bash
cd frontend
npm test
\`\`\`

**커버리지 확인**
\`\`\`bash
npm run test:coverage
\`\`\`
```

### 10. 배포

```markdown
## 배포

### Docker 사용

\`\`\`bash
docker-compose up -d
\`\`\`

### 수동 배포

1. 프로덕션 빌드
\`\`\`bash
cd frontend
npm run build
\`\`\`

2. 백엔드 실행
\`\`\`bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
\`\`\`
```

### 11. 기여하기

```markdown
## 기여하기

기여는 언제나 환영합니다! 다음 절차를 따라주세요:

1. 이 레포지토리를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.
```

### 12. 라이센스

```markdown
## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
```

### 13. 문의 및 지원

```markdown
## 문의 및 지원

- 이슈: [GitHub Issues](https://github.com/user/repo/issues)
- 이메일: support@example.com
- 문서: [Wiki](https://github.com/user/repo/wiki)
```

### 14. 감사의 말

```markdown
## 감사의 말

- [FastAPI](https://fastapi.tiangolo.com/) - 백엔드 프레임워크
- [Next.js](https://nextjs.org/) - 프론트엔드 프레임워크
- 모든 기여자분들께 감사드립니다
```

## README 체크리스트

작성 완료 후 확인:

- [ ] 프로젝트 이름과 설명이 명확한가?
- [ ] 설치 방법이 단계별로 설명되어 있는가?
- [ ] 모든 명령어가 실행 가능한가?
- [ ] 스크린샷이 포함되어 있는가?
- [ ] 라이센스 정보가 명시되어 있는가?
- [ ] 기여 방법이 설명되어 있는가?
- [ ] 모든 링크가 동작하는가?
- [ ] 배지(badges)가 최신 상태인가?

## 좋은 README 예시

- [React](https://github.com/facebook/react)
- [Vue.js](https://github.com/vuejs/vue)
- [FastAPI](https://github.com/tiangolo/fastapi)
- [Awesome README](https://github.com/matiassingers/awesome-readme)

## 도구 및 리소스

### 배지 생성
- [Shields.io](https://shields.io/) - 커스텀 배지 생성

### README 생성기
- [readme.so](https://readme.so/) - 시각적 README 에디터
- [Make a README](https://www.makeareadme.com/) - README 가이드

### 템플릿
- [Standard Readme](https://github.com/RichardLitt/standard-readme)
- [Best README Template](https://github.com/othneildrew/Best-README-Template)
