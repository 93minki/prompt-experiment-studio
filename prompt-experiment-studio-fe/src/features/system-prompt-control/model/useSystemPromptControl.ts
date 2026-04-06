import { useActiveSessionId } from "@/entities/chat-session";
import { type SystemPrompt, systemPromptApi } from "@/entities/system-prompt";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseSystemPromptControlProps {
  enabled: boolean;
}

export const useSystemPromptControl = ({
  enabled,
}: UseSystemPromptControlProps) => {
  const activeSessionId = useActiveSessionId();

  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newPromptContent, setNewPromptContent] = useState("");
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [activatingVersion, setActivatingVersion] = useState<number | null>(
    null,
  );
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);

  const fetchSystemPrompts = useCallback(async () => {
    if (!enabled) return;

    if (activeSessionId === null) {
      setSystemPrompts([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const rows = await systemPromptApi.list(activeSessionId);
      setSystemPrompts(rows);
    } catch (error) {
      console.error("시스템 프롬프트 목록 조회 실패", error);
      setErrorMessage("시스템 프롬프트 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, enabled]);

  useEffect(() => {
    void fetchSystemPrompts();
  }, [fetchSystemPrompts]);

  const createPrompt = async () => {
    if (!activeSessionId) return;

    const content = newPromptContent.trim();
    if (!content) {
      toast.error("시스템 프롬프트 내용을 입력해주세요.");
      return;
    }

    setIsCreatingPrompt(true);
    try {
      await systemPromptApi.create(activeSessionId, { content });
      toast.success("시스템 프롬프트를 추가했습니다.");
      setNewPromptContent("");
      await fetchSystemPrompts();
    } catch (error) {
      console.error("시스템 프롬프트 추가 실패", error);
      toast.error("시스템 프롬프트를 추가하지 못했습니다.");
    } finally {
      setIsCreatingPrompt(false);
    }
  };
  const activatePrompt = async (version: number) => {
    if (!activeSessionId) return;

    setActivatingVersion(version);

    try {
      await systemPromptApi.changeCurrent(activeSessionId, version);
      toast.success(`v${version} 시스템 프롬프트가 활성화되었습니다.`);
      await fetchSystemPrompts();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as { detail?: string } | undefined)
          ?.detail;
        toast.error(detail ?? "시스템 프롬프트를 활성화하지 못했습니다.");
      } else {
        toast.error("시스템 프롬프트를 활성화하지 못했습니다.");
      }
    } finally {
      setActivatingVersion(null);
    }
  };

  const deletePrompt = async (version: number) => {
    if (!activeSessionId) return;

    setDeletingVersion(version);
    try {
      await systemPromptApi.delete(activeSessionId, version);
      toast.success(`v${version} 시스템 프롬프트를 삭제했습니다.`);
      await fetchSystemPrompts();
    } catch (error) {
      console.error("시스템 프롬프트 삭제 실패", error);
      toast.error("시스템 프롬프트를 삭제하지 못했습니다.");
    } finally {
      setDeletingVersion(null);
    }
  };

  return {
    activeSessionId,
    systemPrompts,
    isLoading,
    errorMessage,
    refetch: fetchSystemPrompts,

    newPromptContent,
    setNewPromptContent,
    isCreatingPrompt,
    activatingVersion,
    deletingVersion,

    createPrompt,
    activatePrompt,
    deletePrompt,
  };
};
