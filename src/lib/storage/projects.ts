import type { Project, CodeFile, ProjectCreateInput, ProjectUpdateInput } from "@/types/project";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "ai-web-builder-projects";

// Global state for stable reference
let projectsCache: Project[] = [];
let isInitialized = false;

// Subscribers for sync external store
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

// Initialize cache from localStorage (called once)
function initializeCache(): void {
  if (isInitialized || typeof window === "undefined") return;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    projectsCache = data ? JSON.parse(data) : [];
    isInitialized = true;
  } catch (error) {
    console.error("Failed to load projects:", error);
    projectsCache = [];
    isInitialized = true;
  }
}

// Subscribe function for useSyncExternalStore
export function subscribeToProjects(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Get projects (returns cached reference for stable snapshot)
export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  initializeCache();
  return projectsCache;
}

// Server snapshot - returns stable empty array reference
const emptyArray: Project[] = [];
export function getProjectsSnapshot(): Project[] {
  if (typeof window === "undefined") return emptyArray;
  initializeCache();
  return projectsCache;
}

// Save all projects to localStorage and update cache
function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    projectsCache = projects; // Update cache with same reference
    notifySubscribers();
  } catch (error) {
    console.error("Failed to save projects:", error);
    throw new Error("Failed to save projects");
  }
}

// Get a single project by ID
export function getProjectById(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

// Create a new project
export function createProject(input: ProjectCreateInput): Project {
  const projects = getProjects();
  const now = new Date().toISOString();

  const newProject: Project = {
    id: generateId(),
    name: input.name,
    description: input.description || "",
    files: input.files || [],
    createdAt: now,
    updatedAt: now,
  };

  projects.unshift(newProject);
  saveProjects(projects);

  return newProject;
}

// Update a project
export function updateProject(id: string, input: ProjectUpdateInput): Project | null {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const updatedProject: Project = {
    ...projects[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updatedProject;
  saveProjects(projects);

  return updatedProject;
}

// Delete a project
export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return false;

  projects.splice(index, 1);
  saveProjects(projects);

  return true;
}

// File operations
export function addFileToProject(projectId: string, file: CodeFile): CodeFile | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  const newFile: CodeFile = {
    ...file,
    id: file.id || generateId(),
  };

  project.files.push(newFile);
  updateProject(projectId, { files: project.files });

  return newFile;
}

export function updateFileInProject(
  projectId: string,
  fileId: string,
  updates: Partial<CodeFile>
): CodeFile | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  const fileIndex = project.files.findIndex((f) => f.id === fileId);
  if (fileIndex === -1) return null;

  project.files[fileIndex] = {
    ...project.files[fileIndex],
    ...updates,
  };

  updateProject(projectId, { files: project.files });

  return project.files[fileIndex];
}

export function deleteFileFromProject(projectId: string, fileId: string): boolean {
  const project = getProjectById(projectId);
  if (!project) return false;

  const fileIndex = project.files.findIndex((f) => f.id === fileId);
  if (fileIndex === -1) return false;

  project.files.splice(fileIndex, 1);
  updateProject(projectId, { files: project.files });

  return true;
}

export function getFileById(projectId: string, fileId: string): CodeFile | null {
  const project = getProjectById(projectId);
  if (!project) return null;

  return project.files.find((f) => f.id === fileId) || null;
}

// Generate default project files
export function createDefaultFiles(projectName: string): CodeFile[] {
  return [
    {
      id: generateId(),
      name: "App.tsx",
      path: "/App.tsx",
      content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">${projectName}</h1>
        <p className="text-gray-400">Start building your application</p>
      </div>
    </div>
  );
}`,
      language: "tsx",
    },
    {
      id: generateId(),
      name: "index.css",
      path: "/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}`,
      language: "css",
    },
    {
      id: generateId(),
      name: "package.json",
      path: "/package.json",
      content: JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/\s+/g, "-"),
          version: "1.0.0",
          private: true,
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
            tailwindcss: "^3.4.0",
            typescript: "^5.0.0",
          },
        },
        null,
        2
      ),
      language: "json",
    },
  ];
}