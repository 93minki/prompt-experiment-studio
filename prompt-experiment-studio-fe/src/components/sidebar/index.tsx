import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  SidebarMenuItem,
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <div className="flex justify-between">
                <DropdownMenuTrigger asChild className="">
                  <SidebarMenuButton>API Key</SidebarMenuButton>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent side="right">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <Label>GPT</Label>
                    <Input type="text" placeholder="API Key" />
                  </DropdownMenuLabel>
                  <DropdownMenuLabel>
                    <Label>Gemini</Label>
                    <Input type="text" placeholder="API Key" />
                  </DropdownMenuLabel>
                  <DropdownMenuLabel>
                    <Button>Save</Button>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarContainer;
