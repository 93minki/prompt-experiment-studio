import { SystemPromptList } from "@/entities/system-prompt/ui/SystemPromptList";
import { Button } from "@/shared/ui/button";
import { TabsContent } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { useSystemPromptControl } from "../model/useSystemPromptControl";

interface SystemPromptControlTabProps {
  enabled: boolean;
}

export const SystemPromptControlTab = ({
  enabled,
}: SystemPromptControlTabProps) => {
  const {
    activeSessionId,
    systemPrompts,
    isLoading,
    errorMessage,
    refetch,
    newPromptContent,
    setNewPromptContent,
    isCreatingPrompt,
    activatingVersion,
    deletingVersion,
    createPrompt,
    activatePrompt,
    deletePrompt,
  } = useSystemPromptControl({ enabled });

  return (
    <TabsContent value="prompt" className="pt-4">
      {!activeSessionId && (
        <p className="mb-3 text-sm text-muted-foreground">
          먼저 세션을 선택해주세요.
        </p>
      )}

      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium">새 시스템 프롬프트</p>
        <Textarea
          value={newPromptContent}
          onChange={(e) => setNewPromptContent(e.target.value)}
          placeholder="새 시스템 프롬프트를 입력하세요."
          rows={4}
          disabled={!activeSessionId || isCreatingPrompt}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            현재 {newPromptContent.trim().length}자
          </p>
          <Button
            onClick={() => void createPrompt()}
            disabled={
              !activeSessionId || !newPromptContent.trim() || isCreatingPrompt
            }
          >
            {isCreatingPrompt ? "추가 중..." : "프롬프트 추가"}
          </Button>
        </div>
      </div>

      {activeSessionId && isLoading && (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      )}

      {activeSessionId && errorMessage && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-red-500">{errorMessage}</p>
          <Button variant="outline" onClick={() => void refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {activeSessionId && !isLoading && !errorMessage && (
        <SystemPromptList
          systemPrompts={systemPrompts}
          onActivate={activatePrompt}
          onDelete={deletePrompt}
          activatingVersion={activatingVersion}
          deletingVersion={deletingVersion}
        />
      )}
    </TabsContent>
  );
};
