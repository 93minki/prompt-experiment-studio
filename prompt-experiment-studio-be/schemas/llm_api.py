from datetime import datetime
from pydantic import BaseModel, Field


class LLMApiKeyCreate(BaseModel):
    provider: str = Field(..., min_length=1, max_length=30)
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
