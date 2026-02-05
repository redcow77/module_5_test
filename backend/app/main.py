from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import examples, pages, blocks, mcp, memos
from app.models import Page, Block  # Import for table creation
from app.models.memo import Memo  # Import Memo model for table creation

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Module 5 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(examples.router)
app.include_router(pages.router)
app.include_router(blocks.router)
app.include_router(mcp.router)
app.include_router(memos.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI 서버가 정상 작동 중입니다."}
