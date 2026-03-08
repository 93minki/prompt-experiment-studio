from sqlalchemy.orm import Session

from core.llm import invoke_chat, resolve_provider_by_model
from repositories import llm_api_repository as llm_api_repo
from repositories import message_repository as message_repo
from repositories import system_prompt_repository as system_prompt_repo

SUMMARY_SYSTEM_PROMPT = """You summarize chat context for future turns.
Keep it concise and factual.
Output plain text only."""


def _build_runtime_system_prompt(base_system_prompt: str, previous_summary: str) -> str:
    if previous_summary.strip():
        return f"{base_system_prompt}\n\n[Previous conversation summary]\n{previous_summary}"
    return f"{base_system_prompt}\n\n[Previous conversation summary]\n(none)"


def _build_summary_user_prompt(
    previous_summary: str, user_message: str, assistant_message: str
) -> str:
    return f"""
    Previous summary: {previous_summary or '(none)'}
    New User Message: {user_message}
    New Assistant Message: {assistant_message}
    Update the summary merging old + new information
    """


def run_chat_turn_with_llm(
    db: Session,
    chat_session_id: int,
    user_message: str,
    model: str,
):
    current_prompt = system_prompt_repo.get_current_system_prompt(db, chat_session_id)
    if not current_prompt:
        raise ValueError("Current System Prompt not found")

    summary_row = message_repo.get_message_summary(db, chat_session_id)
    previous_summary = summary_row.summary_text if summary_row else ""

    provider = resolve_provider_by_model(model)
    api_key_row = llm_api_repo.get_active_by_provider(db, provider)
    if not api_key_row:
        raise ValueError(f"No active API key found for provider: {provider}")

    runtime_system_prompt = _build_runtime_system_prompt(
        base_system_prompt=current_prompt.content,
        previous_summary=previous_summary,
    )

    assistant_message = invoke_chat(
        model=model,
        api_key=api_key_row.api_key,
        system_prompt=runtime_system_prompt,
        user_message=user_message,
    )

    user_row, assistant_row = message_repo.create_chat_turn(
        db=db,
        chat_session_id=chat_session_id,
        user_message=user_message,
        assistant_message=assistant_message,
        system_prompt_version=current_prompt.version,
    )

    new_summary = invoke_chat(
        model=model,
        api_key=api_key_row.api_key,
        system_prompt=SUMMARY_SYSTEM_PROMPT,
        user_message=_build_summary_user_prompt(
            previous_summary=previous_summary,
            user_message=user_message,
            assistant_message=assistant_message,
        ),
    )

    summary_saved = message_repo.upsert_message_summary(
        db=db,
        chat_session_id=chat_session_id,
        summary_text=new_summary,
        summary_until_message_id=assistant_row.id,
        based_on_system_prompt_version=current_prompt.version,
    )

    return user_row, assistant_row, summary_saved
