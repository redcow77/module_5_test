---
name: CODE-REVIEW
description: 코드 리뷰를 수행합니다. 코드 품질, 보안, 성능, 베스트 프랙티스를 검토하고 개선 제안을 제공합니다. PR 리뷰, 커밋 전 검토, 전체 코드베이스 감사 등에 사용합니다.
context: fork
agent: review-agent
---

# CODE REVIEW 가이드

## 개요
백엔드와 프론트엔드 코드의 품질을 종합적으로 검토하여 개선 제안을 제공합니다.

## 기술 스택

**Backend**:
- Python 3.12+ / FastAPI
- SQLAlchemy ORM
- Pydantic

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## 리뷰 체크리스트

상세한 체크리스트는 참고 문서를 확인하세요:
- [checklist.md](references/checklist.md) - 공통 체크리스트
- [backend-guide.md](references/backend-guide.md) - 백엔드 전용 가이드
- [frontend-guide.md](references/frontend-guide.md) - 프론트엔드 전용 가이드
- [security.md](references/security.md) - 보안 체크리스트

## 리뷰 프로세스

### 1. 코드 분석
```bash
# 변경된 파일 확인
git status
git diff [branch]

# 또는 특정 파일들 직접 지정
```

### 2. 체크리스트 적용

**공통 사항**:
- ✅ 코드 가독성 (네이밍, 구조, 주석)
- ✅ 에러 처리
- ✅ 성능 (N+1 쿼리, 불필요한 연산)
- ✅ 보안 (SQL 인젝션, XSS, 인증/인가)
- ✅ 테스트 커버리지

**백엔드 전용**:
- ✅ API 설계 (RESTful, 상태 코드)
- ✅ 데이터베이스 쿼리 최적화
- ✅ Pydantic 스키마 검증
- ✅ 의존성 주입 (Depends)

**프론트엔드 전용**:
- ✅ 컴포넌트 구조 (재사용성, 분리)
- ✅ 상태 관리
- ✅ 타입 안정성 (TypeScript)
- ✅ 접근성 (a11y)

### 3. 리포트 작성

```markdown
# Code Review Report

## Summary
- 검토 파일: N개
- 발견 이슈: N개 (Critical: X, Warning: Y, Info: Z)

## Issues

### 🔴 Critical (즉시 수정 필요)
1. [파일명:라인] 이슈 설명
   - **문제**: 무엇이 문제인가
   - **영향**: 어떤 위험이 있는가
   - **해결**: 구체적인 수정 방법

### 🟡 Warning (수정 권장)
1. [파일명:라인] 이슈 설명
   - **문제**: ...
   - **해결**: ...

### 🔵 Info (개선 제안)
1. [파일명:라인] 이슈 설명
   - **제안**: ...

## Recommendations

전체적인 개선 방향 제시
```

## 리뷰 원칙

### ✅ DO
- 구체적인 파일명과 라인 번호 명시
- 문제와 해결책을 함께 제시
- 코드 예시 포함
- 우선순위 명확히 표시
- 긍정적인 부분도 언급

### ❌ DON'T
- 코드를 직접 수정하지 않음 (제안만 제공)
- 주관적인 스타일 선호도만으로 지적하지 않음
- 너무 사소한 부분에 집착하지 않음
- 비난하는 톤 사용하지 않음

## 사용 예시

### PR 리뷰
```
사용자: "최근 커밋 리뷰해줘"
리뷰 에이전트: [변경된 파일들 분석 후 리포트 제공]
```

### 전체 코드베이스 감사
```
사용자: "백엔드 전체 보안 검토해줘"
리뷰 에이전트: [보안 체크리스트 기준으로 전체 검토]
```

### 특정 파일 리뷰
```
사용자: "backend/app/routers/users.py 리뷰해줘"
리뷰 에이전트: [해당 파일 집중 리뷰]
```

## 출력 형식

리뷰 완료 시 다음 정보를 반환:
1. 검토한 파일 목록
2. 발견된 이슈 (우선순위별)
3. 개선 제안
4. 긍정적인 부분 (칭찬)
