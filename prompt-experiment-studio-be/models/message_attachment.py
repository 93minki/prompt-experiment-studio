from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from core.database import Base
from sqlalchemy.orm import relationship


class MessageAttachmentModel(Base):
    __tablename__ = "message_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(
        Integer,
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    data_url = Column(Text, nullable=False)

    is_pinned = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
        index=True,
    )

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

    message = relationship("MessageModel", back_populates="attachments")
