import { useState } from "react";
import HumanPrompt from "./components/prompt/HumanPrompt";
import SystemPrompt from "./components/prompt/SystemPrompt";

const App = () => {
  const [prevQuestion, setPrevQuestion] = useState<string[]>([]);

  const updatePrevQuestion = (message: string) => {
    setPrevQuestion([...prevQuestion, message]);
  };

  return (
    <main className="flex w-full">
      <div className="flex flex-col gap-2 w-full py-2">
        <SystemPrompt />
        <div className="flex-1 border border-black rounded-md p-2">
          {prevQuestion.map((question, index) => (
            <div key={index}>{question}</div>
          ))}
        </div>
        <HumanPrompt updatePrevQuestion={updatePrevQuestion} />
      </div>
    </main>
  );
};

export default App;
