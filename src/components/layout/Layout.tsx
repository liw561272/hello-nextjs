"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 登录页面和构建页面不显示Header
  const showHeader = pathname !== "/login" && !pathname.startsWith("/build");

  return (
    <div className="min-h-screen bg-white relative">
      {showHeader && <Header />}
      <main className={`relative min-h-screen ${showHeader ? "pt-14" : ""}`}>
        {children}
      </main>
    </div>
  );
}