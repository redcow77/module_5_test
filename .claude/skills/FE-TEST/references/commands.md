# 테스트 실행 명령어

## 기본 명령어

### 전체 테스트 실행
```bash
npm test
```

### Watch 모드 (개발 중 사용)
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

### CI 환경에서 실행
```bash
npm run test:ci
```

## 특정 파일/폴더 테스트

### 특정 파일만 테스트
```bash
npm test Button.test.tsx
```

### 특정 폴더만 테스트
```bash
npm test __tests__/components
```

### 패턴 매칭
```bash
npm test -- --testPathPattern=User
```

## 테스트 필터링

### 특정 describe/it만 실행
```bash
# test.only 사용
it.only('this test runs', () => {
  // ...
})

# 또는 CLI에서
npm test -- --testNamePattern="renders correctly"
```

### 특정 테스트 건너뛰기
```bash
# test.skip 사용
it.skip('skip this test', () => {
  // ...
})
```

## 커버리지 옵션

### HTML 리포트 생성
```bash
npm run test:coverage
# coverage/lcov-report/index.html 열기
```

### 특정 임계값 설정
```bash
npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'
```

### 커버리지에서 제외
```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.stories.{js,jsx,ts,tsx}',  // Storybook 파일 제외
  '!src/**/*.d.ts',                      // 타입 정의 제외
]
```

## 디버깅

### Chrome DevTools로 디버깅
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

그 후 Chrome에서 `chrome://inspect` 열기

### VS Code 디버깅 설정
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 콘솔 로그 보기
```bash
npm test -- --verbose
```

## 성능 최적화

### 병렬 실행 워커 수 조정
```bash
npm test -- --maxWorkers=4
```

### 캐시 비활성화
```bash
npm test -- --no-cache
```

### 캐시 삭제
```bash
npm test -- --clearCache
```

## 스냅샷 테스트

### 스냅샷 업데이트
```bash
npm test -- -u
# 또는
npm test -- --updateSnapshot
```

### 특정 파일의 스냅샷만 업데이트
```bash
npm test Button.test.tsx -- -u
```

## Watch 모드 옵션

Watch 모드에서 사용 가능한 키:
- `a`: 모든 테스트 실행
- `f`: 실패한 테스트만 실행
- `p`: 파일명 패턴으로 필터
- `t`: 테스트 이름 패턴으로 필터
- `q`: 종료
- `Enter`: 테스트 다시 실행

## 유용한 플래그

### 실패한 테스트만 재실행
```bash
npm test -- --onlyFailures
```

### 변경된 파일만 테스트
```bash
npm test -- --onlyChanged
# 또는
npm test -- -o
```

### 관련된 테스트만 실행
```bash
npm test -- --findRelatedTests src/components/Button.tsx
```

### 한 번에 하나의 테스트만 실행
```bash
npm test -- --runInBand
```

### Bail (첫 실패 시 중단)
```bash
npm test -- --bail
```

## 출력 형식

### 간결한 출력
```bash
npm test -- --silent
```

### 자세한 출력
```bash
npm test -- --verbose
```

### JSON 형식으로 출력
```bash
npm test -- --json --outputFile=test-results.json
```

## CI/CD 환경 설정

### GitHub Actions 예시
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## package.json 스크립트 예시

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:update": "jest -u",
    "test:changed": "jest --onlyChanged",
    "test:failed": "jest --onlyFailures"
  }
}
```

## 환경 변수

### 테스트 환경 변수 설정
```bash
# .env.test
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=test
```

### CLI에서 환경 변수 전달
```bash
NEXT_PUBLIC_API_URL=http://test-api npm test
```

## 타임아웃 설정

### 전역 타임아웃
```javascript
// jest.config.js
module.exports = {
  testTimeout: 10000, // 10초
}
```

### 개별 테스트 타임아웃
```typescript
it('long running test', async () => {
  // ...
}, 30000) // 30초
```

## 리포터

### 여러 리포터 사용
```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results' }]
  ]
}
```

## 트러블슈팅

### "out of memory" 에러
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

### 느린 테스트 찾기
```bash
npm test -- --listTests
```

### 테스트 순서 무작위화
```bash
npm test -- --randomize
```
