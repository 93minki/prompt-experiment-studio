import {
  messageApi,
  type ChatTurn,
  type CreateChatTurnPayload,
} from "@/entities/message";
import axios from "axios";
import { useCallback, useState } from "react";

interface UseSendChatTurnProps {
  sessionId: number | null;
  onSuccess?: (turn: ChatTurn) => void;
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)
      ?.detail;
    return detail ?? "메시지 전송에 실패했습니다.";
  }
  return "메시지 전송에 실패했습니다.";
};

export const useSendChatTurn = ({
  sessionId,
  onSuccess,
}: UseSendChatTurnProps) => {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendTurn = useCallback(
    async (payload: CreateChatTurnPayload): Promise<boolean> => {
      if (sessionId === null) {
        setErrorMessage("세션이 선택되지 않았습니다.");
        return false;
      }

      const userMessage = payload.userMessage.trim();
      const images = payload.images ?? [];
      if (!userMessage && images.length === 0) return false;

      setIsSending(true);
      setErrorMessage(null);

      try {
        const turn = await messageApi.createTurn(sessionId, {
          userMessage,
          model: payload.model,
          images,
        });
        onSuccess?.(turn);
        return true;
      } catch (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [onSuccess, sessionId],
  );

  return { sendTurn, isSending, errorMessage };
};
