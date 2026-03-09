export type Provider = "openai" | "google" | "anthropic";

export type ProviderKeyRow = {
  id: number;
  provider: Provider;
  is_active: boolean;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
};

export type ProviderStatus = {
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
];

export const EMPTY_PROVIDER_STATUS: Record<Provider, ProviderStatus> = {
  openai: { exists: false, isActive: false, masked: null },
  google: { exists: false, isActive: false, masked: null },
  anthropic: { exists: false, isActive: false, masked: null },
};
