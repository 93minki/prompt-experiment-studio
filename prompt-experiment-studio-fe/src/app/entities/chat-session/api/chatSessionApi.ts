import { http } from "@/shared/api/http";
import axios, { AxiosError } from "axios";
import type {
  ChatSession,
  CreateChatSessionPayload,
  UpdateChatSessionTitlePayload,
} from "../model/types";

export const getListChatSessions = async () => {
  try {
    const response = await axios.get<ChatSession[]>(
      "http://localhost:8000/chat-sessions",
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const message =
      axiosError.response?.data?.detail ??
      axiosError.message ??
      "세션 목록을 불러오지 못했습니다.";

    throw new Error(message);
  }
};

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
