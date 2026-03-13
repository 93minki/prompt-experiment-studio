import { ApiConnection } from "@/features/api-connection";
import { SystemPromptControlTab } from "@/features/system-prompt-control";
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
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Settings } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  state: "expanded" | "collapsed";
}

export const SettingsModal = ({ state }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "api">("prompt");

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

            <SystemPromptControlTab enabled={open && activeTab === "prompt"} />
            <ApiConnection enabled={open && activeTab === "api"} />
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
