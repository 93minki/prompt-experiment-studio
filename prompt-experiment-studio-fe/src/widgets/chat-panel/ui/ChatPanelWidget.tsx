import HumanPrompt from "@/components/prompt/HumanPrompt";
import { useEffect, useRef, useState } from "react";

export const ChatPanelWidget = () => {
  const [prevQuestion, setPrevQuestion] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updatePrevQuestion = (message: string) => {
    setPrevQuestion([...prevQuestion, message]);
  };

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [prevQuestion.length]);

  return (
    <div className="flex flex-col gap-2 w-full py-2 min-h-0 flex-1 p-4">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 border border-black rounded-md p-2 overflow-y-auto max-h-full"
      >
        {prevQuestion.map((question, index) => (
          <div key={index}>{question}</div>
        ))}
      </div>
      <HumanPrompt updatePrevQuestion={updatePrevQuestion} />
    </div>
  );
};
