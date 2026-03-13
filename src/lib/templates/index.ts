import type { CodeFile } from "@/types/project";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "landing" | "blog" | "dashboard" | "portfolio" | "ecommerce";
  preview?: string;
  files: CodeFile[];
}

export const templates: Template[] = [
  {
    id: "blank",
    name: "空白项目",
    description: "从零开始创建你的项目",
    category: "landing",
    files: [
      {
        id: "blank-app",
        name: "App.tsx",
        path: "/App.tsx",
        content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hello World</h1>
        <p className="text-gray-400">开始构建你的应用</p>
      </div>
    </div>
  );
}`,
        language: "tsx",
      },
      {
        id: "blank-css",
        name: "index.css",
        path: "/index.css",
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}`,
        language: "css",
      },
    ],
  },
  {
    id: "landing",
    name: "落地页",
    description: "现代化的产品展示落地页",
    category: "landing",
    files: [
      {
        id: "landing-app",
        name: "App.tsx",
        path: "/App.tsx",
        content: `import React, { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(\`感谢订阅！邮箱: \${email}\`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🚀 产品名</div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white">功能</a>
            <a href="#pricing" className="text-gray-300 hover:text-white">定价</a>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              开始使用
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            打造你的下一代产品
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            使用我们的平台，快速构建、部署和扩展你的应用。
          </p>
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              订阅
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">核心功能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: '极速开发', desc: '几分钟内完成从想法到产品的转变' },
              { icon: '🔒', title: '安全可靠', desc: '企业级安全保障，数据加密存储' },
              { icon: '📈', title: '无限扩展', desc: '弹性扩容，支撑业务快速增长' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>© 2024 产品名. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}`,
        language: "tsx",
      },
      {
        id: "landing-css",
        name: "index.css",
        path: "/index.css",
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}`,
        language: "css",
      },
    ],
  },
  {
    id: "blog",
    name: "博客模板",
    description: "简洁现代的个人博客",
    category: "blog",
    files: [
      {
        id: "blog-app",
        name: "App.tsx",
        path: "/App.tsx",
        content: `import React, { useState } from 'react';

const posts = [
  { id: 1, title: '开始使用 React', excerpt: '学习 React 的第一步...', date: '2024-01-15', category: '技术' },
  { id: 2, title: 'TypeScript 最佳实践', excerpt: '写出更安全的代码...', date: '2024-01-10', category: '技术' },
  { id: 3, title: '我的 2023 年总结', excerpt: '回顾过去一年的成长...', date: '2024-01-01', category: '生活' },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredPosts = selectedCategory
    ? posts.filter(p => p.category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">我的博客</h1>
          <p className="text-gray-500 mt-1">记录生活与技术</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={\`px-4 py-2 rounded-full text-sm \${
              selectedCategory === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }\`}
          >
            全部
          </button>
          {['技术', '生活'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-4 py-2 rounded-full text-sm \${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post List */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{post.date}</span>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{post.category}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
              <p className="text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>© 2024 我的博客. 使用 ❤️ 构建</p>
        </div>
      </footer>
    </div>
  );
}`,
        language: "tsx",
      },
      {
        id: "blog-css",
        name: "index.css",
        path: "/index.css",
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}`,
        language: "css",
      },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}