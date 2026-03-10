import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "../model/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p>{message.content}</p>
        <p className="mt-1 text-[10px] opacity-70">
          turn {message.turn_index} · v{message.system_prompt_version}
        </p>
      </div>
    </div>
  );
};
