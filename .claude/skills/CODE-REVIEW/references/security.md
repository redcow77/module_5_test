# 보안 체크리스트

## 공통 보안 원칙

### 1. 입력 검증
- [ ] 모든 사용자 입력을 검증하는가?
- [ ] 화이트리스트 방식으로 검증하는가?
- [ ] 길이, 타입, 형식을 확인하는가?

### 2. 민감 정보 관리
- [ ] 하드코딩된 비밀번호, API 키가 없는가?
- [ ] 환경 변수로 관리하는가?
- [ ] .env 파일이 .gitignore에 포함되어 있는가?
- [ ] 민감 정보가 로그에 출력되지 않는가?

### 3. 인증/인가
- [ ] 인증이 필요한 엔드포인트에 보호 장치가 있는가?
- [ ] 세션/토큰이 안전하게 관리되는가?
- [ ] 권한 검증이 적절한가?

---

## 백엔드 보안

### 1. SQL 인젝션 방지

#### ❌ 위험한 패턴
```python
# 절대 하지 말 것!
query = f"SELECT * FROM users WHERE id = {user_id}"
db.execute(query)
```

#### ✅ 안전한 패턴
```python
# ORM 사용
user = db.query(User).filter(User.id == user_id).first()

# 또는 파라미터 바인딩
query = "SELECT * FROM users WHERE id = :user_id"
db.execute(query, {"user_id": user_id})
```

### 2. 비밀번호 보안

#### 체크리스트
- [ ] 비밀번호를 해싱하는가?
- [ ] Salt를 사용하는가?
- [ ] bcrypt, argon2 같은 안전한 알고리즘을 사용하는가?
- [ ] 비밀번호 강도 검증을 하는가?

#### 예시
```python
# ✅ Good
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 해싱
hashed = pwd_context.hash("my_password")

# 검증
is_valid = pwd_context.verify("my_password", hashed)
```

### 3. JWT 토큰 보안

#### 체크리스트
- [ ] 강력한 비밀키를 사용하는가?
- [ ] 만료 시간을 설정했는가?
- [ ] 토큰을 안전하게 전송하는가? (HTTPS)
- [ ] 리프레시 토큰을 구현했는가?

#### 예시
```python
# ✅ Good
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY")  # 환경 변수에서
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### 4. CORS 설정

#### 체크리스트
- [ ] CORS를 적절히 설정했는가?
- [ ] 허용된 origin만 접근 가능한가?
- [ ] 운영 환경에서 와일드카드(*)를 사용하지 않는가?

#### 예시
```python
# ❌ Bad - 운영 환경
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용!
    allow_credentials=True,
)

# ✅ Good - 운영 환경
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 허용된 origin만
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 5. 파일 업로드 보안

#### 체크리스트
- [ ] 파일 타입을 검증하는가?
- [ ] 파일 크기를 제한하는가?
- [ ] 파일명을 안전하게 처리하는가?
- [ ] 업로드 경로를 제한하는가?

#### 예시
```python
# ✅ Good
from fastapi import UploadFile, HTTPException
import os
from pathlib import Path

ALLOWED_EXTENSIONS = {".jpg", ".png", ".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

async def upload_file(file: UploadFile):
    # 확장자 검증
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Invalid file type")

    # 크기 검증
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")

    # 안전한 파일명 생성
    safe_filename = f"{uuid.uuid4()}{ext}"

    # 저장
    with open(f"uploads/{safe_filename}", "wb") as f:
        f.write(content)
```

### 6. Rate Limiting

#### 체크리스트
- [ ] API에 속도 제한을 설정했는가?
- [ ] 무차별 대입 공격을 방지하는가?

#### 예시
```python
# ✅ Good
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/login")
@limiter.limit("5/minute")  # 분당 5회 제한
async def login(credentials: LoginCredentials):
    # 로그인 로직
    pass
```

---

## 프론트엔드 보안

### 1. XSS (Cross-Site Scripting) 방지

