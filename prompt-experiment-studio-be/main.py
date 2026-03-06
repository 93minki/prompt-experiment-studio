from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.endpoint.chat_session import router as chat_session_router
from app.api.endpoint.system_prompt import router as system_prompt_router
from core.database import Base, engine

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_session_router)
app.include_router(system_prompt_router)


@app.get("/")
def greeting():
    return {"message": "Hello, World!"}
