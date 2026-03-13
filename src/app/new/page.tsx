"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Send, FileCode, Wand2, Layout, PenTool } from "lucide-react";
import Link from "next/link";
import { createProject, createDefaultFiles } from "@/lib/storage/projects";

const templates = [
  {
    id: "blank",
    name: "空白项目",
    description: "从零开始",
    icon: FileCode,
  },
  {
    id: "ai",
    name: "AI 生成",
    description: "AI 助手",
    icon: Wand2,
  },
  {
    id: "landing",
    name: "落地页",
    description: "营销页面",
    icon: Layout,
  },
  {
    id: "blog",
    name: "博客",
    description: "个人博客",
    icon: PenTool,
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("ai");

  // Pre-fill description from URL prompt parameter
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setDescription(prompt);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">创建新项目</h1>
          <p className="text-zinc-500">选择模板并描述你的想法</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection - Compact */}
          <div>
            <label className="block text-sm text-zinc-600 mb-3">模板</label>
            <div className="grid grid-cols-4 gap-2">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      isSelected
                        ? "bg-zinc-100 border border-zinc-400"
                        : "bg-zinc-50 border border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${
                      isSelected ? "text-zinc-700" : "text-zinc-400"
                    }`} />
                    <div className="text-xs text-zinc-900 font-medium">{template.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm text-zinc-600 mb-2">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的网站"
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-all"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm text-zinc-600 mb-2">
              描述你的想法
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你想要创建什么样的网站，例如：一个现代化的产品落地页，包含英雄区域、功能介绍和定价方案..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 resize-none transition-all"
            />
          </div>

          {/* AI Mode Hint */}
          {selectedTemplate === "ai" && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <Sparkles className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-zinc-900 font-medium mb-0.5">AI 代码生成</div>
                <div className="text-xs text-zinc-500">
                  创建后使用 AI 助手面板，描述功能即可生成代码
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  创建项目
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}