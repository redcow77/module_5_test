# 백엔드 코드 리뷰 가이드

## FastAPI 특화 체크리스트

### 1. API 설계

#### 엔드포인트 설계
- [ ] RESTful 원칙을 따르는가?
  - GET: 조회
  - POST: 생성
  - PUT/PATCH: 수정
  - DELETE: 삭제
- [ ] URL 경로가 명사형인가? (`/users` not `/getUsers`)
- [ ] 적절한 HTTP 상태 코드를 사용하는가?
  - 200: 성공
  - 201: 생성 완료
  - 400: 잘못된 요청
  - 404: 리소스 없음
  - 500: 서버 에러

#### 예시
```python
# ❌ Bad
@router.get("/getUserById/{id}")
async def get_user(id: int):
    return {"id": id}

# ✅ Good
@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### 2. Pydantic 스키마

#### 검증
- [ ] 모든 필드에 적절한 타입이 지정되어 있는가?
- [ ] Field 검증을 사용하는가? (min_length, max_length, regex)
- [ ] 선택적 필드는 Optional로 표시되어 있는가?
- [ ] Create/Update/Response 스키마가 분리되어 있는가?

#### 예시
```python
# ❌ Bad
class UserCreate(BaseModel):
    name: str
    email: str
    age: int

# ✅ Good
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=0, le=150)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int

    class Config:
        from_attributes = True
```

### 3. 데이터베이스

#### SQLAlchemy 쿼리
- [ ] N+1 쿼리 문제가 없는가?
- [ ] joinedload/selectinload를 적절히 사용하는가?
- [ ] 트랜잭션 관리가 적절한가?
- [ ] 인덱스가 필요한 컬럼에 설정되어 있는가?

#### 예시
```python
# ❌ Bad - N+1 문제
users = db.query(User).all()
for user in users:
    print(user.posts)  # 각 user마다 추가 쿼리 발생

# ✅ Good - joinedload 사용
from sqlalchemy.orm import joinedload

users = db.query(User).options(joinedload(User.posts)).all()
for user in users:
    print(user.posts)  # 단일 쿼리로 처리
```

#### 세션 관리
```python
# ❌ Bad - 세션 누수
def get_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    return user  # db.close() 호출 안 함

# ✅ Good - 의존성 주입
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()
```

### 4. 의존성 주입

- [ ] Depends를 활용하는가?
- [ ] 공통 로직을 의존성으로 추출했는가?
- [ ] 인증/인가를 의존성으로 구현했는가?

#### 예시
```python
# ✅ Good - 인증 의존성
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    user = verify_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### 5. 에러 처리

- [ ] HTTPException을 적절히 사용하는가?
- [ ] 의미 있는 에러 메시지를 제공하는가?
- [ ] 500 에러가 사용자에게 노출되지 않는가?

#### 예시
```python
# ❌ Bad
@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)  # user가 None이면 에러!
    db.commit()
    return {"message": "deleted"}

# ✅ Good
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    db.delete(user)
    db.commit()
    return None
```

### 6. 보안

- [ ] SQL 인젝션 방지를 위해 ORM을 사용하는가?
- [ ] 비밀번호를 해싱하는가?
- [ ] CORS 설정이 적절한가?
- [ ] 환경 변수로 민감 정보를 관리하는가?

#### 예시
```python
# ❌ Bad - 비밀번호 평문 저장
def create_user(user: UserCreate, db: Session):
    db_user = User(
        email=user.email,
        password=user.password  # 평문!
    )
    db.add(db_user)
    db.commit()

# ✅ Good - 비밀번호 해싱
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(user: UserCreate, db: Session):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
```

### 7. 성능

- [ ] 페이지네이션을 구현했는가?
- [ ] 불필요한 데이터를 반환하지 않는가?
- [ ] 백그라운드 태스크를 활용하는가?

#### 예시
```python
# ❌ Bad - 모든 데이터 반환
@router.get("/users")
async def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()  # 수만 개일 수도!

# ✅ Good - 페이지네이션
@router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

## 리뷰 시 확인할 파일들

```
backend/app/
├── main.py           # CORS, 미들웨어 설정 확인
├── database.py       # 연결 풀, 세션 설정 확인
├── models/           # 관계 설정, 인덱스 확인
├── schemas/          # 검증 로직 확인
└── routers/          # API 설계, 에러 처리 확인
```
