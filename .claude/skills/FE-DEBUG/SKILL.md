---
name: FE-DEBUG
description: 프론트엔드 에러를 분석하고 해결합니다. 브라우저 콘솔 에러, React 렌더링 이슈, Next.js 빌드 에러, TypeScript 타입 에러 등을 디버깅합니다.
context: fork
agent: fe-agent
---

# FE DEBUG 가이드

## 개요
프론트엔드 개발 중 발생하는 다양한 에러를 신속하게 파악하고 해결합니다.

## 디버깅 영역

### 1. 브라우저 콘솔 에러
- JavaScript 런타임 에러
- Network 요청 실패
- CORS 에러
- 404/500 에러

### 2. React 렌더링 이슈
- Hydration mismatch
- 무한 루프
- 메모리 누수
- Hook 규칙 위반

### 3. Next.js 빌드 에러
- 빌드 실패
- 서버/클라이언트 불일치
- 이미지 최적화 에러
- 라우팅 문제

### 4. TypeScript 타입 에러
- 타입 불일치
- 타입 추론 실패
- Generic 문제
- 외부 라이브러리 타입 없음

## 파일별 가이드

- [console-errors.md](references/console-errors.md) - 브라우저 콘솔 에러
- [react-issues.md](references/react-issues.md) - React 렌더링 이슈
- [nextjs-errors.md](references/nextjs-errors.md) - Next.js 특화 에러
- [typescript-errors.md](references/typescript-errors.md) - TypeScript 타입 에러

## 디버깅 도구

### Chrome DevTools
```
F12 또는 우클릭 > 검사
```

**주요 탭:**
- Console: 에러 메시지 확인
- Network: API 호출 확인
- Sources: 중단점 디버깅
- React DevTools: 컴포넌트 상태 확인

### VS Code 디버거
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Next.js: debug client-side",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

### React DevTools
- 컴포넌트 트리 확인
- Props/State 검사
- Profiler로 성능 분석

## 디버깅 프로세스

### 1. 에러 확인
```
- 콘솔 메시지 읽기
- 스택 트레이스 분석
- 에러 발생 위치 파악
```

### 2. 재현
```
- 에러 재현 시나리오 작성
- 최소 재현 케이스 만들기
```

### 3. 원인 파악
```
- 관련 코드 검토
- 데이터 흐름 추적
- 의존성 확인
```

### 4. 수정
```
- 수정 코드 작성
- 테스트로 검증
- 회귀 테스트
```

## 일반적인 에러 패턴

### Hydration Mismatch
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**원인:**
- 서버와 클라이언트 렌더링 결과 불일치
- Date, Random, window 객체 사용

**해결:**
```tsx
// ❌ Bad
export default function Component() {
  return <div>{new Date().toString()}</div>
}

// ✅ Good
'use client'
export default function Component() {
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(new Date().toString())
  }, [])

  return <div>{date}</div>
}
```

### Cannot read property of undefined
```
TypeError: Cannot read property 'name' of undefined
```

**해결:**
```tsx
// ❌ Bad
<div>{user.name}</div>

// ✅ Good
<div>{user?.name ?? 'Guest'}</div>
```

### Hook 규칙 위반
```
Error: Hooks can only be called inside of the body of a function component
```

**해결:**
```tsx
// ❌ Bad
if (condition) {
  const [state, setState] = useState(0)
}

// ✅ Good
const [state, setState] = useState(0)
if (condition) {
  // use state
}
```

## 성능 디버깅

### React Profiler
```tsx
import { Profiler } from 'react'

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

### 번들 분석
```bash
npm run build
npx @next/bundle-analyzer
```

### Lighthouse
```
Chrome DevTools > Lighthouse 탭
```

## 로깅 전략

### Console 로그
```typescript
console.log('User:', user)
console.error('Error occurred:', error)
console.warn('Deprecated API')
console.table(users)
```

### 조건부 로깅
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

### 구조화된 로깅
```typescript
const log = {
  info: (msg: string, data?: any) =>
    console.log(`[INFO] ${msg}`, data),
  error: (msg: string, error: Error) =>
    console.error(`[ERROR] ${msg}`, error)
}
```

## 체크리스트

디버깅 전:
- [ ] 에러 메시지 전체 읽기
- [ ] 스택 트레이스 확인
- [ ] 최근 변경사항 검토
- [ ] 브라우저 캐시 삭제

디버깅 중:
- [ ] 중단점 설정
- [ ] 변수 값 확인
- [ ] 네트워크 요청 확인
- [ ] 콘솔 경고 확인

디버깅 후:
- [ ] 수정 사항 테스트
- [ ] 회귀 테스트 작성
- [ ] 문서화
- [ ] 코드 리뷰
