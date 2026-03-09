from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SystemPromptCreate(BaseModel):
    content: str = Field(..., min_length=1)


class SystemPromptUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class SystemPromptRead(BaseModel):
    id: int
    chat_session_id: int
    content: str
    version: int
    is_current: bool
    is_archived: bool
    archived_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
