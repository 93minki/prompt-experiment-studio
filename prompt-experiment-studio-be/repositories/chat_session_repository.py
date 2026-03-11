from typing import Optional

from sqlalchemy.orm import Session

from models.chat_session import ChatSessionModel


def create_chat_session(db: Session, title: str) -> ChatSessionModel:
    chat_session = ChatSessionModel(title=title)
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    return chat_session


def get_chat_session_by_id(
    db: Session, chat_session_id: int
) -> Optional[ChatSessionModel]:
    return (
        db.query(ChatSessionModel)
        .filter(ChatSessionModel.id == chat_session_id)
        .first()
    )


def list_chat_sessions(db: Session) -> list[ChatSessionModel]:
    return db.query(ChatSessionModel).order_by(ChatSessionModel.created_at.desc()).all()


def update_chat_session_title(
    db: Session,
    chat_session_id: int,
    title: str,
) -> Optional[ChatSessionModel]:
    chat_session = get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        return None

    chat_session.title = title
    db.commit()
    db.refresh(chat_session)
    return chat_session


def delete_chat_session(db: Session, chat_session_id: int) -> bool:
    chat_session = get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        return False

    db.delete(chat_session)
    db.commit()
    return True


def increment_context_revision(
    db: Session,
    chat_session_id: int,
) -> Optional[ChatSessionModel]:
    chat_session = get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        return None

    chat_session.context_revision += 1
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    return chat_session
