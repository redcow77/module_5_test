---
name: FE-TEST
description: 프론트엔드 테스트 코드를 작성합니다. Jest와 React Testing Library를 사용하여 컴포넌트, 페이지, 유틸리티 함수의 단위/통합 테스트를 구현합니다.
context: fork
agent: fe-agent
---

# FE TEST 작성 가이드

## 개요
Next.js 프론트엔드 애플리케이션의 테스트 코드를 작성합니다. 컴포넌트, 페이지, API 호출 등을 검증하여 안정적인 코드를 유지합니다.

## 기술 스택

- **Test Framework**: Jest
- **Component Testing**: React Testing Library
- **API Mocking**: MSW (Mock Service Worker)
- **User Interaction**: @testing-library/user-event
- **Coverage**: Jest Coverage

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                # 페이지
│   ├── components/         # 컴포넌트
│   └── lib/                # 유틸리티
├── __tests__/              # 테스트 파일
│   ├── components/         # 컴포넌트 테스트
│   ├── pages/              # 페이지 테스트
│   └── lib/                # 유틸리티 테스트
├── jest.config.js          # Jest 설정
└── jest.setup.js           # 테스트 환경 설정
```

## 파일별 가이드

- [setup.md](references/setup.md) - Jest 및 React Testing Library 설정
- [component-testing.md](references/component-testing.md) - 컴포넌트 테스트 패턴
- [integration-testing.md](references/integration-testing.md) - 통합 테스트 (페이지, API)
- [commands.md](references/commands.md) - 테스트 실행 명령어

## 테스트 작성 원칙

### ✅ DO
- 사용자 관점에서 테스트 작성
- 구현 세부사항이 아닌 동작을 테스트
- 의미 있는 테스트 이름 사용
- AAA 패턴 (Arrange, Act, Assert) 따르기
- 테스트 격리 (각 테스트는 독립적)

### ❌ DON'T
- 내부 상태나 구현 세부사항 테스트
- 너무 많은 것을 하나의 테스트에서 검증
- 스냅샷 테스트 남용
- 타사 라이브러리 테스트
- 테스트 간 의존성 생성

## 테스트 유형

### 1. 단위 테스트 (Unit Test)
- 개별 컴포넌트 테스트
- 유틸리티 함수 테스트
- 순수 함수 테스트

### 2. 통합 테스트 (Integration Test)
- 여러 컴포넌트 조합 테스트
- API 호출 포함 테스트
- 페이지 전체 흐름 테스트

### 3. E2E 테스트 (End-to-End)
- Playwright, Cypress 등 사용 (별도 설정 필요)

## 실행 명령어

```bash
# 전체 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage

# 특정 파일만 테스트
npm test UserCard.test.tsx
```

## 파일 네이밍 규칙

```
Component.tsx       → Component.test.tsx
utils.ts           → utils.test.ts
page.tsx           → page.test.tsx
```

또는

```
Component.tsx       → Component.spec.tsx
```

## 예시 테스트 구조

```tsx
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button', () => {
  it('renders with correct text', () => {
    // Arrange
    render(<Button>Click me</Button>)

    // Assert
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    // Arrange
    const handleClick = jest.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click me</Button>)

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 커버리지 목표

- **Statements**: 80% 이상
- **Branches**: 75% 이상
- **Functions**: 80% 이상
- **Lines**: 80% 이상

## 테스트 우선순위

### High Priority (필수)
1. 사용자 상호작용 (클릭, 입력, 제출)
2. 조건부 렌더링
3. API 호출 및 에러 처리
4. 폼 검증

### Medium Priority (권장)
1. 컴포넌트 Props 변화
2. 상태 변화
3. 라우팅

### Low Priority (선택)
1. 스타일링
2. 정적 콘텐츠
3. 타사 라이브러리 래퍼

## 주의사항

- **Next.js App Router**: 서버 컴포넌트는 테스트하기 어려울 수 있음. 클라이언트 컴포넌트 위주로 테스트
- **async/await**: 비동기 작업은 waitFor, findBy 사용
- **Mocking**: API 호출은 MSW로 모킹
- **Clean up**: 테스트 후 정리 작업 필요시 afterEach 사용
