"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  getSessions,
  deleteSession,
  subscribeToSessions,
} from "@/lib/storage/chat";
import type { ChatSession } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  currentSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function ChatSidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Initialize with empty array (SSR-safe), will be updated after hydration
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Subscribe to session changes
  useEffect(() => {
    // Load initial data
    setSessions(getSessions());

    const unsubscribe = subscribeToSessions(() => {
      setSessions(getSessions());
    });

    return unsubscribe;
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定要删除这个对话吗？")) {
      deleteSession(id);
      setSessions(getSessions());
      if (currentSessionId === id) {
        onNewSession();
      }
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div
      className={cn(
        "h-full bg-white flex flex-col transition-all duration-300 border-r border-gray-200",
        isCollapsed ? "w-14" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        {!isCollapsed && (
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            对话历史
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className={cn("p-2", isCollapsed && "px-1")}>
        <button
          onClick={onNewSession}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-gray-100 hover:bg-gray-200 text-gray-700"
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>新对话</span>}
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-auto px-2 pb-2">
        {sessions.length === 0 ? (
          !isCollapsed && (
            <div className="text-gray-400 text-xs text-center py-8">
              还没有对话记录
            </div>
          )
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors group cursor-pointer",
                  currentSessionId === session.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{session.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatTime(session.updatedAt)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {session.messages.length} 条消息
                      </span>
                    </div>
                  </div>
                )}
                {!isCollapsed && (
                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            返回首页
          </Link>
        </div>
      )}
    </div>
  );
}