import { useActiveSessionId } from "@/entities/chat-session";
import { systemPromptApi } from "@/entities/system-prompt";
import { SystemPromptList } from "@/entities/system-prompt/ui/SystemPromptList";
import { ApiConnection } from "@/features/api-connection";
import { useSystemPromptList } from "@/features/browse-system-prompts";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { SidebarMenu } from "@/shared/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import axios from "axios";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsModalProps {
  state: "expanded" | "collapsed";
}

export const SettingsModal = ({ state }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "api">("prompt");
  const [activatingVersion, setActivatingVersion] = useState<number | null>(
    null,
  );
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [newPromptContent, setNewPromptContent] = useState("");
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);

  const activeSessionId = useActiveSessionId();

  const { systemPrompts, isLoading, refetch, errorMessage } =
    useSystemPromptList({
      sessionId: activeSessionId,
      enabled: open && activeTab === "prompt",
    });

  const handleDeletePrompt = async (version: number) => {
    if (!activeSessionId) return;
    setDeletingVersion(version);
    try {
      await systemPromptApi.delete(activeSessionId, version);
      toast.success("프롬프트를 삭제했습니다.");
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("프롬프트 삭제에 실패했습니다.");
    } finally {
      setDeletingVersion(null);
    }
  };

  const handleActivatePrompt = async (version: number) => {
    if (!activeSessionId) return;
    setActivatingVersion(version);
    try {
      await systemPromptApi.changeCurrent(activeSessionId, version);
      toast.success(`v${version} 시스템 프롬프트가 활성화되었습니다.`);
      await refetch();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as { detail?: string } | undefined)
          ?.detail;
        toast.error(detail ?? "시스템 프롬프트를 활성화하지 못했습니다.");
      } else {
        toast.error("시스템 프롬프트를 활성화하지 못했습니다.");
      }
    } finally {
      setActivatingVersion(null);
    }
  };

  const handleCreatePrompt = async () => {
    if (!activeSessionId) return;

    const content = newPromptContent.trim();
    if (!content) {
      toast.error("시스템 프롬프트 내용을 입력해주세요.");
      return;
    }

    setIsCreatingPrompt(true);
    try {
      await systemPromptApi.create(activeSessionId, { content });
      toast.success("시스템 프롬프트를 추가했습니다.");
      setNewPromptContent("");
      await refetch();
    } catch (error) {
      console.error("시스템 프롬프트 추가 실패", error);
      toast.error("시스템 프롬프트를 추가하지 못했습니다.");
    } finally {
      setIsCreatingPrompt(false);
    }
  };

  return (
    <SidebarMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={state === "expanded" ? "self-end" : "self-center"}
        >
          <Settings />
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              System Prompt, Human Prompt, Assistant Prompt 를 설정할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "prompt" | "api")}
          >
            <TabsList>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

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
                    onClick={() => void handleCreatePrompt()}
                    disabled={
                      !activeSessionId ||
                      !newPromptContent.trim() ||
                      isCreatingPrompt
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
                  onActivate={handleActivatePrompt}
                  onDelete={handleDeletePrompt}
                  activatingVersion={activatingVersion}
                  deletingVersion={deletingVersion}
                />
              )}
            </TabsContent>

            <ApiConnection />
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">닫기</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  );
};
