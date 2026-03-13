"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Trash2, Clock, FileCode, Sparkles, Zap, Code2, Rocket, Wand2, Send, Layout, Gauge, Image, Terminal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getProjects, getProjectsSnapshot, deleteProject, subscribeToProjects } from "@/lib/storage/projects";

export default function HomePage() {
  const router = useRouter();
  const projects = useSyncExternalStore(subscribeToProjects, getProjects, getProjectsSnapshot);
  const [prompt, setPrompt] = useState("");
  // Check if we're on the client side for hydration
  const mounted = typeof window !== 'undefined';

  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`确定要删除项目 "${name}" 吗？`)) {
      deleteProject(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Navigate to new project page with the prompt
      router.push(`/new?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const quickStarts = [
    { label: "落地页", icon: Layout, prompt: "创建一个现代化的产品落地页，包含英雄区域、功能介绍、定价方案" },
    { label: "数据仪表盘", icon: Gauge, prompt: "创建一个数据仪表盘，包含图表、统计卡片和数据表格" },
    { label: "图片画廊", icon: Image, prompt: "创建一个响应式图片画廊，支持网格布局和灯箱效果" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative px-6 pt-20 pb-12 max-w-5xl mx-auto">
        <div className="text-center relative animate-fade-in-up">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 mb-5 tracking-tight leading-tight flex items-center justify-center gap-3">
            <span>用 AI 将想法</span>
            <span className="inline-flex items-center gap-2 text-zinc-900">
              变为现实
              <Sparkles className="w-8 h-8 text-zinc-600" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
            用自然语言描述你的需求，AI 帮你生成专业的网站代码
          </p>

          {/* Main Prompt Input */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
            <div className="relative group">
              <div className="relative flex items-center bg-white rounded-2xl border border-zinc-200 group-hover:border-zinc-400 transition-all duration-300 overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="你想要创建什么样的网站？"
                  className="flex-1 bg-transparent px-6 py-5 text-lg text-zinc-900 placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="m-2 p-3 rounded-xl bg-zinc-900 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Start Tags */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-16">
            {/* Terminal-style Build Button */}
            <Link
              href="/build"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Terminal className="w-4 h-4" />
              对话式构建
            </Link>
            {quickStarts.map((item, i) => (
              <button
                key={i}
                onClick={() => setPrompt(item.prompt)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 text-sm transition-all duration-300"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mb-16 animate-fade-in">
            <div className="text-center group">
              <div className="text-3xl font-bold text-zinc-900 mb-1">
                {mounted ? projects.length : 0}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">项目</div>
            </div>
            <div className="w-px h-10 bg-zinc-200" />
            <div className="text-center group">
              <div className="text-3xl font-bold text-zinc-900 mb-1">
                {mounted ? projects.reduce((acc, p) => acc + p.files.length, 0) : 0}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">文件</div>
            </div>
            <div className="w-px h-10 bg-zinc-200" />
            <div className="flex items-center gap-2 text-emerald-600">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">AI 就绪</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="px-6 pb-24 max-w-5xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <FolderOpen className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">还没有项目</h3>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              在上方输入你的想法，开始创建第一个项目
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">我的项目</h2>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建项目
              </Link>
            </div>

            {/* Project Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] animate-fade-in block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Background */}
                  <div className="aspect-[4/3] bg-zinc-50 flex items-center justify-center relative overflow-hidden border border-zinc-200">
                    {/* Icon */}
                    <FileCode className="w-12 h-12 text-zinc-300 group-hover:text-zinc-600 transition-colors duration-300 relative z-10" />

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-20"
                      title="删除项目"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-white border-t border-zinc-100">
                    <h3 className="font-medium text-zinc-900 mb-1 group-hover:text-zinc-600 transition-colors truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="w-3 h-3" />
                        {project.files.length} 文件
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}

              {/* Add new project card */}
              <Link
                href="/new"
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] block"
              >
                <div className="aspect-[4/3] bg-zinc-50 border-2 border-dashed border-zinc-200 group-hover:border-zinc-400 flex items-center justify-center rounded-xl transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                      <Plus className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                    </div>
                    <span className="text-zinc-400 group-hover:text-zinc-900 transition-colors text-sm">
                      创建新项目
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Feature Section */}
      <div className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Code2, title: "智能代码生成", desc: "描述需求，AI 自动生成代码" },
            { icon: Wand2, title: "实时预览", desc: "所见即所得，即时查看效果" },
            { icon: Rocket, title: "一键导出", desc: "快速导出项目文件" },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 text-zinc-600" />
              </div>
              <h3 className="font-medium text-zinc-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}