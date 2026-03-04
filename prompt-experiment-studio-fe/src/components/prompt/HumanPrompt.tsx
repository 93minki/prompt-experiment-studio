import { useState, type ChangeEvent } from "react";
import { Textarea } from "../ui/textarea";

const HumanPrompt = () => {
  const [humanMessage, setHumanMessage] = useState("");
  return (
    <Textarea
      placeholder="Human Message 를 작성해주세요"
      value={humanMessage}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
        setHumanMessage(e.target.value)
      }
    />
  );
};

export default HumanPrompt;
