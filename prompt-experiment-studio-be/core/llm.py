from typing import Any, Literal, TypedDict
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic

from services.web_search_service import search_web

Provider = Literal["openai", "google", "anthropic"]

SUPPORTED_MODELS: dict[Provider, list[str]] = {
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-5", "gpt-5-nano"],
    "google": ["gemini-2.5-flash", "gemini-2.5-pro"],
    "anthropic": ["claude-sonnet-4-5", "claude-haiku-4-5"],
}

WEB_SEARCH_POLICY = """You may use the web_search tool only when external, up-to-date information is required.
Do not use it for timeless/general knowledge questions.
When tool results are used, cite source URLs in the final answer."""


class ImageAttachment(TypedDict):
    name: str
    mime_type: str
    data_url: str


def _get_image_value(image: Any, key: str) -> str:
    if isinstance(image, dict):
        return str(image[key])
    return str(getattr(image, key))


def resolve_provider_by_model(model: str) -> Provider:
    for provider, models in SUPPORTED_MODELS.items():
        if model in models:
            return provider
    raise ValueError(f"Unsupported model: {model}")


def build_llm(model: str, api_key: str):
    provider = resolve_provider_by_model(model)
    if provider == "openai":
        return ChatOpenAI(model=model, api_key=api_key, temperature=0)
    elif provider == "google":
        return ChatGoogleGenerativeAI(model=model, api_key=api_key, temperature=0)
    elif provider == "anthropic":
        return ChatAnthropic(model=model, api_key=api_key, temperature=0)
    else:
        raise ValueError(f"Unsupported provider: {provider}")


def _content_to_text(content) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        chunks: list[str] = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                chunks.append(str(item.get("text", "")).strip())
            else:
                chunks.append(str(item).strip())
        return "\n".join([c for c in chunks if c]).strip()
    return str(content).strip()


def _build_human_content(
    user_message: str,
    images: list[ImageAttachment] | None = None,
) -> list[dict[str, Any]] | str:
    normalized_text = user_message.strip()
    normalized_images = images or []

    if not normalized_images:
        return normalized_text

    blocks: list[dict[str, Any]] = []

    if normalized_text:
        blocks.append({"type": "text", "text": normalized_text})

    for image in normalized_images:
        blocks.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": _get_image_value(image, "data_url"),
                },
            }
        )
    return blocks


def invoke_chat(
    model: str,
    api_key: str,
    system_prompt: str,
    user_message: str,
    images: list[ImageAttachment] | None = None,
) -> str:
    llm = build_llm(model=model, api_key=api_key)
    response = llm.invoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(content=_build_human_content(user_message, images)),
        ]
    )
    return _content_to_text(response.content)


def _format_search_results_for_llm(results: list[dict[str, str]]) -> str:
    if not results:
        return "No web results found."

    lines: list[str] = []
    for index, item in enumerate(results, start=1):
        title = item.get("title", "(no title)")
        url = item.get("url", "")
        snippet = item.get("snippet", "")
        source = item.get("source", "unknown")
        lines.append(f"[{index}] {title}")
        lines.append(f"source: {source}")
        lines.append(f"url: {url}")
        if snippet:
            lines.append(f"snippet: {snippet}")
        lines.append("")

    return "\n".join(lines).strip()


def _extract_last_ai_text(messages: list[Any]) -> str:
    for message in reversed(messages):
        if isinstance(message, AIMessage):
            return _content_to_text(message.content)
    return "응답을 생성하지 못했습니다."


def invoke_chat_with_web_search(
    *,
    model: str,
    api_key: str,
    system_prompt: str,
    user_message: str,
    tavily_api_key: str | None,
    images: list[ImageAttachment] | None = None,
) -> str:
    llm = build_llm(model=model, api_key=api_key)

    if not hasattr(llm, "bind_tools"):
        return invoke_chat(
            model=model,
            api_key=api_key,
            system_prompt=system_prompt,
            user_message=user_message,
        )

    @tool
    def web_search(query: str) -> str:
        """Search the web for current factual information and return citations."""
        normalized_query = query.strip()
        if not normalized_query:
            return "Query is empty."

        results = search_web(
            query=normalized_query,
            tavily_api_key=tavily_api_key,
            max_results=5,
        )
        return _format_search_results_for_llm(results)

    try:
        llm_with_tools = llm.bind_tools([web_search], tool_choice="auto")
    except Exception:
        return invoke_chat(
            model=model,
            api_key=api_key,
            system_prompt=system_prompt,
            user_message=user_message,
            images=images,
        )

    tool_enabled_system_prompt = (
        f"{system_prompt}\n\n[Tool Policy]\n{WEB_SEARCH_POLICY}"
    )
    messages: list[Any] = [
        SystemMessage(content=tool_enabled_system_prompt),
        HumanMessage(content=_build_human_content(user_message, images)),
    ]

    for step in range(3):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        tool_calls = getattr(response, "tool_calls", None) or []
        if not tool_calls:
            return _content_to_text(response.content)

        for idx, call in enumerate(tool_calls):
            name = str(call.get("name", "web_search"))
            args = call.get("args") or {}
            query = str(args.get("query", "")).strip()

            if name != "web_search":
                tool_output = f"Unsupported tool call: {name}"
            else:
                tool_output = web_search.invoke({"query": query})

            tool_call_id = str(call.get("id", f"tool-call-{step}-{idx}"))
            messages.append(
                ToolMessage(tool_call_id=tool_call_id, name=name, content=tool_output)
            )
    return _extract_last_ai_text(messages)
