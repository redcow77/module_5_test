# 통합 테스트 패턴

## API 호출 테스트 (MSW 사용)

### GET 요청 테스트

```tsx
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import UserList from '@/components/UserList'

describe('UserList', () => {
  it('fetches and displays users', async () => {
    render(<UserList />)

    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // 데이터 로드 대기
    const user1 = await screen.findByText('John Doe')
    const user2 = await screen.findByText('Jane Doe')

    expect(user1).toBeInTheDocument()
    expect(user2).toBeInTheDocument()
  })

  it('handles fetch error', async () => {
    // 에러 응답 설정
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        )
      })
    )

    render(<UserList />)

    // 에러 메시지 확인
    const errorMessage = await screen.findByText(/failed to load users/i)
    expect(errorMessage).toBeInTheDocument()
  })
})
```

### POST 요청 테스트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import CreateUserForm from '@/components/CreateUserForm'

describe('CreateUserForm', () => {
  it('creates a new user successfully', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()

    render(<CreateUserForm onSuccess={onSuccess} />)

    // 폼 입력
    await user.type(screen.getByLabelText('Name'), 'New User')
    await user.type(screen.getByLabelText('Email'), 'new@example.com')

    // 제출
    await user.click(screen.getByRole('button', { name: 'Create' }))

    // 성공 메시지 대기
    await screen.findByText('User created successfully')

    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows validation error', async () => {
    const user = userEvent.setup()

    // 검증 에러 응답 설정
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(
          { detail: 'Email already exists' },
          { status: 400 }
        )
      })
    )

    render(<CreateUserForm />)

    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    // 에러 메시지 확인
    const errorMessage = await screen.findByText('Email already exists')
    expect(errorMessage).toBeInTheDocument()
  })
})
```

## 페이지 테스트

### Next.js 페이지 컴포넌트

```tsx
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })
})
```

### 동적 라우트 테스트

```tsx
import { render, screen } from '@testing-library/react'
import UserDetailPage from '@/app/users/[id]/page'

// Next.js params 모킹
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

describe('UserDetailPage', () => {
  it('fetches and displays user details', async () => {
    render(<UserDetailPage />)

    const userName = await screen.findByText('John Doe')
    expect(userName).toBeInTheDocument()
  })
})
```

## 폼 제출 플로우 테스트

### 전체 폼 플로우

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegistrationForm from '@/components/RegistrationForm'

describe('RegistrationForm', () => {
  it('completes full registration flow', async () => {
    const user = userEvent.setup()
    const onComplete = jest.fn()

    render(<RegistrationForm onComplete={onComplete} />)

    // Step 1: 기본 정보
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Step 2: 비밀번호
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Step 3: 약관 동의
    await user.click(screen.getByLabelText('I agree to terms'))
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // 완료 확인
    await screen.findByText('Registration successful')
    expect(onComplete).toHaveBeenCalled()
  })
})
```

### 유효성 검사 테스트

```tsx
describe('RegistrationForm validation', () => {
  it('shows error for invalid email', async () => {
    const user = userEvent.setup()

    render(<RegistrationForm />)

    await user.type(screen.getByLabelText('Email'), 'invalid-email')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Invalid email format')).toBeInTheDocument()
  })

  it('shows error for password mismatch', async () => {
    const user = userEvent.setup()

    render(<RegistrationForm />)

    // Step 1 완료
    await user.type(screen.getByLabelText('Name'), 'John')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // Step 2 비밀번호 불일치
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })
})
```

## 다중 컴포넌트 상호작용

### 부모-자식 컴포넌트 통신

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from '@/components/TodoApp'

describe('TodoApp', () => {
  it('adds and displays todo item', async () => {
    const user = userEvent.setup()

    render(<TodoApp />)

    // Todo 추가
    const input = screen.getByPlaceholderText('Enter todo')
    await user.type(input, 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    // Todo 표시 확인
    expect(screen.getByText('Buy milk')).toBeInTheDocument()

    // 입력 필드 초기화 확인
    expect(input).toHaveValue('')
  })

  it('deletes todo item', async () => {
    const user = userEvent.setup()

    render(<TodoApp />)

    // Todo 추가
    await user.type(screen.getByPlaceholderText('Enter todo'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    // 삭제
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    // Todo 제거 확인
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })

  it('toggles todo completion', async () => {
    const user = userEvent.setup()

    render(<TodoApp />)

    await user.type(screen.getByPlaceholderText('Enter todo'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    // 체크박스 클릭
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(checkbox).toBeChecked()

    // 텍스트 스타일 변경 확인
    const todoText = screen.getByText('Buy milk')
    expect(todoText).toHaveClass('line-through')
  })
})
```

## 검색/필터링 테스트

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductList from '@/components/ProductList'

describe('ProductList', () => {
  const products = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 1000 },
    { id: 2, name: 'Mouse', category: 'Electronics', price: 25 },
    { id: 3, name: 'Desk', category: 'Furniture', price: 300 },
  ]

  it('filters products by search term', async () => {
    const user = userEvent.setup()

    render(<ProductList products={products} />)

    // 검색
    await user.type(screen.getByPlaceholderText('Search'), 'Laptop')

    // 필터링 결과 확인
    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument()
    expect(screen.queryByText('Desk')).not.toBeInTheDocument()
  })

  it('filters products by category', async () => {
    const user = userEvent.setup()

    render(<ProductList products={products} />)

    // 카테고리 선택
    await user.selectOptions(
      screen.getByLabelText('Category'),
      'Electronics'
    )

    // 필터링 결과 확인
    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('Mouse')).toBeInTheDocument()
    expect(screen.queryByText('Desk')).not.toBeInTheDocument()
  })
})
```

## 페이지네이션 테스트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaginatedList from '@/components/PaginatedList'

describe('PaginatedList', () => {
  it('navigates between pages', async () => {
    const user = userEvent.setup()

    render(<PaginatedList itemsPerPage={10} />)

    // 첫 페이지 아이템 확인
    await screen.findByText('Item 1')
    expect(screen.getByText('Item 10')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()

    // 다음 페이지로
    await user.click(screen.getByRole('button', { name: 'Next' }))

    // 두 번째 페이지 아이템 확인
    await screen.findByText('Item 11')
    expect(screen.getByText('Item 20')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })
})
```

## 실시간 업데이트 테스트

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import LiveFeed from '@/components/LiveFeed'

describe('LiveFeed', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('updates data periodically', async () => {
    render(<LiveFeed interval={5000} />)

    // 초기 데이터
    await screen.findByText('Update #1')

    // 5초 경과
    jest.advanceTimersByTime(5000)

    // 업데이트된 데이터
    await waitFor(() => {
      expect(screen.getByText('Update #2')).toBeInTheDocument()
    })
  })
})
```

## Context/Provider 테스트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemedComponent from '@/components/ThemedComponent'

describe('ThemedComponent', () => {
  it('renders with theme from context', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemedComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark')
  })

  it('toggles theme', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemedComponent />
      </ThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }))

    expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark')
  })
})
```
