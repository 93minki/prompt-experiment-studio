from typing import Literal
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic

Provider = Literal["openai", "google", "anthropic"]

SUPPORTED_MODELS: dict[Provider, list[str]] = {
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-5", "gpt-5-nano"],
    "google": ["gemini-2.5-flash", "gemini-2.5-pro"],
    "anthropic": ["claude-sonnet-4-5", "claude-haiku-4-5"],
}


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


def invoke_chat(model: str, api_key: str, system_prompt: str, user_message: str) -> str:
    llm = build_llm(model=model, api_key=api_key)
    response = llm.invoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message),
        ]
    )
    return _content_to_text(response.content)


class LLM:
    _instance = dict[str, "LLM"] = {}

    def __init__(self, model: str):
        self.model = model
        self.initialize_llm()

    def initialize_llm(self):
        if self.model in SUPPORTED_MODELS["openai"]:
            self.llm = ChatOpenAI(model=self.model)
        elif self.model in SUPPORTED_MODELS["google"]:
            self.llm = ChatGoogleGenerativeAI(model=self.model)
        elif self.model in SUPPORTED_MODELS["anthropic"]:
            self.llm = ChatAnthropic(model=self.model)
        else:
            raise ValueError(f"Unsupported model: {self.model}")

    @classmethod
    def get_instance(cls, model: str = "gpt-4o"):
        inst = cls._instance.get(model)
        if inst is None:
            inst = cls(model)
            cls._instance[model] = inst
        return inst

    def get_llm(self):
        return self.llm
