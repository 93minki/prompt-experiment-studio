import { Settings } from "lucide-react";
import SystemPrompt from "../prompt/SystemPrompt";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const SidebarContainer = () => {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger className="self-end" />
        {state === "expanded" ? (
          <Button>New Session</Button>
        ) : (
          <Button>+</Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2">
          <SidebarMenuButton>Hello</SidebarMenuButton>
          <SidebarMenuButton>Hello</SidebarMenuButton>
          <SidebarMenuButton>Hello</SidebarMenuButton>
          <SidebarMenuButton>Hello</SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
                <TabsContent value="api" className="flex flex-col gap-4 pt-4">
                  <Label htmlFor="gpt" className="flex flex-col gap-1">
                    <span className="text-sm font-medium self-start">GPT</span>
                    <Input type="text" placeholder="API Key" />
                  </Label>
                  <Label htmlFor="gemini" className="flex flex-col gap-1">
                    <span className="text-sm font-medium self-start">
                      Gemini
                    </span>
                    <Input type="text" placeholder="API Key" />
                  </Label>
                  <Button>저장</Button>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">닫기</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarContainer;
