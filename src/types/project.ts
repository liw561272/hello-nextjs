// Project Types

export interface Project {
  id: string;
  name: string;
  description: string;
  files: CodeFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isOpen?: boolean;
  isModified?: boolean;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  files?: CodeFile[];
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  files?: CodeFile[];
}

// Project statistics
export interface ProjectStats {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
}