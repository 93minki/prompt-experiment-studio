export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  chat_session_id: number;
  role: MessageRole;
  content: string;
  turn_index: number;
  system_prompt_version: number;
  created_at: string;
}

export interface MessageSummary {
  id: number;
  chat_session_id: number;
  summary_text: string;
  summary_until_message_id: number | null;
  based_on_system_prompt_version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChatTurnPayload {
  userMessage: string;
  model: string;
}

export interface ChatTurn {
  user: ChatMessage;
  assistant: ChatMessage;
  summary: MessageSummary;
}
