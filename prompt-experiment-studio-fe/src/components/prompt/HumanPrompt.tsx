import { useRef, useState, type ChangeEvent } from "react";
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

interface HumanPromptProps {
  updatePrevQuestion: (message: string) => void;
}

const HumanPrompt = ({ updatePrevQuestion }: HumanPromptProps) => {
  const [humanMessage, setHumanMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const message = humanMessage.trim();
    if (!message) return;
    updatePrevQuestion(message);
    setHumanMessage("");
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
  };

  const updateTextareaLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="flex min-w-0 w-full flex-col gap-1">
      <div>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 w-full items-end gap-2">
        <Textarea
          className="field-sizing-fixed min-h-10 max-h-32 min-w-0 w-full resize-none overflow-x-hidden overflow-y-hidden whitespace-pre-wrap break-all leading-6"
          placeholder="Human Message 를 작성해주세요"
          rows={1}
          value={humanMessage}
          ref={textareaRef}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setHumanMessage(e.target.value);
            updateTextareaLayout();
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          className="h-full w-20 max-h-20 rounded-full"
          onClick={handleSubmit}
        >
          입력
        </Button>
      </div>
    </div>
  );
};

export default HumanPrompt;
