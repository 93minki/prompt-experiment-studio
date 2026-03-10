import {
  ChatSessionList,
  useActiveSessionId,
  useSetActiveSessionId,
} from "@/entities/chat-session";
import { useChatSessionList } from "@/features/browse-chat-sessions";
import { CreateChatSessionButton } from "@/features/create-chat-session";
import { Button } from "@/shared/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui/sidebar";
import { SettingsModal } from "@/widgets/sidebar/ui/SettingsModal";

export const SidebarWidget = () => {
  const { state } = useSidebar();
  const { sessions, isLoading, errorMessage, refetch } = useChatSessionList();

  const activeSessionId = useActiveSessionId();
  const setActiveSessionId = useSetActiveSessionId();

  const handleCreated = async (createdId: number) => {
    setActiveSessionId(createdId);
    await refetch();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger className="self-end" />
        {state === "expanded" ? (
          <CreateChatSessionButton
            onCreated={(session) => void handleCreated(session.id)}
          />
        ) : (
          <Button>+</Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          )}
          {errorMessage && (
            <Button variant="outline" onClick={() => void refetch()}>
              다시 시도
            </Button>
          )}
          {!isLoading && !errorMessage && (
            <ChatSessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={setActiveSessionId}
            />
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SettingsModal state={state} />
      </SidebarFooter>
    </Sidebar>
  );
};
