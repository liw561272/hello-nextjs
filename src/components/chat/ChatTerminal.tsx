"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Check,
  X,
  FileCode,
  FileEdit,
  FilePlus,
  Trash2,
  Terminal,
  Sparkles,
  ChevronRight,
  Copy,
  RotateCcw,
} from "lucide-react";
import type { ChatMessage, ChatAction } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatTerminalProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onRetry?: () => void;
}

// Action icon mapping
function getActionIcon(type: ChatAction["type"]) {
  switch (type) {
    case "read":
      return <FileCode className="w-3.5 h-3.5" />;
    case "write":
      return <FilePlus className="w-3.5 h-3.5" />;
    case "edit":
      return <FileEdit className="w-3.5 h-3.5" />;
    case "delete":
      return <Trash2 className="w-3.5 h-3.5" />;
    case "command":
      return <Terminal className="w-3.5 h-3.5" />;
    case "think":
      return <Sparkles className="w-3.5 h-3.5" />;
    default:
      return <ChevronRight className="w-3.5 h-3.5" />;
  }
}

// Action status color
function getActionStatusColor(status: ChatAction["status"]) {
  switch (status) {
    case "pending":
      return "text-gray-400";
    case "running":
      return "text-yellow-500";
    case "success":
      return "text-emerald-500";
    case "error":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

// Message component
function MessageItem({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = message.status === "error";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group py-3 px-4 border-b border-gray-100",
        isUser ? "bg-gray-50" : "bg-transparent"
      )}
    >
      {/* Role indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-5 h-5 rounded flex items-center justify-center text-xs font-medium",
            isUser
              ? "bg-gray-200 text-gray-600"
              : "bg-emerald-100 text-emerald-600"
          )}
        >
          {isUser ? "U" : "AI"}
        </div>
        <span className="text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {message.status === "streaming" && (
          <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
        )}
        {isError && <X className="w-3 h-3 text-red-500" />}
      </div>

      {/* Content */}
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
        {message.content}
      </div>

      {/* Actions */}
      {message.actions && message.actions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {message.actions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-2 text-xs font-mono"
            >
              <span className={getActionStatusColor(action.status)}>
                {getActionIcon(action.type)}
              </span>
              <span className="text-gray-500">{action.title}</span>
              {action.detail && (
                <span className="text-gray-400 truncate max-w-[200px]">
                  {action.detail}
                </span>
              )}
              {action.status === "running" && (
                <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
              )}
              {action.status === "success" && (
                <Check className="w-3 h-3 text-emerald-500" />
              )}
              {action.status === "error" && (
                <X className="w-3 h-3 text-red-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Copy button */}
      {!isUser && message.status === "complete" && (
        <button
          onClick={handleCopy}
          className="mt-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              复制
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function ChatTerminal({
  messages,
  isLoading,
  onSendMessage,
  onRetry,
}: ChatTerminalProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-700">构建终端</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              处理中...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 px-8">
            <Sparkles className="w-10 h-10 mb-4 text-gray-300" />
            <p className="text-sm text-center mb-2">
              描述你想要构建的网站
            </p>
            <p className="text-xs text-gray-400 text-center">
              例如：创建一个现代化的落地页，包含英雄区域、功能介绍和定价方案
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        {onRetry && !isLoading && messages.some((m) => m.status === "error") && (
          <button
            onClick={onRetry}
            className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重试
          </button>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的需求..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none max-h-32 disabled:opacity-50 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}