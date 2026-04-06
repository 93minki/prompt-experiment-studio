import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { ChatMessage } from "../model/types";
import { MarkdownParser } from "./MarkdownParser";

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
        {message.attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="flex w-40 flex-col gap-2">
                <div className="overflow-hidden rounded-md border bg-background">
                  <img
                    src={attachment.data_url}
                    alt={attachment.name}
                    className="h-28 w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="truncate text-xs opacity-80">{attachment.name}</p>
              </div>
            ))}
          </div>
        )}

        <MarkdownParser content={message.content} />
        {/* <p className="mt-1 text-[10px] opacity-70">
          turn {message.turn_index} · v{message.system_prompt_version}
        </p> */}

        {isContextEditMode && showContextToggle && (
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              className="text-black"
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
