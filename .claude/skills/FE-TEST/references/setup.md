# 테스트 환경 설정

## 필요한 패키지 설치

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Jest 설정

### jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로
  dir: './',
})

const customJestConfig = {
  // 테스트 환경
  testEnvironment: 'jest-environment-jsdom',

  // 셋업 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 모듈 경로 매핑
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 테스트 파일 위치
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}',
  ],

  // 커버리지 임계값
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```javascript
// jest-dom matchers 추가
import '@testing-library/jest-dom'

// 전역 모킹
global.fetch = jest.fn()

// window.matchMedia 모킹 (Tailwind CSS 등에서 필요)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// IntersectionObserver 모킹
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}
```

## TypeScript 설정

### tsconfig.json 업데이트

```json
{
  "compilerOptions": {
    // ... 기존 설정
    "types": ["jest", "@testing-library/jest-dom"]
  }
}
```

## package.json 스크립트

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## MSW (Mock Service Worker) 설정

### 설치

```bash
npm install -D msw
```

### 핸들러 설정

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET 요청 모킹
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    ])
  }),

  // POST 요청 모킹
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json()
    return HttpResponse.json(
      { id: 3, ...newUser },
      { status: 201 }
    )
  }),

  // 에러 응답 모킹
  http.get('/api/error', () => {
    return HttpResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }),
]
```

### 서버 설정

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### Jest 설정에 추가

```javascript
// jest.setup.js
import { server } from './src/mocks/server'

// 테스트 시작 전 서버 시작
beforeAll(() => server.listen())

// 각 테스트 후 핸들러 리셋
afterEach(() => server.resetHandlers())

// 테스트 종료 후 서버 종료
afterAll(() => server.close())
```

## 유용한 Custom Matchers

```typescript
// jest.setup.js에 추가
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})
```

## Next.js 이미지 모킹

```javascript
// jest.setup.js
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))
```

## 환경 변수 모킹

```javascript
// jest.setup.js
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
```

## 디렉토리 구조

```
frontend/
├── __tests__/
│   ├── components/
│   │   └── Button.test.tsx
│   ├── pages/
│   │   └── index.test.tsx
│   └── lib/
│       └── utils.test.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── mocks/
│       ├── handlers.ts
│       └── server.ts
├── jest.config.js
├── jest.setup.js
└── package.json
```

## 트러블슈팅

### "Cannot find module '@testing-library/react'"
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

### "ReferenceError: fetch is not defined"
```javascript
// jest.setup.js
global.fetch = jest.fn()
```

### Next.js App Router 경고
- 서버 컴포넌트는 직접 테스트하기 어려움
- 클라이언트 컴포넌트로 추출하여 테스트
- 또는 E2E 테스트 사용
