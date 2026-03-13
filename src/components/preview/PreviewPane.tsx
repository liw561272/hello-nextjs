"use client";

import { useState, useMemo } from "react";
import { Play, RefreshCw } from "lucide-react";
import type { CodeFile } from "@/types/project";

interface PreviewPaneProps {
  files: CodeFile[];
  activeFile: CodeFile | null;
}

export function PreviewPane({ files, activeFile }: PreviewPaneProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the main component for preview
  const previewContent = useMemo(() => {
    // Find App.tsx or index.tsx
    const mainFile = files.find(
      (f) => f.name === "App.tsx" || f.name === "index.tsx"
    );

    if (mainFile) {
      return mainFile.content;
    }

    // Use active file if it's a React component
    if (activeFile && (activeFile.language === "tsx" || activeFile.language === "jsx")) {
      return activeFile.content;
    }

    return null;
  }, [files, activeFile]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!previewContent) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <span className="text-sm font-medium text-gray-400">预览</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>选择一个 React 组件以预览</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-sm font-medium text-gray-400">预览</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="刷新预览"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-white">
        <iframe
          key={isRefreshing ? "refresh" : "normal"}
          srcDoc={generatePreviewHTML(previewContent, files)}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

function generatePreviewHTML(mainContent: string, allFiles: CodeFile[]): string {
  // Get CSS content
  const cssFile = allFiles.find((f) => f.name.endsWith(".css"));
  const cssContent = cssFile ? cssFile.content : "";

  // Simple HTML template for React preview
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // React code from editor
    ${transformCode(mainContent)}

    // Render the component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
  `;
}

function transformCode(code: string): string {
  // Simple transformation: remove import/export statements
  return code
    .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+/g, "");
}