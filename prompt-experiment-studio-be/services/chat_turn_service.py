import tiktoken
from sqlalchemy.orm import Session

from core.llm import invoke_chat, resolve_provider_by_model
from models.message import MessageModel
from models.message_summary import MessageSummaryModel
from repositories import chat_session_repository as chat_session_repo
from repositories import llm_api_repository as llm_api_repo
from repositories import message_repository as message_repo
from repositories import system_prompt_repository as system_prompt_repo

SUMMARY_SYSTEM_PROMPT = """You summarize chat context for future turns.
Keep it concise and factual.
Focus on durable facts, constraints, decisions, and unresolved tasks.
Output plain text only."""

RECENT_TURN_COUNT = 3
SUMMARY_TRIGGER_TURN_COUNT = 8

SOFT_CONTEXT_LIMIT_TOKENS = 8_000
HARD_CONTEXT_LIMIT_TOKENS = 60_000

SUMMARY_TARGET_TOKENS = 900
SUMMARY_MAX_TOKENS = 1_200


def _estimate_tokens(text: str, model: str) -> int:
    if not text.strip():
        return 0
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))


def _build_runtime_system_prompt(base_system_prompt: str, summary_text: str) -> str:
    if summary_text.strip():
        return f"{base_system_prompt}\n\n[Session Summary]\n{summary_text}"
    return f"{base_system_prompt}\n\n[Session Summary]\n(none)"


def _messages_to_dialogue_text(messages: list[MessageModel]) -> str:
    if not messages:
        return ""
    lines: list[str] = []
    for message in messages:
        role = "User" if message.role == "user" else "Assistant"
        lines.append(f"{role}: {message.content}")
    return "\n".join(lines)


def _build_runtime_user_message(
    history_messages: list[MessageModel],
    current_user_message: str,
) -> str:
    history_text = _messages_to_dialogue_text(history_messages).strip()
    if not history_text:
        return current_user_message

    return (
        "[Recent conversation]\n"
        f"{history_text}\n\n"
        "[Current user message]\n"
        f"{current_user_message}"
    )


def _take_recent_turn_messages(
    messages: list[MessageModel],
    recent_turn_count: int,
) -> list[MessageModel]:
    if not messages or recent_turn_count <= 0:
        return []

    recent_turn_indices: list[int] = []
    seen_turn_indices: set[int] = set()

    for message in reversed(messages):
        if message.turn_index in seen_turn_indices:
            continue
        seen_turn_indices.add(message.turn_index)
        recent_turn_indices.append(message.turn_index)
        if len(recent_turn_indices) >= recent_turn_count:
            break

    keep_turns = set(recent_turn_indices)
    return [message for message in messages if message.turn_index in keep_turns]


def _exclude_recent_turn_messages(
    messages: list[MessageModel],
    recent_turn_count: int,
) -> list[MessageModel]:
    recent_messages = _take_recent_turn_messages(messages, recent_turn_count)
    recent_ids = {message.id for message in recent_messages}
    return [message for message in messages if message.id not in recent_ids]


def _extract_unsummarized_messages(
    messages: list[MessageModel],
    summary_until_message_id: int | None,
) -> list[MessageModel]:
    if summary_until_message_id is None:
        return messages
    return [message for message in messages if message.id > summary_until_message_id]


def _estimate_runtime_context_tokens(
    *,
    model: str,
    system_prompt: str,
    summary_text: str,
    history_messages: list[MessageModel],
    current_user_message: str,
) -> int:
    runtime_system_prompt = _build_runtime_system_prompt(system_prompt, summary_text)
    runtime_user_message = _build_runtime_user_message(
        history_messages,
        current_user_message,
    )
    return _estimate_tokens(runtime_system_prompt, model) + _estimate_tokens(
        runtime_user_message, model
    )


def _build_summary_user_prompt(previous_summary: str, chunk_text: str) -> str:
    return f"""
Update the session summary.

Target length:
- Around {SUMMARY_TARGET_TOKENS} tokens
- Never exceed {SUMMARY_MAX_TOKENS} tokens

Keep:
- User preferences and constraints
- Key facts and decisions
- Open questions / TODOs

Drop:
- Repeated filler and small talk

[Previous summary]
{previous_summary or "(none)"}

[New conversation chunk]
{chunk_text}

Return plain text summary only.
""".strip()


