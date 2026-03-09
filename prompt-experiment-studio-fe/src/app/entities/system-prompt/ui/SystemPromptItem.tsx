import type { SystemPrompt } from "../model/types";

interface SystemPromptItemProps {
  systemPrompt: SystemPrompt;
  onSelect?: (version: number) => void;
}

export const SystemPromptItem = ({
  systemPrompt,
  onSelect,
}: SystemPromptItemProps) => {
  return (
    <div
      className={`${systemPrompt.isCurrent ? "bg-accent text-accent-foreground" : ""}`}
      onClick={() => onSelect?.(systemPrompt.version)}
    >
      {systemPrompt.content}
    </div>
  );
};
