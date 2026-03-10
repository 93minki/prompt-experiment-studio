import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { ChatMessage } from "../model/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isContextEditMode?: boolean;
  isUpdatingContext?: boolean;
  showContextToggle?: boolean;
  onToggleContext?: (message: ChatMessage) => Promise<void> | void;
}

export const MessageBubble = ({
  message,
  isContextEditMode = false,
  isUpdatingContext = false,
  showContextToggle = true,
  onToggleContext,
}: MessageBubbleProps) => {
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
          !message.include_in_context && "opacity-60 border border-dashed",
        )}
      >
        <p>{message.content}</p>
        <p className="mt-1 text-[10px] opacity-70">
          turn {message.turn_index} · v{message.system_prompt_version}
        </p>

        {isContextEditMode && showContextToggle && (
          <div className="mt-2 flex items-center justify-end gap-2">
            {!message.include_in_context && (
              <span className="text-[10px] opacity-70">컨텍스트 제외됨</span>
            )}
            <Button
              type="button"
              size="sm"
              variant={message.include_in_context ? "outline" : "secondary"}
              disabled={isUpdatingContext}
              onClick={() => void onToggleContext?.(message)}
            >
              {isUpdatingContext
                ? "변경 중..."
                : message.include_in_context
                  ? "컨텍스트에서 제외"
                  : "컨텍스트에 포함"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
