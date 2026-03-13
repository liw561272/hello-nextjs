"use client";

import { useState, useMemo } from "react";
import {
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { GeneratedFile } from "@/types/chat";
import { cn } from "@/lib/utils";

interface BuildPreviewProps {
  files: GeneratedFile[];
  isGenerating?: boolean;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; icon: typeof Monitor }> = {
  desktop: { width: "100%", icon: Monitor },
  tablet: { width: "768px", icon: Tablet },
  mobile: { width: "375px", icon: Smartphone },
};

export function BuildPreview({ files, isGenerating }: BuildPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get the main component for preview
  const previewContent = useMemo(() => {
    if (files.length === 0) return null;

    // Find App.tsx or index.tsx
    const mainFile = files.find(
      (f) => f.name === "App.tsx" || f.name === "index.tsx"
    );

    if (mainFile) {
      return mainFile.content;
    }

    // Use first tsx/jsx file
    const firstReactFile = files.find(
      (f) => f.language === "typescript" || f.language === "javascript"
    );

    return firstReactFile?.content || null;
  }, [files]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-500">预览</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
          <div className="text-center">
            {isGenerating ? (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
                <p className="text-sm text-gray-500">正在生成代码...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">在左侧输入需求开始构建</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-white",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">预览</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
              const Icon = viewportSizes[size].icon;
              return (
                <button
                  key={size}
                  onClick={() => setViewport(size)}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewport === size
                      ? "bg-white text-gray-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  title={size === "desktop" ? "桌面" : size === "tablet" ? "平板" : "手机"}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="刷新预览"
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div className="flex-1 flex items-start justify-center bg-gray-100 p-4 overflow-auto">
        <div
          className="h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 border border-gray-200"
          style={{ width: viewportSizes[viewport].width }}
        >
          <iframe
            key={isRefreshing ? "refresh" : "normal"}
            srcDoc={generatePreviewHTML(previewContent, files)}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* File count indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-500 shadow-sm border border-gray-100">
        {files.length} 个文件
      </div>
    </div>
  );
}

function generatePreviewHTML(
  mainContent: string | null,
  allFiles: GeneratedFile[]
): string {
  if (!mainContent) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui; color: #666;">
  <p>没有可预览的内容</p>
</body>
</html>
    `;
  }

  // Get CSS content
  const cssFile = allFiles.find((f) => f.name.endsWith(".css"));
  const cssContent = cssFile ? cssFile.content : "";

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