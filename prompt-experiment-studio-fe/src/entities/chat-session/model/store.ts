import { create } from "zustand";

type ChatSessionState = {
  activeSessionId: number | null;
  setActiveSessionId: (sessionId: number) => void;
  clearActiveSessionId: () => void;
};

export const useChatSessionStore = create<ChatSessionState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  clearActiveSessionId: () => set({ activeSessionId: null }),
}));

export const useActiveSessionId = () =>
  useChatSessionStore((state) => state.activeSessionId);

export const useSetActiveSessionId = () =>
  useChatSessionStore((state) => state.setActiveSessionId);
