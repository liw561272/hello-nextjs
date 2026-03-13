"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder, FileCode, FileJson, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeFile } from "@/types/project";

interface FileTreeItem {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
  file?: CodeFile;
}

interface FileTreeProps {
  files: CodeFile[];
  activeFileId?: string;
  onFileSelect: (file: CodeFile) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="w-3.5 h-3.5 text-zinc-500" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-500" />;
    case 'css':
      return <Palette className="w-3.5 h-3.5 text-blue-500" />;
    default:
      return <File className="w-3.5 h-3.5 text-zinc-400" />;
  }
}

function buildFileTree(files: CodeFile[]): FileTreeItem[] {
  const root: FileTreeItem[] = [];

  files.forEach((file) => {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existing = current.find((item) => item.name === part);

      if (existing) {
        if (!isFile && existing.children) {
          current = existing.children;
        }
      } else {
        const newItem: FileTreeItem = {
          name: part,
          path: "/" + parts.slice(0, index + 1).join("/"),
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
          file: isFile ? file : undefined,
        };
        current.push(newItem);
        if (!isFile && newItem.children) {
          current = newItem.children;
        }
      }
    });
  });

  return root;
}

function TreeItem({
  item,
  depth = 0,
  activeFileId,
  expandedFolders,
  onToggleFolder,
  onFileSelect,
}: {
  item: FileTreeItem;
  depth?: number;
  activeFileId?: string;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileSelect: (file: CodeFile) => void;
}) {
  const isExpanded = expandedFolders.has(item.path);
  const isActive = item.type === "file" && item.file?.id === activeFileId;

  const handleClick = () => {
    if (item.type === "folder") {
      onToggleFolder(item.path);
    } else if (item.file) {
      onFileSelect(item.file);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-all rounded-md mx-1",
          isActive
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
        )}
        style={{ paddingLeft: `${depth * 10 + 8}px` }}
        onClick={handleClick}
      >
        {item.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 shrink-0 text-zinc-400" />
            ) : (
              <ChevronRight className="w-3 h-3 shrink-0 text-zinc-400" />
            )}
            <Folder className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            {getFileIcon(item.name)}
          </>
        )}
        <span className="text-xs truncate">{item.name}</span>
      </div>

      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem
              key={child.path}
              item={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  files,
  activeFileId,
  onFileSelect,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));

  const fileTree = buildFileTree(files);

  const handleToggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="w-52 bg-zinc-50/50 border-r border-black/5 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/5">
        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
          文件
        </span>
        <span className="text-[10px] text-zinc-400 tabular-nums">
          {files.length}
        </span>
      </div>
      <div className="flex-1 overflow-auto py-1.5">
        {fileTree.length === 0 ? (
          <div className="text-zinc-400 text-xs text-center py-6">
            暂无文件
          </div>
        ) : (
          fileTree.map((item) => (
            <TreeItem
              key={item.path}
              item={item}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
              onFileSelect={onFileSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}