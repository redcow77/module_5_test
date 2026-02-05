# 프론트엔드 코드 리뷰 가이드

## Next.js + TypeScript 특화 체크리스트

### 1. 컴포넌트 설계

#### 서버 vs 클라이언트 컴포넌트
- [ ] 'use client'를 최소화했는가?
- [ ] 서버 컴포넌트에서 데이터 페칭을 하는가?
- [ ] 상태/이벤트가 필요한 곳만 클라이언트 컴포넌트로 만들었는가?

#### 예시
```tsx
// ❌ Bad - 불필요한 'use client'
'use client'

export default function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// ✅ Good - 서버 컴포넌트
export default function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// ✅ Good - 필요한 곳만 클라이언트
'use client'

export default function UserForm() {
  const [name, setName] = useState('')

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
    </form>
  )
}
```

#### 재사용성
- [ ] 공통 UI를 컴포넌트로 분리했는가?
- [ ] Props 인터페이스가 명확한가?
- [ ] 컴포넌트가 단일 책임을 가지는가?

### 2. TypeScript

#### 타입 안정성
- [ ] any 사용을 최소화했는가?
- [ ] 인터페이스/타입이 명확하게 정의되어 있는가?
- [ ] 백엔드 스키마와 일치하는가?
- [ ] 제네릭을 적절히 활용하는가?

#### 예시
```tsx
// ❌ Bad - any 사용
function UserCard({ user }: { user: any }) {
  return <div>{user.name}</div>
}

// ✅ Good - 명확한 타입
interface User {
  id: number
  name: string
  email: string
  age: number
}

function UserCard({ user }: { user: User }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}

// ✅ Better - 재사용 가능한 제네릭
interface CardProps<T> {
  data: T
  renderContent: (item: T) => React.ReactNode
}

function Card<T>({ data, renderContent }: CardProps<T>) {
  return <div className="card">{renderContent(data)}</div>
}
```

### 3. 데이터 페칭

#### 서버 컴포넌트에서 페칭
- [ ] async/await를 사용하는가?
- [ ] 에러 처리가 있는가?
- [ ] 로딩 상태를 처리하는가? (loading.tsx)

#### 예시
```tsx
// ✅ Good - 서버 컴포넌트에서 페칭
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('http://localhost:8000/users', {
    cache: 'no-store' // 또는 { next: { revalidate: 60 } }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch users')
  }

  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  )
}

// app/users/loading.tsx
export default function Loading() {
  return <div>Loading users...</div>
}

// app/users/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

#### 클라이언트에서 페칭
- [ ] SWR/React Query 같은 라이브러리를 사용하는가?
- [ ] 또는 커스텀 훅으로 추상화했는가?
- [ ] 로딩/에러 상태를 관리하는가?

#### 예시
```tsx
// ❌ Bad - 직접 fetch
'use client'

export default function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
  }, [])

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

// ✅ Good - 커스텀 훅
'use client'

function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { users, loading, error }
}

export default function UserList() {
  const { users, loading, error } = useUsers()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### 4. 스타일링 (Tailwind CSS)

- [ ] 일관된 디자인 시스템을 사용하는가?
- [ ] 반복되는 스타일을 컴포넌트로 추출했는가?
- [ ] 반응형 디자인을 고려했는가?
- [ ] 다크모드를 고려했는가?

#### 예시
```tsx
// ❌ Bad - 중복된 스타일
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Save
</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Submit
</button>

// ✅ Good - 컴포넌트 추출
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-medium transition"
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 5. 폼 처리

- [ ] 유효성 검사가 있는가?
- [ ] 사용자 피드백을 제공하는가?
- [ ] 제출 중 상태를 처리하는가?
- [ ] React Hook Form 같은 라이브러리를 고려했는가?

#### 예시
```tsx
// ✅ Good - 폼 처리
'use client'

interface FormData {
  name: string
  email: string
}

export default function UserForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create user')

      // Success handling
      alert('User created!')
    } catch (error) {
      alert('Error creating user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}
      </div>

      <div>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### 6. 접근성 (a11y)

- [ ] 시맨틱 HTML을 사용하는가?
- [ ] 키보드 내비게이션이 가능한가?
- [ ] ARIA 속성을 적절히 사용하는가?
- [ ] 이미지에 alt 텍스트가 있는가?

#### 예시
```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick} aria-label="Submit form">
  Click me
</button>

// ✅ Good - 시맨틱 HTML
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### 7. 성능

- [ ] 불필요한 리렌더링을 방지했는가? (memo, useMemo, useCallback)
- [ ] 이미지를 최적화했는가? (next/image)
- [ ] 코드 스플리팅을 고려했는가? (dynamic import)

#### 예시
```tsx
// ✅ Good - next/image 사용
import Image from 'next/image'

<Image
  src="/profile.jpg"
  alt="Profile"
  width={200}
  height={200}
  priority
/>

// ✅ Good - dynamic import
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

## 리뷰 시 확인할 파일들

```
frontend/src/
├── app/              # 페이지 구조, 라우팅 확인
│   ├── layout.tsx    # 전역 레이아웃
│   ├── page.tsx      # 홈 페이지
│   ├── loading.tsx   # 로딩 UI
│   └── error.tsx     # 에러 UI
├── components/       # 재사용성, Props 인터페이스 확인
└── lib/              # 유틸리티 함수, API 클라이언트 확인
```
