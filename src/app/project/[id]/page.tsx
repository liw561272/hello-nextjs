"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Save, Plus, X, Sparkles, FileCode } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewPane } from "@/components/preview/PreviewPane";
import { AIPanel } from "@/components/ai/AIPanel";
import { getProjectById, updateProject } from "@/lib/storage/projects";
import type { Project, CodeFile } from "@/types/project";
import { generateId } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Use useMemo to get project once (client-side)
  const initialProject = useMemo(() => getProjectById(projectId), [projectId]);

  const [project, setProject] = useState<Project | null>(initialProject);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(() => {
    const proj = getProjectById(projectId);
    return proj?.files[0] || null;
  });
  const [openFiles, setOpenFiles] = useState<CodeFile[]>(() => {
    const proj = getProjectById(projectId);
    return proj?.files[0] ? [proj.files[0]] : [];
  });
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleFileSelect = (file: CodeFile) => {
    setActiveFile(file);
    if (!openFiles.find((f) => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
  };

  const handleFileClose = (fileId: string) => {
    const newOpenFiles = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(newOpenFiles);

    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleCodeChange = (content: string) => {
    if (!activeFile || !project) return;

    const updatedFile = { ...activeFile, content, isModified: true };
    setActiveFile(updatedFile);

    // Update in project
    const updatedFiles = project.files.map((f) =>
      f.id === activeFile.id ? updatedFile : f
    );
    setProject({ ...project, files: updatedFiles });
  };

  const handleSave = () => {
    if (!project) return;
    updateProject(project.id, { files: project.files });
    // Reset modified flags
    const savedFiles = project.files.map((f) => ({ ...f, isModified: false }));
    setProject({ ...project, files: savedFiles });
  };

  const handleAddFile = () => {
    if (!project) return;

    const newFile: CodeFile = {
      id: generateId(),
      name: `new-file-${Date.now()}.tsx`,
      path: `/new-file-${Date.now()}.tsx`,
      content: "// New file\n",
      language: "tsx",
    };

    const updatedFiles = [...project.files, newFile];
    setProject({ ...project, files: updatedFiles });
    setActiveFile(newFile);
    setOpenFiles([...openFiles, newFile]);
  };

  const handleExport = async () => {
    alert("导出功能开发中...");
  };

  const handleAIGenerate = (generatedFiles: CodeFile[]) => {
    if (!project) return;

    // Add generated files to project
    const updatedFiles = [...project.files, ...generatedFiles];
    setProject({ ...project, files: updatedFiles });

    // Open first generated file
    if (generatedFiles.length > 0) {
      setActiveFile(generatedFiles[0]);
      setOpenFiles([...openFiles, generatedFiles[0]]);
    }

    setShowAIPanel(false);
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="w-16 h-16 mb-4 rounded-xl bg-zinc-100 flex items-center justify-center">
          <FileCode className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-lg font-medium text-zinc-600 mb-3">项目不存在</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回项目列表
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar - More compact */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center">
              <FileCode className="w-3 h-3 text-zinc-600" />
            </div>
            <span className="text-zinc-900 text-sm font-medium truncate max-w-[180px]">
              {project.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleAddFile}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            title="新建文件"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all ${
              showAIPanel
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI</span>
          </button>
          <button
            onClick={handleSave}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            title="保存"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File tree */}
        <Sidebar
          files={project.files}
          activeFileId={activeFile?.id}
          onFileSelect={handleFileSelect}
        />

        {/* Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar - More compact */}
          {openFiles.length > 0 && (
            <div className="flex items-center bg-zinc-50 border-b border-zinc-200 overflow-x-auto">
              {openFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 px-3 py-2 border-r border-zinc-200 cursor-pointer group transition-all ${
                    activeFile?.id === file.id
                      ? "bg-white text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                  onClick={() => setActiveFile(file)}
                >
                  <span className="text-sm truncate max-w-[100px]">
                    {file.name}
                  </span>
                  {file.isModified && (
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileClose(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor and Preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 min-w-0">
              {activeFile ? (
                <CodeEditor
                  value={activeFile.content}
                  language={activeFile.language}
                  onChange={handleCodeChange}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                  选择一个文件开始编辑
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="w-1/2 border-l border-zinc-200 hidden lg:block">
              <PreviewPane files={project.files} activeFile={activeFile} />
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <AIPanel
            onClose={() => setShowAIPanel(false)}
            onGenerate={handleAIGenerate}
            currentCode={activeFile?.content || ""}
          />
        )}
      </div>
    </div>
  );
}