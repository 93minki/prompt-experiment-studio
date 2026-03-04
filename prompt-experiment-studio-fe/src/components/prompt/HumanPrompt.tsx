import { useState, type ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface HumanPromptProps {
  updatePrevQuestion: (message: string) => void;
}

const HumanPrompt = ({ updatePrevQuestion }: HumanPromptProps) => {
  const [humanMessage, setHumanMessage] = useState("");

  const handleSubmit = () => {
    updatePrevQuestion(humanMessage);
    setHumanMessage("");
  };

  return (
    <div className="flex gap-1">
      <Textarea
        placeholder="Human Message 를 작성해주세요"
        value={humanMessage}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setHumanMessage(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button className="h-full" onClick={handleSubmit}>
        입력
      </Button>
    </div>
  );
};

export default HumanPrompt;
