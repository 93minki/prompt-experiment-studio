export interface SystemPrompt {
  id: number;
  chat_session_id: number;
  content: string;
  version: number;
  isCurrent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSystemPromptPayload {
  content?: string;
}
