from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db
from repositories import chat_session_repository as chat_session_repo
from repositories import message_repository as message_repo
from schemas.message import (
    ChatTurnCreate,
    ChatTurnRead,
    MessageContextUpdate,
    MessageRead,
    MessageSummaryRead,
    MessageSummaryRegenerate,
)
from services.chat_turn_service import regenerate_chat_summary, run_chat_turn_with_llm

router = APIRouter(prefix="/chat-sessions", tags=["messages"])


def _ensure_chat_session_exists(db: Session, chat_session_id: int) -> None:
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )


@router.post("/{chat_session_id}/messages/turn", response_model=ChatTurnRead)
def create_chat_turn(
    chat_session_id: int,
    payload: ChatTurnCreate,
    db: Session = Depends(get_db),
):
    _ensure_chat_session_exists(db, chat_session_id)

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
def get_messages(
    chat_session_id: int,
    include_in_context: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
):
    _ensure_chat_session_exists(db, chat_session_id)

    return message_repo.list_messages(
        db,
        chat_session_id,
        include_in_context=include_in_context,
    )


@router.patch(
    "/{chat_session_id}/messages/{message_id}/context",
    response_model=MessageRead,
)
def update_message_context(
    chat_session_id: int,
    message_id: int,
    payload: MessageContextUpdate,
    db: Session = Depends(get_db),
):
    _ensure_chat_session_exists(db, chat_session_id)

    message_row, is_changed = message_repo.update_message_context_inclusion(
        db=db,
        chat_session_id=chat_session_id,
        message_id=message_id,
        include_in_context=payload.include_in_context,
    )
    if not message_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    if is_changed:
        updated_session = chat_session_repo.increment_context_revision(
            db, chat_session_id
        )
        if not updated_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found",
            )
        message_repo.mark_message_summary_stale(db, chat_session_id)

    return message_row


@router.post(
    "/{chat_session_id}/messages/summary/regenerate",
    response_model=MessageSummaryRead,
)
def regenerate_summary(
    chat_session_id: int,
    payload: MessageSummaryRegenerate,
    db: Session = Depends(get_db),
):
    _ensure_chat_session_exists(db, chat_session_id)

    try:
        summary_row = regenerate_chat_summary(
            db=db,
            chat_session_id=chat_session_id,
            model=payload.model,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return summary_row


@router.get("/{chat_session_id}/messages/summary", response_model=MessageSummaryRead)
def get_message_summary(chat_session_id: int, db: Session = Depends(get_db)):
    _ensure_chat_session_exists(db, chat_session_id)

    summary_row = message_repo.get_message_summary(db, chat_session_id)
    if not summary_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message summary not found",
        )

    return summary_row
