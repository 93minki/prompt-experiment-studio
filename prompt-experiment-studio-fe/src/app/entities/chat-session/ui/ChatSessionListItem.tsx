import { SidebarMenuItem } from "@/shared/ui/sidebar";
import type { ChatSession } from "../model/types";

interface ChatSessionListItemProps {
  session: ChatSession;
  isActive?: boolean;
  onSelect?: (sessionId: number) => void;
}

export const ChatSessionListItem = ({
  session,
  isActive,
  onSelect,
}: ChatSessionListItemProps) => {
  return (
    <SidebarMenuItem
      onClick={() => onSelect?.(session.id)}
      className={`${isActive ? "bg-accent text-accent-foreground" : ""}`}
    >
      {session.title}
    </SidebarMenuItem>
  );
};
