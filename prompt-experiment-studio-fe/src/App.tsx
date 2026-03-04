import HumanPrompt from "./components/prompt/HumanPrompt";
import SystemPrompt from "./components/prompt/SystemPrompt";

const App = () => {
  return (
    <main className="flex w-full">
      <div className="flex flex-col gap-2 w-full">
        <SystemPrompt />
        <HumanPrompt />
      </div>
    </main>
  );
};

export default App;
