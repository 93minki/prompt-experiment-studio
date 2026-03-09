import { useActiveSessionId } from "@/app/entities/chat-session";
import { SystemPromptList } from "@/app/entities/system-prompt/ui/SystemPromptList";
import ApiConnection from "@/components/sidebar/ApiConnection";
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
import { Settings } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  state: "expanded" | "collapsed";
}

export const SettingsModal = ({ state }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "api">("prompt");

  const activeSessionId = useActiveSessionId();

  const { systemPrompts, isLoading, refetch, errorMessage } =
    useSystemPromptList({
      sessionId: activeSessionId,
      enabled: open && activeTab === "prompt",
    });
  const { changeCurrentSystemPrompt } = useSystemPromptList({
    sessionId: activeSessionId,
    enabled: open && activeTab === "prompt",
  });
  return (
    <SidebarMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={`${state === "expanded" ? "self-end" : "self-center"}`}
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
            <TabsContent value="prompt">
              {!activeSessionId && (
                <p className="text-sm text-muted-foreground">
                  먼저 세션을 선택해주세요.
                </p>
              )}
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
                  onSelect={changeCurrentSystemPrompt}
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
