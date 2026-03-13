"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatTerminal } from "@/components/chat/ChatTerminal";
import { BuildPreview } from "@/components/chat/BuildPreview";
import {
  createSession,
  getSessionById,
  addMessageToSession,
  updateMessageInSession,
  addFilesToSession,
} from "@/lib/storage/chat";
import type { ChatMessage, ChatAction, GeneratedFile } from "@/types/chat";

export default function BuildPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (sessionId) {
      const session = getSessionById(sessionId);
      return session?.messages || [];
    }
    return [];
  });
  const [files, setFiles] = useState<GeneratedFile[]>(() => {
    if (sessionId) {
      const session = getSessionById(sessionId);
      return session?.files || [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle new session
  const handleNewSession = useCallback(() => {
    const session = createSession();
    setCurrentSessionId(session.id);
    setMessages([]);
    setFiles([]);
    router.push(`/build?session=${session.id}`);
  }, [router]);

  // Handle select session
  const handleSelectSession = useCallback(
    (id: string) => {
      const session = getSessionById(id);
      if (session) {
        setCurrentSessionId(id);
        setMessages(session.messages);
        setFiles(session.files);
        router.push(`/build?session=${id}`);
      }
    },
    [router]
  );

  // Generate code via API
  const generateCode = async (prompt: string) => {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        framework: "react",
        language: "typescript",
      }),
    });

    if (!response.ok) {
      throw new Error("生成失败");
    }

    return response.json();
  };

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentSessionId) {
        const session = createSession(content.slice(0, 50));
        setCurrentSessionId(session.id);
        router.push(`/build?session=${session.id}`);
      }

      const sessionIdToUse = currentSessionId || createSession(content.slice(0, 50)).id;

      // Add user message
      const userMessage = addMessageToSession(sessionIdToUse, {
        role: "user",
        content,
        status: "complete",
      });

      if (userMessage) {
        setMessages((prev) => [...prev, userMessage]);
      }

      // Create assistant message with pending status
      const assistantMessage = addMessageToSession(sessionIdToUse, {
        role: "assistant",
        content: "",
        status: "pending",
        actions: [],
      });

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }

      setIsLoading(true);

      try {
        // Simulate action updates
        const actions: ChatAction[] = [
          {
            id: "action-1",
            type: "think",
            title: "分析需求",
            status: "running",
            timestamp: new Date().toISOString(),
          },
          {
            id: "action-2",
            type: "write",
            title: "生成代码",
            status: "pending",
            timestamp: new Date().toISOString(),
          },
        ];

        updateMessageInSession(sessionIdToUse, assistantMessage!.id, {
          actions,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage!.id ? { ...m, actions } : m
          )
        );

        // Call API
        const result = await generateCode(content);

        // Update actions
        actions[0].status = "success";
        actions[1].status = "success";

        // Add file actions
        if (result.files && result.files.length > 0) {
          result.files.forEach((file: GeneratedFile, index: number) => {
            actions.push({
              id: `action-file-${index}`,
              type: "write",
              title: `创建 ${file.name}`,
              status: "success",
              timestamp: new Date().toISOString(),
            });
          });
        }

        // Update message with result
        updateMessageInSession(sessionIdToUse, assistantMessage!.id, {
          content: `✅ 已生成 ${result.files?.length || 0} 个文件`,
          status: "complete",
          actions,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage!.id
              ? {
                  ...m,
                  content: `✅ 已生成 ${result.files?.length || 0} 个文件`,
                  status: "complete",
                  actions,
                }
              : m
          )
        );

        // Add files to session
        if (result.files && result.files.length > 0) {
          const generatedFiles: GeneratedFile[] = result.files.map(
            (f: GeneratedFile) => ({
              id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name: f.name,
              path: f.path,
              content: f.content,
              language: f.language,
            })
          );

          addFilesToSession(sessionIdToUse, generatedFiles);
          setFiles((prev) => {
            // Merge files
            const existingPaths = new Set(prev.map((f) => f.path));
            const newFiles = [...prev];
            for (const file of generatedFiles) {
              if (existingPaths.has(file.path)) {
                const index = newFiles.findIndex((f) => f.path === file.path);
                if (index !== -1) {
                  newFiles[index] = file;
                }
              } else {
                newFiles.push(file);
              }
            }
            return newFiles;
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "生成失败";

        updateMessageInSession(sessionIdToUse, assistantMessage!.id, {
          content: `❌ ${errorMessage}`,
          status: "error",
          actions: [
            {
              id: "error",
              type: "command",
              title: "错误",
              detail: errorMessage,
              status: "error",
              timestamp: new Date().toISOString(),
            },
          ],
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage!.id
              ? {
                  ...m,
                  content: `❌ ${errorMessage}`,
                  status: "error",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, router]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  }, [messages, handleSendMessage]);

  return (
    <div className="fixed inset-0 flex bg-white">
      {/* Sidebar - Chat History */}
      <ChatSidebar
        currentSessionId={currentSessionId || undefined}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Chat Terminal */}
        <div className="w-1/2 border-r border-gray-200">
          <ChatTerminal
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onRetry={handleRetry}
          />
        </div>

        {/* Preview */}
        <div className="w-1/2">
          <BuildPreview files={files} isGenerating={isLoading} />
        </div>
      </div>
    </div>
  );
}