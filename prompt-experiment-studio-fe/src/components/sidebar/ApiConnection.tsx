import axios from "axios";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TabsContent } from "../ui/tabs";

type Provider = "openai" | "google" | "anthropic";

type ProviderRow = {
  id: number;
  provider: Provider;
  is_active: boolean;
  api_key_masked: string;
  created_at: string;
  updated_at: string;
};

type ProviderStatus = {
  exists: boolean;
  isActive: boolean;
  masked: string | null;
};

const PROVIDERS: Array<{ key: Provider; label: string; placeholder: string }> =
  [
    { key: "openai", label: "OpenAI", placeholder: "sk-..." },
    { key: "google", label: "Google", placeholder: "AIza..." },
    { key: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  ];

const EMPTY_STATUS: Record<Provider, ProviderStatus> = {
  openai: { exists: false, isActive: false, masked: null },
  google: { exists: false, isActive: false, masked: null },
  anthropic: { exists: false, isActive: false, masked: null },
};

const API_BASE_URL = "http://localhost:8000";

const ApiConnection = () => {
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    openai: "",
    google: "",
    anthropic: "",
  });

  const [providerStatus, setProviderStatus] =
    useState<Record<Provider, ProviderStatus>>(EMPTY_STATUS);

  const [isSaving, setIsSaving] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
  });

  const [isDeleting, setIsDeleting] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
  });

  const [saveResult, setSaveResult] = useState<Record<Provider, string | null>>(
    {
      openai: null,
      google: null,
      anthropic: null,
    },
  );

  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const { data } = await axios.get<ProviderRow[]>(
        `${API_BASE_URL}/llm-api-keys/`,
      );

      const next: Record<Provider, ProviderStatus> = {
        openai: { exists: false, isActive: false, masked: null },
        google: { exists: false, isActive: false, masked: null },
        anthropic: { exists: false, isActive: false, masked: null },
      };

      for (const row of data) {
        next[row.provider] = {
          exists: true,
          isActive: row.is_active,
          masked: row.api_key_masked,
        };
      }

      setProviderStatus(next);
    } catch (error) {
      toast.error(`API 키 목록 조회에 실패했습니다. ${error}`);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    void fetchApiKeys();
  }, []);

  const handleApiKeyChange = (
    provider: Provider,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const handleConnectApiKey = async (provider: Provider) => {
    const trimmed = apiKeys[provider].trim();

    if (!trimmed) {
      const msg = "API 키를 입력해주세요.";
      setSaveResult((prev) => ({ ...prev, [provider]: msg }));
      toast.error(msg);
      return;
    }

    setIsSaving((prev) => ({ ...prev, [provider]: true }));
    setSaveResult((prev) => ({ ...prev, [provider]: null }));

    try {
      await axios.post(`${API_BASE_URL}/llm-api-keys/`, {
        provider,
        api_key: trimmed,
      });

      const msg = providerStatus[provider].exists
        ? "API 키 수정 완료"
        : "API 키 저장 완료";
      setSaveResult((prev) => ({ ...prev, [provider]: msg }));
      toast.success(msg);

      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      await fetchApiKeys();
    } catch (error) {
      let msg = "API 키 저장에 실패했습니다.";
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as { detail?: string } | undefined)
          ?.detail;
        if (detail) msg = detail;
      }
      setSaveResult((prev) => ({ ...prev, [provider]: msg }));
      toast.error(msg);
    } finally {
      setIsSaving((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleDeleteApiKey = async (provider: Provider) => {
    if (!providerStatus[provider].exists) return;

    setIsDeleting((prev) => ({ ...prev, [provider]: true }));
    setSaveResult((prev) => ({ ...prev, [provider]: null }));

    try {
      await axios.delete(`${API_BASE_URL}/llm-api-keys/${provider}`);
      setSaveResult((prev) => ({ ...prev, [provider]: "API 키 삭제 완료" }));
      toast.success("API 키를 삭제했습니다.");
      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      await fetchApiKeys();
    } catch (error) {
      let msg = "API 키 삭제에 실패했습니다.";
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as { detail?: string } | undefined)
          ?.detail;
        if (detail) msg = detail;
      }
      setSaveResult((prev) => ({ ...prev, [provider]: msg }));
      toast.error(msg);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <TabsContent value="api" className="flex flex-col gap-4 pt-4">
      {isLoadingKeys && (
        <p className="text-xs text-muted-foreground">
          저장된 API 키 정보를 불러오는 중...
        </p>
      )}

      {PROVIDERS.map((provider) => {
        const key = provider.key;
        const status = providerStatus[key];
        const saving = isSaving[key];
        const deleting = isDeleting[key];

        return (
          <Label key={key} htmlFor={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium self-start">
                {provider.label}
              </span>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {status.exists
                    ? `등록됨 (${status.masked ?? "masked 없음"})`
                    : "등록된 키 없음"}
                </span>
                <span>
                  {status.exists ? (status.isActive ? "활성" : "비활성") : ""}
                </span>
              </div>
            </div>

            <div className="w-full flex gap-2">
              <Input
                id={key}
                type="text"
                placeholder={provider.placeholder}
                value={apiKeys[key]}
                onChange={(e) => handleApiKeyChange(key, e)}
              />

              <Button
                type="button"
                disabled={saving || deleting}
                onClick={() => void handleConnectApiKey(key)}
              >
                {saving ? "저장 중..." : status.exists ? "수정" : "저장"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={!status.exists || saving || deleting}
                onClick={() => void handleDeleteApiKey(key)}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>

            {saveResult[key] && (
              <p className="text-xs text-muted-foreground">{saveResult[key]}</p>
            )}
          </Label>
        );
      })}
    </TabsContent>
  );
};

export default ApiConnection;
