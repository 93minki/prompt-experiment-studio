from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChatTurnCreate(BaseModel):
    user_message: str = Field(..., min_length=1)
    model: str = Field(default="gpt-4o", min_length=1)


class MessageRead(BaseModel):
    id: int
    chat_session_id: int
    role: str
    content: str
    turn_index: int
    system_prompt_version: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageSummaryRead(BaseModel):
    id: int
    chat_session_id: int
    summary_text: str
    summary_until_message_id: Optional[int]
    based_on_system_prompt_version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ChatTurnRead(BaseModel):
  user: MessageRead
  assistant: MessageRead
  summary: MessageSummaryRead
  
  