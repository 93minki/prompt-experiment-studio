import {
  apiKeyApi,
  EMPTY_API_KEY_STATUS,
  PROVIDERS,
  type ApiKeyStatus,
  type Provider,
} from "@/entities/api-key";
import { useCallback, useEffect, useState } from "react";

export const useApiConnection = () => {
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    openai: "",
    google: "",
    anthropic: "",
    tavily: "",
  });

  const [providerStatus, setProviderStatus] =
    useState<Record<Provider, ApiKeyStatus>>(EMPTY_API_KEY_STATUS);

  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
    tavily: false,
  });
  const [isDeleting, setIsDeleting] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
    tavily: false,
  });
  const [messageByProvider, setMessageByProvider] = useState<
    Record<Provider, string | null>
  >({
    openai: null,
    google: null,
    anthropic: null,
    tavily: null,
  });

  const fetchKeys = useCallback(async () => {
    setIsLoadingKeys(true);
    try {
      const rows = await apiKeyApi.list();
      const next = { ...EMPTY_API_KEY_STATUS };
      for (const row of rows) {
        next[row.provider] = {
          exists: true,
          isActive: row.is_active,
          masked: row.api_key_masked,
        };
      }
      setProviderStatus(next);
    } finally {
      setIsLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  const setKey = (provider: Provider, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const save = async (provider: Provider) => {
    const trimmed = apiKeys[provider].trim();
    if (!trimmed) {
      setMessageByProvider((prev) => ({
        ...prev,
        [provider]: "API 키를 입력해주세요.",
      }));
      return { ok: false as const, message: "API 키를 입력해주세요." };
    }

    setIsSaving((prev) => ({ ...prev, [provider]: true }));
    setMessageByProvider((prev) => ({ ...prev, [provider]: null }));

    try {
      await apiKeyApi.update(provider, trimmed);
      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      await fetchKeys();
      const msg = providerStatus[provider].exists
        ? "API 키 수정 완료"
        : "API 키 저장 완료";
      setMessageByProvider((prev) => ({ ...prev, [provider]: msg }));
      return { ok: true as const, message: msg };
    } catch {
      const msg = "API 키 저장에 실패했습니다.";
      setMessageByProvider((prev) => ({ ...prev, [provider]: msg }));
      return { ok: false as const, message: msg };
    } finally {
      setIsSaving((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const remove = async (provider: Provider) => {
    if (!providerStatus[provider].exists)
      return { ok: false as const, message: "" };

    setIsDeleting((prev) => ({ ...prev, [provider]: true }));
    setMessageByProvider((prev) => ({ ...prev, [provider]: null }));

    try {
      await apiKeyApi.remove(provider);
      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      await fetchKeys();
      const msg = "API 키 삭제 완료";
      setMessageByProvider((prev) => ({ ...prev, [provider]: msg }));
      return { ok: true as const, message: msg };
    } catch {
      const msg = "API 키 삭제에 실패했습니다.";
      setMessageByProvider((prev) => ({ ...prev, [provider]: msg }));
      return { ok: false as const, message: msg };
    } finally {
      setIsDeleting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return {
    providers: PROVIDERS,
    apiKeys,
    providerStatus,
    isLoadingKeys,
    isSaving,
    isDeleting,
    messageByProvider,
    setKey,
    save,
    remove,
  };
};
