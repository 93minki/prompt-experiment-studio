import type { SystemPrompt } from "../model/types";
import { SystemPromptItem } from "./SystemPromptItem";

interface SystemPromptListProps {
  systemPrompts: SystemPrompt[];
  onSelect?: (version: number) => void;
}

export const SystemPromptList = ({
  systemPrompts,
  onSelect,
}: SystemPromptListProps) => {
  if (systemPrompts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        시스템 프롬프트가 없습니다.
      </p>
    );
  }
  return (
    <>
      {systemPrompts.map((systemPrompt) => (
        <SystemPromptItem
          key={systemPrompt.id}
          systemPrompt={systemPrompt}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};
