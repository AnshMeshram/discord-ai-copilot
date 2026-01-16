// Shared TypeScript types

export interface SystemSettings {
  system_instructions: {
    text: string;
  };
  ai_config: {
    model: string;
    temperature: number;
  };
}

export interface AllowedChannel {
  id: string;
  channel_id: string;
  channel_name: string | null;
  added_at: string;
}

export interface ConversationSummary {
  id: string;
  channel_id: string;
  summary: string;
  message_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  message_id: string;
  user_id: string;
  username: string | null;
  content: string;
  created_at: string;
}
