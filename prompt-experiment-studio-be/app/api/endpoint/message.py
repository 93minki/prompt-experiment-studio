from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from repositories import chat_session_repository as chat_session_repo
from repositories import message_repository as message_repo
from repositories import system_prompt_repository as system_prompt_repo
from schemas.message import (
    ChatTurnCreate,
    MessageRead,
    MessageSummaryRead,
    ChatTurnRead,
)
from services.chat_turn_service import run_chat_turn_with_llm

router = APIRouter(prefix="/chat-sessions", tags=["messages"])


@router.post("/{chat_session_id}/messages/turn", response_model=ChatTurnRead)
def create_chat_turn(
    chat_session_id: int,
    payload: ChatTurnCreate,
    db: Session = Depends(get_db),
):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    try:
        user_row, assistant_row, summary_row = run_chat_turn_with_llm(
            db=db,
            chat_session_id=chat_session_id,
            user_message=payload.user_message,
            model=payload.model,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {"user": user_row, "assistant": assistant_row, "summary": summary_row}


@router.get("/{chat_session_id}/messages", response_model=list[MessageRead])
def get_messages(chat_session_id: int, db: Session = Depends(get_db)):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    return message_repo.list_messages(db, chat_session_id)


@router.get("/{chat_session_id}/messages/summary", response_model=MessageSummaryRead)
def get_message_summary(chat_session_id: int, db: Session = Depends(get_db)):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    summary_row = message_repo.get_message_summary(db, chat_session_id)
    if not summary_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message summary not found",
        )

    return summary_row
