// AI Types

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateCodeRequest {
  prompt: string;
  language?: string;
  framework?: "react" | "html" | "vue" | "nextjs";
  context?: string;
}

export interface GenerateCodeResponse {
  code: string;
  explanation?: string;
  files?: GeneratedFile[];
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface IterateCodeRequest {
  code: string;
  instruction: string;
  language?: string;
}

export interface AIError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ZhipuChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ZhipuChatResponse {
  id: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}