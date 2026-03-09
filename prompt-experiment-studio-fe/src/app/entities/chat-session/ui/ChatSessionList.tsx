import type { ChatSession } from "../model/types";
import { ChatSessionListItem } from "./ChatSessionListItem";

interface ChatSessionListProps {
  sessions: ChatSession[];
  activeSessionId?: number | null;
  onSelect?: (sessionId: number) => void;
}

export const ChatSessionList = ({
  sessions,
  activeSessionId,
  onSelect,
}: ChatSessionListProps) => {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">세션이 없습니다.</p>;
  }

  return (
    <>
      {sessions.map((session) => (
        <ChatSessionListItem
          key={session.id}
          session={session}
          isActive={session.id === activeSessionId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};
