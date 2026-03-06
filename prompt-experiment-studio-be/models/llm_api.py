from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    Text,
    UniqueConstraint,
    func,
)
from core.database import Base


class LLMApiKeyModel(Base):
    __tablename__ = "llm_api_keys"
    __table_args__ = (UniqueConstraint("provider", name="uq_llm_api_keys_provider"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider = Column(String(30), nullable=False)
    api_key = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

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
