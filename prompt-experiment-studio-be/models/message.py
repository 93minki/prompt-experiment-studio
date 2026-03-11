from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)

from core.database import Base


class MessageModel(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index(
            "ix_messages_session_context_turn",
            "chat_session_id",
            "include_in_context",
            "turn_index",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    turn_index = Column(Integer, nullable=False, index=True)
    system_prompt_version = Column(Integer, nullable=False)

    include_in_context = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
        index=True,
    )
    excluded_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
