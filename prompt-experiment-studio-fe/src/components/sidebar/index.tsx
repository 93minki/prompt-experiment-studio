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
} from "@/shared/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Settings } from "lucide-react";
import { ApiConnection } from "../../features/api-connection/ui/ApiConnection";
import SystemPrompt from "../prompt/SystemPrompt";

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
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarContainer;
