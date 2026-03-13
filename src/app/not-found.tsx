import { Home, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-gray-800 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">页面不存在</h1>
        <p className="text-gray-400 mb-6">
          抱歉，你访问的页面不存在或已被移除。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <Link
            href="/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            新建项目
          </Link>
        </div>
      </div>
    </div>
  );
}