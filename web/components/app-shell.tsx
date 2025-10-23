"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== "/";
  const useGlass = showHeader && !pathname.startsWith("/client");

  return (
    <div className="relative mx-auto flex min-h-screen w-full flex-col pb-16 sm:px-4">
      {showHeader && <AppHeader />}
      <main className={showHeader ? "flex-1 pt-28" : "flex-1"}>
        {useGlass ? (
          <div className="glass-window">{children}</div>
        ) : showHeader ? (
          <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 md:px-14">{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
