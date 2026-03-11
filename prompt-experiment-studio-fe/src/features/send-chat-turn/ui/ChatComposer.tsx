import type { CreateChatTurnPayload } from "@/entities/message";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { useRef, useState } from "react";

interface ChatComposerProps {
  disabled?: boolean;
  isSending?: boolean;
  onSend: (payload: CreateChatTurnPayload) => Promise<boolean>;
}

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export const ChatComposer = ({
  disabled = false,
  isSending = false,
  onSend,
}: ChatComposerProps) => {
  const [humanMessage, setHumanMessage] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateTextareaLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const resetTextareaLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
  };

  const handleSubmit = async () => {
    if (disabled || isSending) return;

    const isSent = await onSend({
      userMessage: humanMessage,
      model,
    });

    if (!isSent) return;

    setHumanMessage("");
    resetTextareaLayout();
  };

  return (
    <div className="flex min-w-0 w-full flex-col gap-2">
      <Select
        value={model}
        onValueChange={setModel}
        disabled={disabled || isSending}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="relative flex min-w-0 w-full items-end gap-2 border rounded-md p-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-transparent">
        <Textarea
          className="border-none field-sizing-fixed min-h-10 max-h-32 min-w-0 w-[97%] resize-none overflow-x-hidden overflow-y-hidden whitespace-pre-wrap break-all leading-6 focus-visible:outline-none focus-visible:ring-0"
          placeholder="메시지를 입력하세요"
          rows={1}
          value={humanMessage}
          ref={textareaRef}
          disabled={disabled || isSending}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setHumanMessage(e.target.value);
            updateTextareaLayout();
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <Button
          className="absolute right-2 bottom-1 w-10 h-10 rounded-full"
          onClick={() => void handleSubmit()}
          disabled={disabled || isSending || !humanMessage.trim()}
        >
          {isSending ? "전송 중..." : "입력"}
        </Button>
      </div>
    </div>
  );
};
