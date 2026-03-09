import { http } from "@/shared/api/http";
import type { CreateSystemPromptPayload, SystemPrompt } from "../model/types";

export const systemPromptApi = {
  async list(chatSessionId: number): Promise<SystemPrompt[]> {
    const { data } = await http.get<SystemPrompt[]>(
      `/chat-sessions/${chatSessionId}/system-prompts`,
    );
    return data;
  },

  async getCurrent(chatSessionId: number): Promise<SystemPrompt> {
    const { data } = await http.get<SystemPrompt>(
      `/chat-sessions/${chatSessionId}/system-prompts/current`,
    );
    return data;
  },

  async create(
    chatSessionId: number,
    payload: CreateSystemPromptPayload,
  ): Promise<SystemPrompt> {
    const { data } = await http.put<SystemPrompt>(
      `/chat-sessions/${chatSessionId}/system-prompts`,
      payload,
    );
    return data;
  },

  async changeCurrent(
    chatSessionId: number,
    version: number,
  ): Promise<SystemPrompt> {
    const { data } = await http.patch<SystemPrompt>(
      `/chat-sessions/${chatSessionId}/system-prompts/${version}/activate`,
    );
    return data;
  },

  async delete(chatSessionId: number, version: number): Promise<void> {
    await http.delete(
      `/chat-sessions/${chatSessionId}/system-prompts/${version}`,
    );
  },
};
