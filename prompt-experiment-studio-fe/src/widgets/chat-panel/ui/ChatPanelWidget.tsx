import { useActiveSessionId } from "@/entities/chat-session";
import {
  MessageList,
  type ChatMessage,
  type CreateChatTurnPayload,
} from "@/entities/message";
import { useChatMessageList } from "@/features/browse-chat-messages";
import { useChatContextActions } from "@/features/manage-chat-context";
import { ChatComposer, useSendChatTurn } from "@/features/send-chat-turn";
import { Button } from "@/shared/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SUMMARY_MODEL = "gpt-4o";

export const ChatPanelWidget = () => {
  const activeSessionId = useActiveSessionId();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isContextEditMode, setIsContextEditMode] = useState(false);

  const { messages, isLoading, errorMessage, refetch, appendTurn } =
    useChatMessageList({
      sessionId: activeSessionId,
      enabled: activeSessionId !== null,
    });

  const {
    sendTurn,
    isSending,
    errorMessage: sendErrorMessage,
  } = useSendChatTurn({
    sessionId: activeSessionId,
    onSuccess: appendTurn,
  });

  const {
    toggleIncludeInContext,
    regenerateSummary,
    updatingTurnIndex,
    isRegeneratingSummary,
    errorMessage: contextErrorMessage,
  } = useChatContextActions({
    sessionId: activeSessionId,
    onChanged: refetch,
  });

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  if (activeSessionId === null) {
    return (
      <div className="flex w-full flex-1 items-center justify-center p-4">
        <div className="rounded-md border px-6 py-8 text-center">
          <p className="text-base font-medium">세션을 선택해주세요.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            사이드바에서 세션을 선택하거나 새로 생성하세요.
          </p>
        </div>
      </div>
    );
  }

  const handleSend = async (payload: CreateChatTurnPayload) => {
    return sendTurn(payload);
  };

  const handleToggleContext = async (message: ChatMessage) => {
    const ok = await toggleIncludeInContext(message);
    if (!ok) {
      toast.error("턴 컨텍스트 설정 변경에 실패했습니다.");
      return;
    }

    toast.success(
      message.include_in_context
        ? "턴을 컨텍스트에서 제외했습니다."
        : "턴을 컨텍스트에 다시 포함했습니다.",
    );
  };

  const handleRegenerateSummary = async () => {
    const summary = await regenerateSummary(SUMMARY_MODEL);
    if (!summary) {
      toast.error("요약 재생성에 실패했습니다.");
      return;
    }

    toast.success(
      `요약이 갱신되었습니다. (summary v${summary.summary_version})`,
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full min-h-0 flex-1 p-4">
      <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {isContextEditMode
            ? "턴별 컨텍스트 포함 여부를 수정할 수 있습니다."
            : "필요한 턴만 남기고 요약을 다시 생성할 수 있습니다."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={isContextEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsContextEditMode((prev) => !prev)}
          >
            {isContextEditMode ? "편집 종료" : "컨텍스트 편집"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isRegeneratingSummary || isLoading}
            onClick={() => void handleRegenerateSummary()}
          >
            {isRegeneratingSummary ? "요약 중..." : "요약 실행"}
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 border rounded-md p-3 overflow-y-auto"
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">대화를 불러오는 중...</p>
        ) : (
          <MessageList
            messages={messages}
            isContextEditMode={isContextEditMode}
            updatingTurnIndex={updatingTurnIndex}
            onToggleContext={handleToggleContext}
          />
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-red-500">{errorMessage}</p>
          <Button variant="outline" onClick={() => void refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {sendErrorMessage && (
        <p className="text-sm text-red-500">{sendErrorMessage}</p>
      )}
      {contextErrorMessage && (
        <p className="text-sm text-red-500">{contextErrorMessage}</p>
      )}

      <ChatComposer
        disabled={isLoading || isSending}
        isSending={isSending}
        onSend={handleSend}
      />
    </div>
  );
};
