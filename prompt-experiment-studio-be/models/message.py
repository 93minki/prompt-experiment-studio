from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from core.database import Base


class MessageModel(Base):
    __tablename__ = "messages"

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
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
