# Next.js 특화 에러

## Build Errors

### Error: `window is not defined`

**원인**: 서버 사이드에서 브라우저 API 사용

**해결**:
```tsx
// ❌ Bad
const width = window.innerWidth

// ✅ Good - typeof 체크
const width = typeof window !== 'undefined' ? window.innerWidth : 0

// ✅ Good - useEffect
useEffect(() => {
  const width = window.innerWidth
}, [])

// ✅ Good - dynamic import
const Chart = dynamic(() => import('./Chart'), { ssr: false })
```

### Error: `document is not defined`

**해결**:
```tsx
'use client' // 클라이언트 컴포넌트로 전환

// 또는 조건부 체크
if (typeof document !== 'undefined') {
  document.getElementById('root')
}
```

## Image Optimization Errors

```
Error: Invalid src prop on `next/image`
```

**해결**:
```tsx
// ❌ Bad
<Image src={userUploadedUrl} width={200} height={200} />

// ✅ Good - next.config.js에 도메인 추가
module.exports = {
  images: {
    domains: ['example.com'],
  },
}

// 또는 unoptimized 사용
<Image src={url} unoptimized width={200} height={200} />
```

## Routing Errors

### Error: No routes matched

**확인 사항**:
- 파일명 확인 (app/users/page.tsx)
- 동적 라우트 ([id]/page.tsx)
- layout.tsx 존재 여부

### Error: Multiple children for route

**원인**: 동일 경로에 여러 page.tsx

**해결**: 파일 구조 확인

## API Routes Errors

```
Error: API resolved without sending a response
```

**해결**:
```typescript
// ❌ Bad
export async function GET() {
  const data = await fetchData()
  // 응답 안 보냄!
}

// ✅ Good
export async function GET() {
  const data = await fetchData()
  return Response.json(data)
}
```

## Middleware Errors

```
Error: Middleware must return a response
```

**해결**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // ❌ Bad - 응답 없음
  if (!auth) {
    redirect('/login')
  }

  // ✅ Good
  if (!auth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}
```