def _resolve_api_key(db: Session, model: str) -> str:
    provider = resolve_provider_by_model(model)
    api_key_row = llm_api_repo.get_active_by_provider(db, provider)
    if not api_key_row:
        raise ValueError(f"No active API key found for provider: {provider}")
    return api_key_row.api_key


def _upsert_summary_from_chunk(
    *,
    db: Session,
    chat_session_id: int,
    model: str,
    api_key: str,
    previous_summary: str,
    chunk_messages: list[MessageModel],
    based_on_system_prompt_version: int,
    based_on_context_revision: int,
) -> MessageSummaryModel:
    chunk_text = _messages_to_dialogue_text(chunk_messages)
    new_summary = invoke_chat(
        model=model,
        api_key=api_key,
        system_prompt=SUMMARY_SYSTEM_PROMPT,
        user_message=_build_summary_user_prompt(
            previous_summary=previous_summary,
            chunk_text=chunk_text,
        ),
    )
    return message_repo.upsert_message_summary(
        db=db,
        chat_session_id=chat_session_id,
        summary_text=new_summary,
        summary_until_message_id=chunk_messages[-1].id,
        based_on_system_prompt_version=based_on_system_prompt_version,
        based_on_context_revision=based_on_context_revision,
    )


def _should_create_initial_summary(
    *,
    model: str,
    system_prompt: str,
    history_messages: list[MessageModel],
    current_user_message: str,
) -> bool:
    if not history_messages:
        return False

    total_turn_count = len({message.turn_index for message in history_messages})
    if total_turn_count >= SUMMARY_TRIGGER_TURN_COUNT:
        return True

    estimated_tokens = _estimate_runtime_context_tokens(
        model=model,
        system_prompt=system_prompt,
        summary_text="",
        history_messages=history_messages,
        current_user_message=current_user_message,
    )
    return estimated_tokens > SOFT_CONTEXT_LIMIT_TOKENS


def _maybe_refresh_summary(
    *,
    db: Session,
    chat_session_id: int,
    model: str,
    api_key: str,
    base_system_prompt: str,
    current_user_message: str,
    all_context_messages: list[MessageModel],
    summary_row: MessageSummaryModel,
    based_on_system_prompt_version: int,
    based_on_context_revision: int,
) -> MessageSummaryModel:
    unsummarized_messages = _extract_unsummarized_messages(
        all_context_messages, summary_row.summary_until_message_id
    )
    if not unsummarized_messages:
        return summary_row

    unsummarized_turn_count = len(
        {message.turn_index for message in unsummarized_messages}
    )
    recent_messages = _take_recent_turn_messages(
        all_context_messages, RECENT_TURN_COUNT
    )

    estimated_tokens = _estimate_runtime_context_tokens(
        model=model,
        system_prompt=base_system_prompt,
        summary_text=summary_row.summary_text,
        history_messages=recent_messages,
        current_user_message=current_user_message,
    )

    should_refresh = (
        unsummarized_turn_count >= SUMMARY_TRIGGER_TURN_COUNT
        or estimated_tokens > SOFT_CONTEXT_LIMIT_TOKENS
    )
    if not should_refresh:
        return summary_row

    chunk_messages = _exclude_recent_turn_messages(
        unsummarized_messages, RECENT_TURN_COUNT
    )
    if not chunk_messages:
        return summary_row

    return _upsert_summary_from_chunk(
        db=db,
        chat_session_id=chat_session_id,
        model=model,
        api_key=api_key,
        previous_summary=summary_row.summary_text,
        chunk_messages=chunk_messages,
        based_on_system_prompt_version=based_on_system_prompt_version,
        based_on_context_revision=based_on_context_revision,
    )


