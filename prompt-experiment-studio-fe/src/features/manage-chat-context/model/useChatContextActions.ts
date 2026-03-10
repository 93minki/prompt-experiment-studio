import {
  messageApi,
  type ChatMessage,
  type MessageSummary,
} from "@/entities/message";
import axios from "axios";
import { useCallback, useState } from "react";

interface UseChatContextActionsProps {
  sessionId: number | null;
  onChanged?: () => Promise<void> | void;
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)
      ?.detail;
    return detail ?? "요청 처리에 실패했습니다.";
  }
  return "요청 처리에 실패했습니다.";
};

export const useChatContextActions = ({
  sessionId,
  onChanged,
}: UseChatContextActionsProps) => {
  const [updatingTurnIndex, setUpdatingTurnIndex] = useState<number | null>(
    null,
  );
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleIncludeInContext = useCallback(
    async (message: ChatMessage): Promise<boolean> => {
      if (sessionId === null) {
        setErrorMessage("세션이 선택되지 않았습니다.");
        return false;
      }

      setUpdatingTurnIndex(message.turn_index);
      setErrorMessage(null);

      try {
        await messageApi.updateTurnContext(
          sessionId,
          message.turn_index,
          !message.include_in_context,
        );
        await onChanged?.();
        return true;
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        return false;
      } finally {
        setUpdatingTurnIndex(null);
      }
    },
    [onChanged, sessionId],
  );

  const regenerateSummary = useCallback(
    async (model: string): Promise<MessageSummary | null> => {
      if (sessionId === null) {
        setErrorMessage("세션이 선택되지 않았습니다.");
        return null;
      }

      setIsRegeneratingSummary(true);
      setErrorMessage(null);

      try {
        const summary = await messageApi.regenerateSummary(sessionId, model);
        await onChanged?.();
        return summary;
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        return null;
      } finally {
        setIsRegeneratingSummary(false);
      }
    },
    [onChanged, sessionId],
  );

  return {
    toggleIncludeInContext,
    regenerateSummary,
    updatingTurnIndex,
    isRegeneratingSummary,
    errorMessage,
  };
};
