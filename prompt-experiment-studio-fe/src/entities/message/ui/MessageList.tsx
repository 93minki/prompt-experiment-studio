import type { ChatMessage } from "../model/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 대화가 없습니다. 첫 메시지를 보내세요.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};
