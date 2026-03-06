from datetime import datetime

from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    title: str = Field(default="New Session", max_length=120)


class ChatSessionUpdateTitle(BaseModel):
    title: str = Field(..., max_length=120)


class ChatSessionRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
