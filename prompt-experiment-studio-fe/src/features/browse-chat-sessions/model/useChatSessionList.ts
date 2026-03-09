import { type ChatSession, chatSessionApi } from "@/app/entities/chat-session";
import { useCallback, useEffect, useState } from "react";

export const useChatSessionList = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await chatSessionApi.list();
      setSessions(data);
    } catch (error) {
      console.error("세션 목록 조회 실패", error);
      setErrorMessage("세션 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, errorMessage, refetch: fetchSessions };
};
