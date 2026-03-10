import { http } from "@/shared/api/http";
import type {
  ChatMessage,
  ChatTurn,
  CreateChatTurnPayload,
} from "../model/types";

export const messageApi = {
  async list(chatSessionId: number): Promise<ChatMessage[]> {
    const { data } = await http.get<ChatMessage[]>(
      `/chat-sessions/${chatSessionId}/messages`,
    );
    return data;
  },
  async createTurn(
    chatSessionId: number,
    payload: CreateChatTurnPayload,
  ): Promise<ChatTurn> {
    const { data } = await http.post<ChatTurn>(
      `/chat-sessions/${chatSessionId}/messages/turn`,
      {
        user_message: payload.userMessage,
        model: payload.model,
      },
    );
    return data;
  },
};
