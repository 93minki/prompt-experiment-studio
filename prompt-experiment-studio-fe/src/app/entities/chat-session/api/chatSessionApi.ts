import { http } from "@/shared/api/http";
import type {
  ChatSession,
  CreateChatSessionPayload,
  UpdateChatSessionTitlePayload,
} from "../model/types";

export const chatSessionApi = {
  async list(): Promise<ChatSession[]> {
    const { data } = await http.get<ChatSession[]>("/chat-sessions/");
    return data;
  },

  async create(payload: CreateChatSessionPayload): Promise<ChatSession> {
    const { data } = await http.post<ChatSession>("/chat-sessions/", {
      title: payload.title,
      system_message: payload.systemMessage,
    });
    return data;
  },

  async updateTitle(
    id: number,
    payload: UpdateChatSessionTitlePayload,
  ): Promise<ChatSession> {
    const { data } = await http.patch<ChatSession>(
      `/chat-sessions/${id}/title`,
      payload,
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/chat-sessions/${id}`);
  },
};
