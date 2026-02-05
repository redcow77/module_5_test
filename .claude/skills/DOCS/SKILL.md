---
name: DOCS
description: 프로젝트 문서를 작성하고 관리합니다. README, API 문서, 사용자 가이드, CHANGELOG 등을 생성하고 최신 상태로 유지합니다.
context: fork
---

# DOCS (문서 작성) 가이드

## 개요
프로젝트의 모든 문서를 체계적으로 작성하고 관리합니다. 개발자와 사용자 모두를 위한 명확하고 유용한 문서를 제공합니다.

## 문서 유형

### 1. README.md
- 프로젝트 소개
- 설치 및 실행 방법
- 주요 기능
- 기술 스택
- 프로젝트 구조

### 2. API 문서
- 엔드포인트 목록
- 요청/응답 예시
- 인증 방법
- 에러 코드

### 3. 사용자 가이드
- 기능별 사용 방법
- 스크린샷/동영상
- FAQ
- 트러블슈팅

### 4. CHANGELOG
- 버전별 변경 사항
- 주요 기능 추가
- 버그 수정
- Breaking Changes

### 5. 개발자 문서
- 아키텍처 설명
- 코딩 컨벤션
- 기여 가이드 (CONTRIBUTING.md)
- 개발 환경 설정

## 파일별 가이드

- [readme-guide.md](references/readme-guide.md) - README 작성 가이드
- [api-docs-guide.md](references/api-docs-guide.md) - API 문서 작성
- [changelog-guide.md](references/changelog-guide.md) - CHANGELOG 작성
- [user-guide-template.md](references/user-guide-template.md) - 사용자 가이드 템플릿

## 작성 원칙

### ✅ DO
- 명확하고 간결한 언어 사용
- 코드 예시 포함
- 스크린샷/다이어그램 활용
- 최신 상태 유지
- 검색 가능한 키워드 사용

### ❌ DON'T
- 전문 용어 남용
- 오래된 정보 방치
- 너무 길거나 장황한 설명
- 이미지 없는 복잡한 설명
- 모호한 표현

## 문서 구조

```
프로젝트/
├── README.md                    # 프로젝트 메인 문서
├── CHANGELOG.md                 # 변경 이력
├── CONTRIBUTING.md              # 기여 가이드
├── docs/
│   ├── API.md                   # API 문서
│   ├── ARCHITECTURE.md          # 아키텍처 설명
│   ├── SETUP.md                 # 개발 환경 설정
│   └── USER_GUIDE.md            # 사용자 가이드
└── .github/
    └── ISSUE_TEMPLATE.md        # 이슈 템플릿
```

## 업데이트 시점

### 즉시 업데이트
- 새 기능 추가
- API 변경
- Breaking Changes
- 설치 방법 변경

### 정기 업데이트
- 스크린샷 갱신
- 성능 벤치마크
- 지원 버전 정보

### 릴리스 시 업데이트
- CHANGELOG
- 버전 번호
- 마이그레이션 가이드

## 도구 활용

### Markdown 린터
```bash
markdownlint README.md
```

### 링크 체커
```bash
markdown-link-check README.md
```

### API 문서 자동 생성
- FastAPI: 자동 Swagger UI (http://localhost:8000/docs)
- TypeDoc: TypeScript 문서 생성

## 예시

### README.md 기본 구조
```markdown
# 프로젝트 이름

간단한 프로젝트 설명 (1-2문장)

## 주요 기능
- 기능 1
- 기능 2

## 기술 스택
- Backend: FastAPI
- Frontend: Next.js

## 시작하기

### 설치
\`\`\`bash
npm install
\`\`\`

### 실행
\`\`\`bash
npm run dev
\`\`\`

## API 문서
http://localhost:8000/docs

## 라이센스
MIT
```

## 문서 품질 체크리스트

- [ ] 오타 및 문법 확인
- [ ] 모든 링크 동작 확인
- [ ] 코드 예시 실행 가능
- [ ] 스크린샷 최신 버전
- [ ] 버전 정보 정확
- [ ] 설치 가이드 검증
- [ ] 다국어 지원 (필요시)
