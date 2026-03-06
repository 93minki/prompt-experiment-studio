from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from repositories import llm_api_repository as llm_api_repo
from schemas.llm_api import LLMApiKeyCreate, LLMApiKeyRead, LLMApiKeyUpdate

router = APIRouter(prefix="/llm-api-keys", tags=["llm-api-keys"])


@router.get("/", response_model=list[LLMApiKeyRead])
def get_all_llm_api_keys(db: Session = Depends(get_db)):
    rows = llm_api_repo.list_api_keys(db)
    return [llm_api_repo.to_read_schema_dict(row) for row in rows]


@router.post("/", response_model=LLMApiKeyRead, status_code=status.HTTP_201_CREATED)
def create_or_update_llm_api_key(
    payload: LLMApiKeyCreate, db: Session = Depends(get_db)
):
    row = llm_api_repo.create_or_update_api_key(
        db=db,
        provider=payload.provider,
        api_key=payload.api_key,
    )
    return llm_api_repo.to_read_schema_dict(row)


@router.patch("/{provider}", response_model=LLMApiKeyRead)
def update_llm_api_key(
    provider: str, payload: LLMApiKeyUpdate, db: Session = Depends(get_db)
):
    existing = llm_api_repo.get_by_provider(db, provider)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="LLM API key not found"
        )

    row = llm_api_repo.create_or_update_api_key(
        db=db, provider=provider, api_key=payload.api_key
    )
    return llm_api_repo.to_read_schema_dict(row)


@router.patch("/{provider}/active", response_model=LLMApiKeyRead)
def update_llm_apiKey_active(
    provider: str, is_active: bool, db: Session = Depends(get_db)
):
    row = llm_api_repo.set_active(db, provider, is_active)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Provider key not found"
        )
    return llm_api_repo.to_read_schema_dict(row)


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_llm_api_key(provider: str, db: Session = Depends(get_db)):
    deleted = llm_api_repo.delete_by_provider(db, provider)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Provider key not found"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
