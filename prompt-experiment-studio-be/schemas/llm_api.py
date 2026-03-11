from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class LLMApiKeyCreate(BaseModel):
    provider: Literal["openai", "google", "anthropic", "tavily"]
    api_key: str = Field(..., min_length=1)


class LLMApiKeyUpdate(BaseModel):
    api_key: str = Field(..., min_length=1)


class LLMApiKeyRead(BaseModel):
    id: int
    provider: str
    is_active: bool
    api_key_masked: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
