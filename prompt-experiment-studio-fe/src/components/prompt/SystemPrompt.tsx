import { ChevronDownIcon } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const SystemPrompt = () => {
  const [systemMessage, setSystemMessage] = useState("");
  const [open, setOpen] = useState(true);

  const handleOpenChange = () => {
    setOpen(!open);
  };

  return (
    <div className="flex flex-col">
      {open && (
        <div className="flex items-stretch gap-1">
          <Textarea
            placeholder="System Message 를 작성해주세요"
            value={systemMessage}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setSystemMessage(e.target.value)
            }
          />
          <Button className="h-full">저장</Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <ChevronDownIcon
          className={`${open ? "rotate-180" : ""}`}
          onClick={handleOpenChange}
        />
        <span>{open ? "닫기" : "System Prompt 열기"}</span>
      </div>
    </div>
  );
};

export default SystemPrompt;
