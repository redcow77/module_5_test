# 컴포넌트 테스트 패턴

## 기본 렌더링 테스트

### 텍스트 렌더링 확인

```tsx
import { render, screen } from '@testing-library/react'
import Heading from '@/components/Heading'

describe('Heading', () => {
  it('renders heading text', () => {
    render(<Heading>Welcome</Heading>)

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
  })
})
```

### Props 기반 렌더링

```tsx
import { render, screen } from '@testing-library/react'
import UserCard from '@/components/UserCard'

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  }

  it('renders user information', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders fallback when user is null', () => {
    render(<UserCard user={null} />)

    expect(screen.getByText('No user data')).toBeInTheDocument()
  })
})
```

## 사용자 상호작용 테스트

### 클릭 이벤트

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick} disabled>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### 입력 필드

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchInput from '@/components/SearchInput'

describe('SearchInput', () => {
  it('updates value when user types', async () => {
    const user = userEvent.setup()

    render(<SearchInput />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'React Testing')

    expect(input).toHaveValue('React Testing')
  })

  it('calls onSearch with input value', async () => {
    const handleSearch = jest.fn()
    const user = userEvent.setup()

    render(<SearchInput onSearch={handleSearch} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'React')
    await user.keyboard('{Enter}')

    expect(handleSearch).toHaveBeenCalledWith('React')
  })
})
```

### 폼 제출

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/LoginForm'

describe('LoginForm', () => {
  it('submits form with correct data', async () => {
    const handleSubmit = jest.fn()
    const user = userEvent.setup()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

## 조건부 렌더링 테스트

### 상태에 따른 렌더링

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Accordion from '@/components/Accordion'

describe('Accordion', () => {
  it('shows content when expanded', async () => {
    const user = userEvent.setup()

    render(
      <Accordion title="Click me">
        <p>Hidden content</p>
      </Accordion>
    )

    // 처음에는 숨김
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()

    // 클릭 후 보임
    await user.click(screen.getByText('Click me'))
    expect(screen.getByText('Hidden content')).toBeInTheDocument()
  })
})
```

### 로딩/에러 상태

```tsx
import { render, screen } from '@testing-library/react'
import DataDisplay from '@/components/DataDisplay'

describe('DataDisplay', () => {
  it('shows loading state', () => {
    render(<DataDisplay loading={true} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<DataDisplay error="Failed to load data" />)

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('shows data when loaded', () => {
    const data = { message: 'Success' }
    render(<DataDisplay data={data} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

## 비동기 동작 테스트

### waitFor 사용

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AsyncButton from '@/components/AsyncButton'

describe('AsyncButton', () => {
  it('shows loading state during async operation', async () => {
    const user = userEvent.setup()

    render(<AsyncButton />)

    const button = screen.getByRole('button')
    await user.click(button)

    // 로딩 상태 확인
    expect(button).toHaveTextContent('Loading...')

    // 완료 대기
    await waitFor(() => {
      expect(button).toHaveTextContent('Done')
    })
  })
})
```

### findBy 쿼리 사용

```tsx
import { render, screen } from '@testing-library/react'
import AsyncComponent from '@/components/AsyncComponent'

describe('AsyncComponent', () => {
  it('displays data after loading', async () => {
    render(<AsyncComponent />)

    // 비동기로 나타나는 요소 찾기
    const heading = await screen.findByRole('heading', { name: 'Data Loaded' })

    expect(heading).toBeInTheDocument()
  })
})
```

## 쿼리 우선순위

### 권장 순서

1. **getByRole**: 가장 권장 (접근성 향상)
```tsx
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('textbox', { name: 'Email' })
screen.getByRole('heading', { level: 1 })
```

2. **getByLabelText**: 폼 요소에 적합
```tsx
screen.getByLabelText('Username')
```

3. **getByPlaceholderText**: placeholder가 있을 때
```tsx
screen.getByPlaceholderText('Enter email')
```

4. **getByText**: 일반 텍스트
```tsx
screen.getByText('Welcome back')
```

5. **getByTestId**: 최후의 수단 (data-testid)
```tsx
screen.getByTestId('custom-element')
```

## 스타일/클래스 테스트

```tsx
import { render, screen } from '@testing-library/react'
import Alert from '@/components/Alert'

describe('Alert', () => {
  it('applies error styles', () => {
    render(<Alert variant="error">Error message</Alert>)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-red-500')
  })

  it('applies success styles', () => {
    render(<Alert variant="success">Success message</Alert>)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-green-500')
  })
})
```

## Mock 컴포넌트

### 자식 컴포넌트 모킹

```tsx
// __mocks__/ComplexChild.tsx
export default function ComplexChild() {
  return <div>Mocked Complex Child</div>
}

// ParentComponent.test.tsx
jest.mock('@/components/ComplexChild')

import { render, screen } from '@testing-library/react'
import ParentComponent from '@/components/ParentComponent'

describe('ParentComponent', () => {
  it('renders with mocked child', () => {
    render(<ParentComponent />)

    expect(screen.getByText('Mocked Complex Child')).toBeInTheDocument()
  })
})
```

## 접근성 테스트

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Form from '@/components/Form'

expect.extend(toHaveNoViolations)

describe('Form accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Form />)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
```

## 유용한 Custom Render

```tsx
// test-utils.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

사용:
```tsx
import { render, screen } from '@/test-utils'
```
