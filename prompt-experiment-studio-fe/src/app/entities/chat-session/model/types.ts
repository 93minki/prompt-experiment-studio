export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatSessionPayload {
  title?: string;
  systemMessage?: string;
}

export interface UpdateChatSessionTitlePayload {
  title: string;
}
