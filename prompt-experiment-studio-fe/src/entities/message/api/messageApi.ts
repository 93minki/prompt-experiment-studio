import { http } from "@/shared/api/http";
import type {
  ChatMessage,
  ChatTurn,
  CreateChatTurnPayload,
  MessageSummary,
} from "../model/types";

interface ListMessageOptions {
  includeInContext?: boolean;
}

export const messageApi = {
  async list(
    chatSessionId: number,
    options: ListMessageOptions = {},
  ): Promise<ChatMessage[]> {
    const params =
      options.includeInContext === undefined
        ? undefined
        : { include_in_context: options.includeInContext };

    const { data } = await http.get<ChatMessage[]>(
      `/chat-sessions/${chatSessionId}/messages`,
      { params },
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

  async updateTurnContext(
    chatSessionId: number,
    turnIndex: number,
    includeInContext: boolean,
  ): Promise<ChatMessage[]> {
    const { data } = await http.patch<ChatMessage[]>(
      `/chat-sessions/${chatSessionId}/turns/${turnIndex}/context`,
      { include_in_context: includeInContext },
    );
    return data;
  },

  async getSummary(chatSessionId: number): Promise<MessageSummary> {
    const { data } = await http.get<MessageSummary>(
      `/chat-sessions/${chatSessionId}/messages/summary`,
    );
    return data;
  },

  async regenerateSummary(
    chatSessionId: number,
    model: string,
  ): Promise<MessageSummary> {
    const { data } = await http.post<MessageSummary>(
      `/chat-sessions/${chatSessionId}/messages/summary/regenerate`,
      { model },
    );
    return data;
  },
};
