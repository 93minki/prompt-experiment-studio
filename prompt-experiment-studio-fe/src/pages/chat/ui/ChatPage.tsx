import { ChatPanelWidget } from "@/widgets/chat-panel";
import { SidebarWidget } from "@/widgets/sidebar";

export const ChatPage = () => {
  return (
    <div className="flex w-full h-screen">
      <SidebarWidget />
      <ChatPanelWidget />
    </div>
  );
};
