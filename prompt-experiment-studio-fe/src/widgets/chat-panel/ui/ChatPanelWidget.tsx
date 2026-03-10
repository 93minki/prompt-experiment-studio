import { useActiveSessionId } from "@/entities/chat-session";
import { MessageList, type CreateChatTurnPayload } from "@/entities/message";
import { useChatMessageList } from "@/features/browse-chat-messages";
import { ChatComposer, useSendChatTurn } from "@/features/send-chat-turn";
import { Button } from "@/shared/ui/button";
import { useEffect, useRef } from "react";

export const ChatPanelWidget = () => {
  const activeSessionId = useActiveSessionId();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-3 w-full min-h-0 flex-1 p-4">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 border rounded-md p-3 overflow-y-auto"
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">대화를 불러오는 중...</p>
        ) : (
          <MessageList messages={messages} />
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

      <ChatComposer
        disabled={isLoading || isSending}
        isSending={isSending}
        onSend={handleSend}
      />
    </div>
  );
};
