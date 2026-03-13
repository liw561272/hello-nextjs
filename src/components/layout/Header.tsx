"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, FolderOpen, Plus, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth/AuthButton";

const navItems = [
  { href: "/", label: "项目", icon: FolderOpen },
  { href: "/build", label: "构建", icon: Terminal },
  { href: "/new", label: "新建", icon: Plus },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="flex items-center justify-between h-full px-6 max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative bg-zinc-900 p-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-zinc-900 tracking-tight">
            AI Web Builder
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg border border-black/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - Auth */}
        <AuthButton />
      </div>
    </header>
  );
}