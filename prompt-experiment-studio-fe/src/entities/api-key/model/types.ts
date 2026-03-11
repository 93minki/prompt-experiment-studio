export type Provider = "openai" | "google" | "anthropic" | "tavily";

export type ApiKeyRow = {
  id: number;
  provider: Provider;
  is_active: boolean;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
};

export type ApiKeyStatus = {
  exists: boolean;
  isActive: boolean;
  masked: string | null;
};

export const PROVIDERS: Array<{
  key: Provider;
  label: string;
  placeholder: string;
}> = [
  { key: "openai", label: "OpenAI", placeholder: "sk-..." },
  { key: "google", label: "Google", placeholder: "AIza..." },
  { key: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { key: "tavily", label: "Tavily", placeholder: "tvly-..." },
];

export const EMPTY_API_KEY_STATUS: Record<Provider, ApiKeyStatus> = {
  openai: { exists: false, isActive: false, masked: null },
  google: { exists: false, isActive: false, masked: null },
  anthropic: { exists: false, isActive: false, masked: null },
  tavily: { exists: false, isActive: false, masked: null },
};
