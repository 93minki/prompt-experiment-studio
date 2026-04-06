from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.endpoint.chat_session import router as chat_session_router
from app.api.endpoint.message import router as message_router
from app.api.endpoint.system_prompt import router as system_prompt_router
from app.api.endpoint.llm_api import router as llm_api_router
from models.message_attachment import MessageAttachmentModel
from core.database import Base, engine

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_session_router)
app.include_router(system_prompt_router)
app.include_router(message_router)
app.include_router(llm_api_router)


@app.get("/")
def greeting():
    return {"message": "Hello, World!"}
