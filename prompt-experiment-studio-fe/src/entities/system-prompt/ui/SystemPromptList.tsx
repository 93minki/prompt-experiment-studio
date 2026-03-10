import type { SystemPrompt } from "../model/types";
import { SystemPromptItem } from "./SystemPromptItem";

interface SystemPromptListProps {
  systemPrompts: SystemPrompt[];
  onActivate?: (version: number) => void;
  onDelete?: (version: number) => Promise<void> | void;
  activatingVersion?: number | null;
  deletingVersion?: number | null;
}

export const SystemPromptList = ({
  systemPrompts,
  onActivate,
  onDelete,
  activatingVersion = null,
  deletingVersion = null,
}: SystemPromptListProps) => {
  if (systemPrompts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        시스템 프롬프트가 없습니다.
      </p>
    );
  }

  return (
    <div className="max-h-72 space-y-2 overflow-auto pr-1">
      {systemPrompts.map((prompt) => (
        <SystemPromptItem
          key={prompt.id}
          systemPrompt={prompt}
          onActivate={onActivate}
          onDelete={onDelete}
          isActivating={activatingVersion === prompt.version}
          isDeleting={deletingVersion === prompt.version}
        />
      ))}
    </div>
  );
};
