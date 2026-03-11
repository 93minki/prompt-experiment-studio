import type { ChatMessage } from "../model/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isContextEditMode?: boolean;
  updatingTurnIndex?: number | null;
  onToggleContext?: (message: ChatMessage) => Promise<void> | void;
}

export const MessageList = ({
  messages,
  isContextEditMode = false,
  updatingTurnIndex = null,
  onToggleContext,
}: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 대화가 없습니다. 첫 메시지를 보내세요.
      </p>
    );
  }

  const toggledTurns = new Set<number>();

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const showContextToggle = !toggledTurns.has(message.turn_index);
        if (showContextToggle) {
          toggledTurns.add(message.turn_index);
        }

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isContextEditMode={isContextEditMode}
            isUpdatingContext={updatingTurnIndex === message.turn_index}
            showContextToggle={showContextToggle}
            onToggleContext={onToggleContext}
          />
        );
      })}
    </div>
  );
};
