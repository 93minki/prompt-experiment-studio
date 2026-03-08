from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.message import MessageModel
from models.message_summary import MessageSummaryModel


def _get_next_turn_index(db: Session, chat_session_id: int) -> int:
    max_turn = (
        db.query(func.max(MessageModel.turn_index))
        .filter(MessageModel.chat_session_id == chat_session_id)
        .scalar()
    )
    return 1 if max_turn is None else max_turn + 1


def create_chat_turn(
    db: Session,
    chat_session_id: int,
    user_message: str,
    assistant_message: str,
    system_prompt_version: int,
) -> tuple[MessageModel, MessageModel]:
    turn_index = _get_next_turn_index(db, chat_session_id)

    user_row = MessageModel(
        chat_session_id=chat_session_id,
        role="user",
        content=user_message,
        turn_index=turn_index,
        system_prompt_version=system_prompt_version,
    )
    assistant_row = MessageModel(
        chat_session_id=chat_session_id,
        role="assistant",
        content=assistant_message,
        turn_index=turn_index,
        system_prompt_version=system_prompt_version,
    )

    db.add(user_row)
    db.add(assistant_row)
    db.commit()
    db.refresh(user_row)
    db.refresh(assistant_row)
    return user_row, assistant_row


def list_messages(db: Session, chat_session_id: int) -> list[MessageModel]:
    return (
        db.query(MessageModel)
        .filter(MessageModel.chat_session_id == chat_session_id)
        .order_by(MessageModel.turn_index.asc(), MessageModel.id.asc())
        .all()
    )


def get_message_summary(db: Session, chat_session_id: int) -> Optional[MessageSummaryModel]:
    return (
        db.query(MessageSummaryModel)
        .filter(MessageSummaryModel.chat_session_id == chat_session_id)
        .first()
    )


def upsert_message_summary(
    db: Session,
    chat_session_id: int,
    summary_text: str,
    summary_until_message_id: Optional[int],
    based_on_system_prompt_version: int,
) -> MessageSummaryModel:
    row = get_message_summary(db, chat_session_id)
    if row is None:
        row = MessageSummaryModel(
            chat_session_id=chat_session_id,
            summary_text=summary_text,
            summary_until_message_id=summary_until_message_id,
            based_on_system_prompt_version=based_on_system_prompt_version,
        )
        db.add(row)
    else:
        row.summary_text = summary_text
        row.summary_until_message_id = summary_until_message_id
        row.based_on_system_prompt_version = based_on_system_prompt_version
        db.add(row)

    db.commit()
    db.refresh(row)
    return row
