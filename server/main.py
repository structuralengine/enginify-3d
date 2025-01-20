from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.api.api_router import router as api_router

app = FastAPI()

app.include_router(api_router)

origins = [
    "*", # デバッグ用
    "http://localhost:3000/",  # ローカル
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

