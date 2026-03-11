from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    func,
)

from core.database import Base


class MessageSummaryModel(Base):
    __tablename__ = "message_summaries"
    __table_args__ = (
        UniqueConstraint("chat_session_id", name="uq_message_summary_chat_session_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    summary_text = Column(Text, nullable=False)
    summary_until_message_id = Column(Integer, nullable=True)
    based_on_system_prompt_version = Column(Integer, nullable=False)

    # 요약 버전 관리
    summary_version = Column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    # 현재 요약이 유효한지 여부
    is_stale = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
        index=True,
    )

    # 어떤 context_revision 기준으로 만들어진 요약인지
    based_on_context_revision = Column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
