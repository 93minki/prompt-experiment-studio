from typing import Optional
from sqlalchemy.orm import Session
from models.system_prompt import SystemPromptModel


def get_current_system_prompt(
    db: Session, chat_session_id: int
) -> Optional[SystemPromptModel]:
    return (
        db.query(SystemPromptModel)
        .filter(
            SystemPromptModel.chat_session_id == chat_session_id,
            SystemPromptModel.is_current.is_(True),
        )
        .order_by(SystemPromptModel.version.desc())
        .first()
    )


def list_system_prompts(db: Session, chat_session_id: int) -> list[SystemPromptModel]:
    return (
        db.query(SystemPromptModel)
        .filter(SystemPromptModel.chat_session_id == chat_session_id)
        .order_by(SystemPromptModel.version.desc())
        .all()
    )


def create_initial_system_prompt(
    db: Session, chat_session_id: int, content: str = "You are a helpful assistant."
) -> SystemPromptModel:
    prompt = SystemPromptModel(
        chat_session_id=chat_session_id,
        content=content,
        version=1,
        is_current=True,
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
    current = get_current_system_prompt(db, chat_session_id)

    next_version = 1
    if current:
        current.is_current = False
        next_version = current.version + 1
        db.add(current)

    new_prompt = SystemPromptModel(
        chat_session_id=chat_session_id,
        content=content,
        version=next_version,
        is_current=True,
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    return new_prompt


def delete_system_prompt_by_version(
    db: Session, chat_session_id: int, version: int
) -> bool:
    prompt = (
        db.query(SystemPromptModel)
        .filter(
            SystemPromptModel.chat_session_id == chat_session_id,
            SystemPromptModel.version == version,
        )
        .first()
    )

    if not prompt:
        return False

    db.delete(prompt)
    db.commit()
    return True


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


def activate_system_prompt_version(
    db: Session, chat_session_id: int, version: int
) -> Optional[SystemPromptModel]:
    target = get_system_prompt_by_version(db, chat_session_id, version)
    if not target:
        return None

    current = get_current_system_prompt(db, chat_session_id)
    if current and current.id != target.id:
        current.is_current = False
        db.add(current)

    target.is_current = True
    db.add(target)
    db.commit()
    db.refresh(target)
    return target
