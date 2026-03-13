// Chat Sessions Storage - LocalStorage based

import type { ChatSession, ChatMessage, GeneratedFile } from "@/types/chat";

const STORAGE_KEY = "ai-builder-chat-sessions";

// Cached data for useSyncExternalStore
let cachedSessions: ChatSession[] = [];
let isInitialized = false;

function loadFromStorage(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Initialize on first access
function initIfNeeded(): void {
  if (!isInitialized && typeof window !== "undefined") {
    cachedSessions = loadFromStorage();
    isInitialized = true;
  }
}

export function getSessions(): ChatSession[] {
  initIfNeeded();
  return cachedSessions;
}

export function getSessionsSnapshot(): ChatSession[] {
  // Return the same cached reference for React to compare
  return cachedSessions;
}

export function getSessionById(id: string): ChatSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function createSession(title: string = "新对话"): ChatSession {
  const sessions = getSessions();
  const newSession: ChatSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    files: [],
  };
  sessions.unshift(newSession);
  saveSessions(sessions);
  return newSession;
}

export function updateSession(
  id: string,
  updates: Partial<Omit<ChatSession, "id" | "createdAt">>
): ChatSession | null {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index] = {
    ...sessions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveSessions(sessions);
  return sessions[index];
}

export function deleteSession(id: string): void {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  saveSessions(filtered);
}

export function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, "id" | "timestamp">
): ChatMessage | null {
  const session = getSessionById(sessionId);
  if (!session) return null;

  const newMessage: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  const updatedMessages = [...session.messages, newMessage];
  updateSession(sessionId, { messages: updatedMessages });

  // Update session title based on first user message
  if (message.role === "user" && session.messages.length === 0) {
    const title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
    updateSession(sessionId, { title });
  }

  return newMessage;
}

export function updateMessageInSession(
  sessionId: string,
  messageId: string,
  updates: Partial<ChatMessage>
): void {
  const session = getSessionById(sessionId);
  if (!session) return;

  const updatedMessages = session.messages.map((m) =>
    m.id === messageId ? { ...m, ...updates } : m
  );
  updateSession(sessionId, { messages: updatedMessages });
}

export function addFilesToSession(
  sessionId: string,
  files: GeneratedFile[]
): void {
  const session = getSessionById(sessionId);
  if (!session) return;

  // Merge files, update existing ones with same path
  const existingPaths = new Set(session.files.map((f) => f.path));
  const newFiles = [...session.files];

  for (const file of files) {
    if (existingPaths.has(file.path)) {
      const index = newFiles.findIndex((f) => f.path === file.path);
      if (index !== -1) {
        newFiles[index] = file;
      }
    } else {
      newFiles.push(file);
    }
  }

  updateSession(sessionId, { files: newFiles });
}

// Subscribe to changes (for useSyncExternalStore)
let listeners: Array<() => void> = [];

export function subscribeToSessions(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

// Notify listeners when data changes
function notifyListeners(): void {
  listeners.forEach((l) => l());
}

// Helper to save and notify
function saveSessions(sessions: ChatSession[]): void {
  cachedSessions = sessions;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  notifyListeners();
}