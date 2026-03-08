import SystemPrompt from "@/components/prompt/SystemPrompt";
import ApiConnection from "@/components/sidebar/ApiConnection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenu } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

interface SettingsModalWidgetProps {
  state: "expanded" | "collapsed";
}

export const SettingsModalWidget = ({ state }: SettingsModalWidgetProps) => {
  return (
    <SidebarMenu>
      <Dialog>
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
          <Tabs>
            <TabsList>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            <TabsContent value="prompt">
              <SystemPrompt />
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
