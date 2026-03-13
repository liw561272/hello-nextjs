// Chat/Build Session Types

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  files: GeneratedFile[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  status?: "pending" | "streaming" | "complete" | "error";
  actions?: ChatAction[];
}

export interface ChatAction {
  id: string;
  type: "read" | "write" | "edit" | "delete" | "command" | "think";
  title: string;
  detail?: string;
  status: "pending" | "running" | "success" | "error";
  timestamp: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}