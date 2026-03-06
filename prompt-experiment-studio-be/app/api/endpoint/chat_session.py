from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from repositories import chat_session_repository as chat_session_repo
from schemas.chat_session import (
    ChatSessionCreate,
    ChatSessionRead,
    ChatSessionUpdateTitle,
)

router = APIRouter(prefix="/chat-sessions", tags=["chat-sessions"])


@router.get("/", response_model=list[ChatSessionRead])
def get_all_chat_sessions(db: Session = Depends(get_db)):
    return chat_session_repo.list_chat_sessions(db)


@router.get("/{chat_session_id}", response_model=ChatSessionRead)
def get_chat_session(chat_session_id: int, db: Session = Depends(get_db)):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return chat_session


@router.post("/", response_model=ChatSessionRead, status_code=status.HTTP_201_CREATED)
def create_chat_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
    return chat_session_repo.create_chat_session(db, payload.title)


@router.patch("/{chat_session_id}/title", response_model=ChatSessionRead)
def update_chat_session_title(
    chat_session_id: int,
    payload: ChatSessionUpdateTitle,
    db: Session = Depends(get_db),
):
    chat_session = chat_session_repo.update_chat_session_title(
        db,
        chat_session_id,
        payload.title,
    )
    if not chat_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return chat_session


@router.delete("/{chat_session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(chat_session_id: int, db: Session = Depends(get_db)):
    is_deleted = chat_session_repo.delete_chat_session(db, chat_session_id)
    if not is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
