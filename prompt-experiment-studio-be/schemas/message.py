from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ImageAttachmentInput(BaseModel):
    name: str = Field(..., min_length=1)
    mime_type: str = Field(..., min_length=1)
    data_url: str = Field(..., min_length=1)


class ChatTurnCreate(BaseModel):
    user_message: str = Field(..., min_length=1)
    model: str = Field(default="gpt-4o", min_length=1)
    images: list[ImageAttachmentInput] = Field(default_factory=list, max_length=5)


class MessageContextUpdate(BaseModel):
    include_in_context: bool


class MessageSummaryRegenerate(BaseModel):
    model: str = Field(default="gpt-4o", min_length=1)


class MessageAttachmentRead(BaseModel):
    id: int
    message_id: int
    name: str
    mime_type: str
    data_url: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageRead(BaseModel):
    id: int
    chat_session_id: int
    role: str
    content: str
    turn_index: int
    system_prompt_version: int
    include_in_context: bool
    excluded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    attachments: list[MessageAttachmentRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MessageSummaryRead(BaseModel):
    id: int
    chat_session_id: int
    summary_text: str
    summary_until_message_id: Optional[int]
    based_on_system_prompt_version: int
    summary_version: int
    is_stale: bool
    based_on_context_revision: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatTurnRead(BaseModel):
    user: MessageRead
    assistant: MessageRead
    summary: Optional[MessageSummaryRead] = None
