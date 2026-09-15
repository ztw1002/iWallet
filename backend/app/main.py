from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="iWallet AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return {"name": "iWallet AI Backend", "ok": True}
