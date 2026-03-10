from datetime import datetime, timezone
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
        include_in_context=True,
    )
    assistant_row = MessageModel(
        chat_session_id=chat_session_id,
        role="assistant",
        content=assistant_message,
        turn_index=turn_index,
        system_prompt_version=system_prompt_version,
        include_in_context=True,
    )

    db.add(user_row)
    db.add(assistant_row)
    db.commit()
    db.refresh(user_row)
    db.refresh(assistant_row)
    return user_row, assistant_row


def list_messages(
    db: Session,
    chat_session_id: int,
    include_in_context: Optional[bool] = None,
) -> list[MessageModel]:
    query = db.query(MessageModel).filter(
        MessageModel.chat_session_id == chat_session_id
    )
    if include_in_context is not None:
        query = query.filter(MessageModel.include_in_context.is_(include_in_context))

    return query.order_by(MessageModel.turn_index.asc(), MessageModel.id.asc()).all()


def list_context_messages(db: Session, chat_session_id: int) -> list[MessageModel]:
    return list_messages(db, chat_session_id, include_in_context=True)


def get_message_by_id(
    db: Session,
    chat_session_id: int,
    message_id: int,
) -> Optional[MessageModel]:
    return (
        db.query(MessageModel)
        .filter(
            MessageModel.chat_session_id == chat_session_id,
            MessageModel.id == message_id,
        )
        .first()
    )


def update_message_context_inclusion(
    db: Session,
    chat_session_id: int,
    message_id: int,
    include_in_context: bool,
) -> tuple[Optional[MessageModel], bool]:
    row = get_message_by_id(db, chat_session_id, message_id)
    if not row:
        return None, False

    if row.include_in_context == include_in_context:
        return row, False

    row.include_in_context = include_in_context
    row.excluded_at = None if include_in_context else datetime.now(timezone.utc)

    db.add(row)
    db.commit()
    db.refresh(row)
    return row, True


def get_message_summary(
    db: Session, chat_session_id: int
) -> Optional[MessageSummaryModel]:
    return (
        db.query(MessageSummaryModel)
        .filter(MessageSummaryModel.chat_session_id == chat_session_id)
        .first()
    )


def mark_message_summary_stale(
    db: Session,
    chat_session_id: int,
) -> Optional[MessageSummaryModel]:
    row = get_message_summary(db, chat_session_id)
    if row is None:
        return None

    if row.is_stale:
        return row

    row.is_stale = True
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def upsert_message_summary(
    db: Session,
    chat_session_id: int,
    summary_text: str,
    summary_until_message_id: Optional[int],
    based_on_system_prompt_version: int,
    based_on_context_revision: int,
) -> MessageSummaryModel:
    row = get_message_summary(db, chat_session_id)
    if row is None:
        row = MessageSummaryModel(
            chat_session_id=chat_session_id,
            summary_text=summary_text,
            summary_until_message_id=summary_until_message_id,
            based_on_system_prompt_version=based_on_system_prompt_version,
            based_on_context_revision=based_on_context_revision,
            summary_version=1,
            is_stale=False,
        )
        db.add(row)
    else:
        row.summary_text = summary_text
        row.summary_until_message_id = summary_until_message_id
        row.based_on_system_prompt_version = based_on_system_prompt_version
        row.based_on_context_revision = based_on_context_revision
        row.summary_version += 1
        row.is_stale = False
        db.add(row)

    db.commit()
    db.refresh(row)
    return row
