import {
  messageApi,
  type ChatMessage,
  type ChatTurn,
} from "@/entities/message";
import { useCallback, useEffect, useState } from "react";

interface UseChatMessageListProps {
  sessionId: number | null;
  enabled?: boolean;
}

export const useChatMessageList = ({
  sessionId,
  enabled,
}: UseChatMessageListProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!enabled) return;

    if (sessionId === null) {
      setMessages([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await messageApi.list(sessionId);
      setMessages(data);
    } catch (error) {
      console.error("메시지 목록 조회 실패", error);
      setErrorMessage("메시지 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, sessionId]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const appendTurn = useCallback(async (turn: ChatTurn) => {
    setMessages((prev) => [...prev, turn.user, turn.assistant]);
  }, []);

  return {
    messages,
    isLoading,
    errorMessage,
    refetch: fetchMessages,
    appendTurn,
  };
};
