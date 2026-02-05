# TypeScript 타입 에러

## 일반적인 타입 에러

### Type 'X' is not assignable to type 'Y'

**해결**:
```typescript
// ❌ Bad
const age: number = '25'

// ✅ Good
const age: number = 25
// 또는
const age = parseInt('25')
```

### Object is possibly 'undefined'

**해결**:
```typescript
// ❌ Bad
const name = user.name

// ✅ Good - Optional chaining
const name = user?.name

// ✅ Good - Non-null assertion (확실할 때만)
const name = user!.name

// ✅ Good - Type guard
if (user) {
  const name = user.name
}
```

### Property 'x' does not exist on type 'Y'

**해결**:
```typescript
// ❌ Bad
interface User {
  name: string
}
const user: User = { name: 'John', age: 30 } // age 없음!

// ✅ Good - 속성 추가
interface User {
  name: string
  age: number
}

// ✅ Good - Optional
interface User {
  name: string
  age?: number
}
```

## Generic 타입 에러

### Type 'unknown' is not assignable

**해결**:
```typescript
// ❌ Bad
const data = await response.json()
console.log(data.name) // 타입 unknown

// ✅ Good - 타입 명시
interface User {
  name: string
}
const data: User = await response.json()
console.log(data.name)

// ✅ Good - Type assertion
const data = await response.json() as User
```

## React + TypeScript

### No overload matches this call

**컴포넌트 Props 타입**:
```typescript
// ❌ Bad
function Button(props) {
  return <button>{props.children}</button>
}

// ✅ Good
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

### Event Handler 타입

```typescript
// ✅ Good - 이벤트 타입
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget)
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value)
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
}
```

## 외부 라이브러리 타입

### Could not find a declaration file for module 'x'

**해결**:
```bash
# 타입 정의 설치
npm install -D @types/library-name

# 타입 정의가 없으면
# src/types/library-name.d.ts 생성
declare module 'library-name' {
  export function someFunction(): void
}
```

## Utility Types 활용

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

// Partial - 모든 속성 optional
type PartialUser = Partial<User>

// Pick - 특정 속성만 선택
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - 특정 속성 제외
type UserWithoutPassword = Omit<User, 'password'>

// Required - 모든 속성 required
type RequiredUser = Required<PartialUser>
```

## 타입 단언 주의

```typescript
// ⚠️ 확실할 때만 사용
const element = document.getElementById('root') as HTMLDivElement

// ✅ Better - Type guard
const element = document.getElementById('root')
if (element instanceof HTMLDivElement) {
  // element는 HTMLDivElement 타입
}
```
