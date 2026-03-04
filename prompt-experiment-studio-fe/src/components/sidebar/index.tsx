import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "../ui/sidebar";

const SidebarContainer = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2">
          <Button
            className="text-sm font-medium border p-2"
            onClick={() => {
              console.log("Click History");
            }}
          >
            History
          </Button>
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
