import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SettingsModalWidget } from "@/features/settings-modal/ui/SettingsModalWidget";

export const SidebarWidget = () => {
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
        <SettingsModalWidget state={state} />
      </SidebarFooter>
    </Sidebar>
  );
};