#### 체크리스트
- [ ] 사용자 입력을 안전하게 렌더링하는가?
- [ ] dangerouslySetInnerHTML 사용을 피하는가?
- [ ] HTML을 직접 삽입하지 않는가?

#### 예시
```tsx
// ❌ Bad - XSS 취약
function Comment({ text }: { text: string }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />
}

// ✅ Good - 안전한 렌더링
function Comment({ text }: { text: string }) {
  return <div>{text}</div>  // React가 자동으로 이스케이프
}

// ✅ Good - 필요시 sanitize
import DOMPurify from 'dompurify'

function Comment({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### 2. 토큰 저장

#### 체크리스트
- [ ] 액세스 토큰을 localStorage에 저장하지 않는가?
- [ ] HttpOnly 쿠키를 사용하는가?
- [ ] 민감한 정보를 클라이언트에 저장하지 않는가?

#### 예시
```tsx
// ❌ Bad - localStorage에 토큰
localStorage.setItem('access_token', token)

// ✅ Good - HttpOnly 쿠키 (백엔드에서 설정)
// 백엔드:
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,  # JavaScript에서 접근 불가
    secure=True,    # HTTPS만
    samesite="lax"  # CSRF 방지
)
```

### 3. CSRF 방지

#### 체크리스트
- [ ] CSRF 토큰을 사용하는가?
- [ ] SameSite 쿠키 속성을 설정했는가?

### 4. 민감한 정보 노출 방지

#### 체크리스트
- [ ] API 키가 클라이언트 코드에 없는가?
- [ ] 환경 변수를 안전하게 사용하는가?
- [ ] 에러 메시지에 민감한 정보가 없는가?

#### 예시
```tsx
// ❌ Bad - API 키 노출
const API_KEY = "sk_live_xxxxxxxxxxxxx"

fetch(`https://api.service.com?key=${API_KEY}`)

// ✅ Good - 서버에서 호출
// 프론트: 백엔드 API 호출
fetch('/api/external-service')

// 백엔드: 실제 API 호출
API_KEY = os.getenv("EXTERNAL_API_KEY")
response = requests.get(f"https://api.service.com?key={API_KEY}")
```

### 5. 클라이언트 측 검증

#### 체크리스트
- [ ] 클라이언트 검증만으로 의존하지 않는가?
- [ ] 서버에서도 동일하게 검증하는가?

#### 예시
```tsx
// ✅ Good - 클라이언트와 서버 모두 검증

// 프론트엔드
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function submitForm(data: FormData) {
  // 클라이언트 검증 (UX)
  if (!validateEmail(data.email)) {
    alert("Invalid email")
    return
  }

  // 서버로 전송 (서버에서도 검증)
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 백엔드
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr  # Pydantic이 검증
    name: str
```

---

## 환경 변수 관리

### 체크리스트
- [ ] .env 파일이 .gitignore에 포함되어 있는가?
- [ ] .env.example 파일을 제공하는가?
- [ ] 운영/개발 환경 변수를 분리했는가?

### 예시
```bash
# .env (절대 커밋하지 않음)
DATABASE_URL=postgresql://user:password@localhost/db
SECRET_KEY=very-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000

# .env.example (커밋 가능)
DATABASE_URL=postgresql://user:password@localhost/db
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 보안 점검 우선순위

### 🔴 Critical (즉시 수정)
1. 하드코딩된 비밀번호/API 키
2. SQL 인젝션 취약점
3. XSS 취약점
4. 인증 없는 민감 API
5. 비밀번호 평문 저장

### 🟡 Warning (수정 권장)
1. 약한 CORS 설정
2. 토큰 만료 시간 미설정
3. Rate limiting 없음
4. 파일 업로드 검증 부족
5. 에러 메시지에 민감 정보 포함

### 🔵 Info (개선 제안)
1. HTTPS 사용 권장
2. 보안 헤더 추가
3. 로깅 개선
4. 의존성 취약점 점검
