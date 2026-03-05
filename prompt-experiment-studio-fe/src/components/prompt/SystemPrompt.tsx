import { useState, type ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const SystemPrompt = () => {
  const [systemMessage, setSystemMessage] = useState("");

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        placeholder="System Message 를 작성해주세요"
        className="min-h-96 max-h-128 resize-none"
        value={systemMessage}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setSystemMessage(e.target.value)
        }
      />
      <Button className="">저장</Button>
    </div>
  );
};

export default SystemPrompt;
