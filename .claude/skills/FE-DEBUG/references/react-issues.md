# React 렌더링 이슈

## Hydration Errors

### Error: Hydration failed

**원인**: 서버/클라이언트 렌더링 불일치

**해결**:
```tsx
// ❌ Bad - 서버/클라이언트에서 다른 값
<div>{new Date().toString()}</div>

// ✅ Good - useEffect에서 클라이언트 전용 값 설정
'use client'
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null

return <div>{new Date().toString()}</div>
```

## Hook 규칙 위반

### Error: Hooks can only be called inside function component

**원인**: Hook을 조건문/루프/중첩 함수에서 호출

**해결**:
```tsx
// ❌ Bad
if (condition) {
  const [state, setState] = useState(0)
}

// ✅ Good
const [state, setState] = useState(0)
```

## 무한 루프

### useEffect 무한 루프

```tsx
// ❌ Bad
useEffect(() => {
  setCount(count + 1) // count 변경 → 리렌더 → useEffect 재실행
}, [count])

// ✅ Good
useEffect(() => {
  setCount(c => c + 1) // 함수형 업데이트
}, []) // 의존성 배열 비움
```

## Key Warning

```
Warning: Each child in a list should have a unique "key" prop
```

**해결**:
```tsx
// ❌ Bad
users.map((user, index) => <div key={index}>{user.name}</div>)

// ✅ Good
users.map(user => <div key={user.id}>{user.name}</div>)
```

## Too many re-renders

**원인**: setState를 렌더링 중에 호출

**해결**:
```tsx
// ❌ Bad
<button onClick={handleClick()}>Click</button>

// ✅ Good
<button onClick={handleClick}>Click</button>
```