def regenerate_chat_summary(
    *,
    db: Session,
    chat_session_id: int,
    model: str,
) -> MessageSummaryModel:
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise ValueError("Chat session not found")

    current_prompt = system_prompt_repo.get_current_system_prompt(db, chat_session_id)
    if not current_prompt:
        raise ValueError("Current System Prompt not found")

    source_messages = message_repo.list_context_messages(db, chat_session_id)
    if not source_messages:
        raise ValueError("No context messages available to summarize")

    api_key = _resolve_api_key(db, model)

    return _upsert_summary_from_chunk(
        db=db,
        chat_session_id=chat_session_id,
        model=model,
        api_key=api_key,
        previous_summary="",
        chunk_messages=source_messages,
        based_on_system_prompt_version=current_prompt.version,
        based_on_context_revision=chat_session.context_revision,
    )


def run_chat_turn_with_llm(
    db: Session,
    chat_session_id: int,
    user_message: str,
    model: str,
):
    chat_session = chat_session_repo.get_chat_session_by_id(db, chat_session_id)
    if not chat_session:
        raise ValueError("Chat session not found")

    current_prompt = system_prompt_repo.get_current_system_prompt(db, chat_session_id)
    if not current_prompt:
        raise ValueError("Current System Prompt not found")

    api_key = _resolve_api_key(db, model)

    all_context_messages = message_repo.list_context_messages(db, chat_session_id)
    summary_row = message_repo.get_message_summary(db, chat_session_id)

    # context 변경으로 기존 요약이 stale이면 1회 재생성
    if summary_row and (
        summary_row.is_stale
        or summary_row.based_on_context_revision != chat_session.context_revision
    ):
        if all_context_messages:
            summary_row = regenerate_chat_summary(
                db=db,
                chat_session_id=chat_session_id,
                model=model,
            )
        else:
            summary_row = None

    if summary_row is None:
        if _should_create_initial_summary(
            model=model,
            system_prompt=current_prompt.content,
            history_messages=all_context_messages,
            current_user_message=user_message,
        ):
            initial_chunk = _exclude_recent_turn_messages(
                all_context_messages, RECENT_TURN_COUNT
            )
            if initial_chunk:
                summary_row = _upsert_summary_from_chunk(
                    db=db,
                    chat_session_id=chat_session_id,
                    model=model,
                    api_key=api_key,
                    previous_summary="",
                    chunk_messages=initial_chunk,
                    based_on_system_prompt_version=current_prompt.version,
                    based_on_context_revision=chat_session.context_revision,
                )

    if summary_row is not None:
        summary_row = _maybe_refresh_summary(
            db=db,
            chat_session_id=chat_session_id,
            model=model,
            api_key=api_key,
            base_system_prompt=current_prompt.content,
            current_user_message=user_message,
            all_context_messages=all_context_messages,
            summary_row=summary_row,
            based_on_system_prompt_version=current_prompt.version,
            based_on_context_revision=chat_session.context_revision,
        )
        runtime_history_messages = _take_recent_turn_messages(
            all_context_messages, RECENT_TURN_COUNT
        )
        runtime_summary_text = summary_row.summary_text
    else:
        runtime_history_messages = all_context_messages
        runtime_summary_text = ""

    runtime_system_prompt = _build_runtime_system_prompt(
        base_system_prompt=current_prompt.content,
        summary_text=runtime_summary_text,
    )
    runtime_user_message = _build_runtime_user_message(
        history_messages=runtime_history_messages,
        current_user_message=user_message,
    )

    runtime_tokens = _estimate_tokens(runtime_system_prompt, model) + _estimate_tokens(
        runtime_user_message, model
    )
    if runtime_tokens > HARD_CONTEXT_LIMIT_TOKENS:
        raise ValueError(
            "Context is too large to process. Please shorten the current question or system prompt."
        )

    assistant_message = invoke_chat(
        model=model,
        api_key=api_key,
        system_prompt=runtime_system_prompt,
        user_message=runtime_user_message,
    )

    user_row, assistant_row = message_repo.create_chat_turn(
        db=db,
        chat_session_id=chat_session_id,
        user_message=user_message,
        assistant_message=assistant_message,
        system_prompt_version=current_prompt.version,
    )

    return user_row, assistant_row, summary_row
