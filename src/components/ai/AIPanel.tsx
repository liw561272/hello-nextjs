"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, Copy, Check, Lightbulb, Send } from "lucide-react";
import { generateCode, iterateCode } from "@/lib/ai/zhipu";
import type { CodeFile } from "@/types/project";
import { generateId } from "@/lib/utils";

interface AIPanelProps {
  onClose: () => void;
  onGenerate: (files: CodeFile[]) => void;
  currentCode?: string;
}

export function AIPanel({ onClose, onGenerate, currentCode }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "iterate">("generate");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    try {
      let result;

      if (mode === "iterate" && currentCode) {
        result = await iterateCode({
          code: currentCode,
          instruction: prompt.trim(),
          language: "typescript",
        });
      } else {
        result = await generateCode({
          prompt: prompt.trim(),
          framework: "react",
          language: "typescript",
        });
      }

      setGeneratedCode(result.code);

      // Convert to CodeFile format
      const files: CodeFile[] = (result.files || []).map((f) => ({
        id: generateId(),
        name: f.name,
        path: f.path,
        content: f.content,
        language: f.language,
      }));

      if (files.length > 0) {
        onGenerate(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-zinc-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <span className="font-medium text-zinc-900 text-sm">AI 助手</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Mode selection */}
        <div className="flex gap-1 mb-4 p-0.5 bg-zinc-100 rounded-lg">
          <button
            onClick={() => setMode("generate")}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              mode === "generate"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            生成
          </button>
          <button
            onClick={() => setMode("iterate")}
            disabled={!currentCode}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              mode === "iterate"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            修改
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "generate"
                  ? "描述你想要的功能..."
                  : "描述修改需求..."
              }
              rows={4}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-sm placeholder-zinc-400 focus:outline-none focus:border-zinc-400 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                生成
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Generated code preview */}
        {generatedCode && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-600">生成结果</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1 rounded hover:bg-zinc-100"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    复制
                  </>
                )}
              </button>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3 overflow-auto max-h-48 border border-zinc-200">
              <pre className="text-[10px] text-zinc-600 whitespace-pre-wrap font-mono leading-relaxed">
                {generatedCode.slice(0, 800)}
                {generatedCode.length > 800 && "..."}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-600">提示</span>
          </div>
          <ul className="text-[11px] text-zinc-500 space-y-1.5">
            <li>• 详细描述需求获得更准确结果</li>
            <li>• 可指定框架如 React、Tailwind</li>
            <li>• 生成后可在编辑器中修改</li>
          </ul>
        </div>
      </div>
    </div>
  );
}