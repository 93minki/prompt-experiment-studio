from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from models.chat_session import ChatSessionModel
from models.system_prompt import SystemPromptModel


def get_current_system_prompt(
    db: Session, chat_session_id: int
) -> Optional[SystemPromptModel]:
    return (
        db.query(SystemPromptModel)
        .filter(
            SystemPromptModel.chat_session_id == chat_session_id,
            SystemPromptModel.is_current.is_(True),
            SystemPromptModel.is_archived.is_(False),
        )
        .order_by(SystemPromptModel.version.desc())
        .first()
    )


def list_system_prompts(
    db: Session, chat_session_id: int, include_archived: bool = False
) -> list[SystemPromptModel]:
    query = db.query(SystemPromptModel).filter(
        SystemPromptModel.chat_session_id == chat_session_id
    )
    if not include_archived:
        query = query.filter(SystemPromptModel.is_archived.is_(False))
    return query.order_by(SystemPromptModel.version.desc()).all()


def _allocate_next_version(db: Session, chat_session_id: int) -> int:
    session_row = (
        db.query(ChatSessionModel)
        .filter(ChatSessionModel.id == chat_session_id)
        .first()
    )
    if not session_row:
        raise ValueError("Chat session not found")

    next_version = session_row.last_system_prompt_version + 1
    session_row.last_system_prompt_version = next_version
    db.add(session_row)
    return next_version


def _deactivate_current_prompts(db: Session, chat_session_id: int) -> None:
    (
        db.query(SystemPromptModel)
        .filter(
            SystemPromptModel.chat_session_id == chat_session_id,
            SystemPromptModel.is_current.is_(True),
        )
        .update({SystemPromptModel.is_current: False}, synchronize_session=False)
    )


def create_initial_system_prompt(
    db: Session,
    chat_session_id: int,
    content: str = "You are a helpful assistant.",
) -> SystemPromptModel:
    _deactivate_current_prompts(db, chat_session_id)
    next_version = _allocate_next_version(db, chat_session_id)

    prompt = SystemPromptModel(
        chat_session_id=chat_session_id,
        content=content,
        version=next_version,
        is_current=True,
        is_archived=False,
        archived_at=None,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


def upsert_current_system_prompt(
    db: Session,
    chat_session_id: int,
    content: str,
) -> SystemPromptModel:
    _deactivate_current_prompts(db, chat_session_id)
    next_version = _allocate_next_version(db, chat_session_id)

    new_prompt = SystemPromptModel(
        chat_session_id=chat_session_id,
        content=content,
        version=next_version,
        is_current=True,
        is_archived=False,
        archived_at=None,
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    return new_prompt


def get_system_prompt_by_version(
    db: Session, chat_session_id: int, version: int
) -> Optional[SystemPromptModel]:
    return (
        db.query(SystemPromptModel)
        .filter(
            SystemPromptModel.chat_session_id == chat_session_id,
            SystemPromptModel.version == version,
        )
        .first()
    )


def archive_system_prompt_by_version(
    db: Session, chat_session_id: int, version: int
) -> Optional[SystemPromptModel]:
    prompt = get_system_prompt_by_version(db, chat_session_id, version)
    if not prompt:
        return None

    if prompt.is_current:
        raise ValueError("Cannot archive current active system prompt")

    if prompt.is_archived:
        return prompt

    prompt.is_archived = True
    prompt.archived_at = datetime.now(timezone.utc)
    prompt.is_current = False
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


def restore_system_prompt_by_version(
    db: Session, chat_session_id: int, version: int
) -> Optional[SystemPromptModel]:
    prompt = get_system_prompt_by_version(db, chat_session_id, version)
    if not prompt:
        return None

    if not prompt.is_archived:
        return prompt

    prompt.is_archived = False
    prompt.archived_at = None
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


def activate_system_prompt_version(
    db: Session, chat_session_id: int, version: int
) -> Optional[SystemPromptModel]:
    target = get_system_prompt_by_version(db, chat_session_id, version)
    if not target:
        return None

    if target.is_archived:
        raise ValueError("Cannot activate archived system prompt")

    if target.is_current:
        return target

    _deactivate_current_prompts(db, chat_session_id)
    db.flush()

    target.is_current = True
    db.add(target)
    db.commit()
    db.refresh(target)
    return target
