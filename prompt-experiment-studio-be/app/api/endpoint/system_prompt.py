from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from core.database import get_db
from repositories import chat_session_repository as chat_session_repo
from repositories import system_prompt_repository as system_prompt_repo
from schemas.system_prompt import (
    SystemPromptRead,
    SystemPromptUpdate,
)

router = APIRouter(prefix="/chat-sessions", tags=["system-prompts"])


@router.get(
    "/{chat_session_id}/system-prompts/current", response_model=SystemPromptRead
)
def get_current_system_prompt(chat_session_id: int, db: Session = Depends(get_db)):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    prompt = system_prompt_repo.get_current_system_prompt(db, chat_session_id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="System prompt not found"
        )

    return prompt


@router.get("/{chat_session_id}/system-prompts", response_model=list[SystemPromptRead])
def get_system_prompt_history(chat_session_id: int, db: Session = Depends(get_db)):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    return system_prompt_repo.list_system_prompts(db, chat_session_id)


@router.put("/{chat_session_id}/system-prompts", response_model=SystemPromptRead)
def put_system_prompt(
    chat_session_id: int, payload: SystemPromptUpdate, db: Session = Depends(get_db)
):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    return system_prompt_repo.upsert_current_system_prompt(
        db, chat_session_id, payload.content
    )


@router.delete(
    "/{chat_session_id}/system-prompts/{version}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_system_prompt(
    chat_session_id: int, version: int, db: Session = Depends(get_db)
):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found"
        )

    current = system_prompt_repo.get_current_system_prompt(db, chat_session_id)
    if current and current.version == version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete current active system prompt",
        )

    is_deleted = system_prompt_repo.delete_system_prompt_by_version(
        db, chat_session_id, version
    )
    if not is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt version not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{chat_session_id}/system-prompts/{version}/activate",
    response_model=SystemPromptRead,
)
def activate_system_prompt(
    chat_session_id: int, version: int, db: Session = Depends(get_db)
):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="chat session not found",
        )

    prompt = system_prompt_repo.activate_system_prompt_version(
        db, chat_session_id, version
    )
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompot version not found",
        )
    return prompt
