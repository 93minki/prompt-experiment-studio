from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Text,
    Boolean,
    DateTime,
    UniqueConstraint,
    func,
    Index,
    text,
)
from core.database import Base


class SystemPromptModel(Base):
    __tablename__ = "system_prompts"
    __table_args__ = (
        UniqueConstraint(
            "chat_session_id", "version", name="uq_system_prompt_session_version"
        ),
        Index(
            "uq_system_prompt_current_per_session",
            "chat_session_id",
            unique=True,
            sqlite_where=text("is_current = 1"),
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = Column(Text, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    is_current = Column(Boolean, nullable=False, default=True)

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
