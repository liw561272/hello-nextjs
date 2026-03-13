// File Types

export type Language =
  | "typescript"
  | "javascript"
  | "jsx"
  | "tsx"
  | "css"
  | "html"
  | "json"
  | "markdown"
  | "plain";

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  language?: Language;
}

export interface FileTab {
  id: string;
  name: string;
  path: string;
  language: Language;
  isModified: boolean;
}

export interface FileOperation {
  type: "create" | "delete" | "rename" | "move";
  path: string;
  newPath?: string;
  content?: string;
}

// File extension to language mapping
export const EXTENSION_TO_LANGUAGE: Record<string, Language> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  css: "css",
  html: "html",
  json: "json",
  md: "markdown",
};

export function getLanguageFromExtension(filename: string): Language {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_TO_LANGUAGE[ext] || "plain";
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons: Record<string, string> = {
    ts: "typescript",
    tsx: "react",
    js: "javascript",
    jsx: "react",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown",
  };
  return icons[ext] || "file";
}