"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Sparkles } from "lucide-react";
import { createProject, createDefaultFiles } from "@/lib/storage/projects";

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectDialog({ isOpen, onClose }: NewProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"blank" | "ai">("blank");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const project = createProject({
        name: name.trim(),
        description: description.trim(),
        files: createDefaultFiles(name.trim()),
      });

      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">新建项目</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Mode selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("blank")}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === "blank"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              空白项目
            </button>
            <button
              type="button"
              onClick={() => setMode("ai")}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === "ai"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              AI 生成
            </button>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              项目名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的网站项目"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              项目描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你的项目..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* AI mode: additional input */}
          {mode === "ai" && (
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                创建项目后，在编辑器中使用 AI 助手描述你想要的功能，AI 将为你生成代码。
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                "创建项目"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}