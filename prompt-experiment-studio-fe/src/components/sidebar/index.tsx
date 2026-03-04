import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

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
          <Button className="text-sm">History1</Button>
          <Button className="text-sm">History2</Button>
          <Button className="text-sm">History3</Button>
          <Button className="text-sm">History4</Button>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default SidebarContainer;
