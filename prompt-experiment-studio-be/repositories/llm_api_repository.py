from optparse import Option
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql.operators import is_associative

from models.llm_api import LLMApiKeyModel


def _mask_api_key(api_key: str) -> str:
    if len(api_key) <= 8:
        return "*" * len(api_key)
    return f"{api_key[:4]}...{api_key[-4:]}"


def get_by_provider(db: Session, provider: str) -> Optional[LLMApiKeyModel]:
    return db.query(LLMApiKeyModel).filter(LLMApiKeyModel.provider == provider).first()


def create_or_update_api_key(
    db: Session,
    provider: str,
    api_key: str,
) -> LLMApiKeyModel:
    existing = get_by_provider(db, provider)

    if existing:
        existing.api_key = api_key
        existing.is_active = True
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    row = LLMApiKeyModel(
        provider=provider,
        api_key=api_key,
        is_active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_api_keys(db: Session) -> list[LLMApiKeyModel]:
    return db.query(LLMApiKeyModel).order_by(LLMApiKeyModel.created_at.desc()).all()


def set_active(db: Session, provider: str, is_active: bool) -> Optional[LLMApiKeyModel]:
    row = get_by_provider(db, provider)
    if not row:
        return None
    row.is_active = is_active
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete_by_provider(db: Session, provider: str) -> bool:
    row = get_by_provider(db, provider)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def to_read_schema_dict(row: LLMApiKeyModel) -> dict:
    return {
        "id": row.id,
        "provider": row.provider,
        "is_active": row.is_active,
        "api_key_masked": _mask_api_key(row.api_key),
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }
