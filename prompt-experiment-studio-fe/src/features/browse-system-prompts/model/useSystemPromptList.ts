import { type SystemPrompt, systemPromptApi } from "@/entities/system-prompt";
import { useCallback, useEffect, useState } from "react";

interface UseSystemPromptListProps {
  sessionId: number | null;
  enabled: boolean;
}

export const useSystemPromptList = ({
  sessionId,
  enabled = true,
}: UseSystemPromptListProps) => {
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSystemPrompts = useCallback(async () => {
    if (!enabled) return;

    if (sessionId === null) {
      setSystemPrompts([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await systemPromptApi.list(sessionId);
      setSystemPrompts(data);
    } catch (error) {
      console.error("시스템 프롬프트 목록 조회 실패", error);
      setErrorMessage("시스템 프롬프트 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, sessionId]);

  useEffect(() => {
    void fetchSystemPrompts();
  }, [fetchSystemPrompts]);

  return {
    systemPrompts,
    isLoading,
    errorMessage,
    refetch: fetchSystemPrompts,
  };
};
