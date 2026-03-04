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
    <div className="">
      {open && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="System Message 를 작성해주세요"
            value={systemMessage}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setSystemMessage(e.target.value)
            }
          />
          <Button>저장하기</Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <ChevronDownIcon
          className={`${open ? "rotate-180" : ""}`}
          onClick={handleOpenChange}
        />
        <span>{open ? "Hide" : "Show"}</span>
      </div>
    </div>
  );
};

export default SystemPrompt;
