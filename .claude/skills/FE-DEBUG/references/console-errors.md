# 브라우저 콘솔 에러

## 일반적인 콘솔 에러

### 1. TypeError: Cannot read property 'x' of undefined

**원인**: 객체가 undefined/null인데 속성에 접근

**해결**:
```typescript
// ❌ Bad
const name = user.name

// ✅ Good
const name = user?.name ?? 'Guest'
```

### 2. ReferenceError: x is not defined

**원인**: 선언되지 않은 변수 사용

**해결**:
```typescript
// 변수 선언 확인
// import 문 확인
// 스코프 확인
```

### 3. SyntaxError: Unexpected token

**원인**: 문법 오류

**해결**:
```typescript
// 괄호, 중괄호, 따옴표 확인
// 세미콜론 확인
// JSX 문법 확인
```

## Network 에러

### CORS Error

```
Access to fetch at 'http://localhost:8000/api' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결 (백엔드)**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**임시 해결 (개발용)**:
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
}
```

### 404 Not Found

**확인 사항**:
- URL 스펠링
- API 엔드포인트 존재 여부
- 라우트 설정
- 백엔드 서버 실행 여부

### 500 Internal Server Error

**확인 사항**:
- 백엔드 로그 확인
- 요청 데이터 형식
- 백엔드 에러 메시지

## Memory Leak

**증상**: 페이지가 느려짐, 브라우저 멈춤

**원인**:
- EventListener 제거 안함
- setInterval 정리 안함
- 구독 해제 안함

**해결**:
```typescript
useEffect(() => {
  const handler = () => console.log('resize')
  window.addEventListener('resize', handler)

  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

## 디버깅 팁

```typescript
// 객체 구조 확인
console.table(users)

// 함수 실행 시간 측정
console.time('fetch')
await fetchData()
console.timeEnd('fetch')

// 스택 트레이스
console.trace()
```
