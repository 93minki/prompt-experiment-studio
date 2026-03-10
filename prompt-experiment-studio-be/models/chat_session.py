from sqlalchemy import Column, DateTime, Integer, String, func

from core.database import Base


class ChatSessionModel(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(120), nullable=False, default="New Session")
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    last_system_prompt_version = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    # 메시지 수정/제외/복구가 일어날 때마다 +1
    context_revision = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
