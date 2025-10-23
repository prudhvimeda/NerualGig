"use client";

import { ReactNode } from "react";
import { ModelSelector } from "./model-selector";
import { PromptBar } from "./prompt-bar";

type AssistLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  rightRail?: ReactNode;
  showPromptBar?: boolean;
};

export function AssistLayout({ title, description, children, rightRail, showPromptBar = false }: AssistLayoutProps) {
  return (
    <div className="flex min-h-full w-full flex-col gap-12">
      <header className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">NeuralGig Assistant</p>
          <h1 className="mt-2 text-3xl font-display font-semibold text-slate-900 sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-3xl text-sm text-slate-600">{description}</p>}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,_1fr)_320px]">
        <main className="flex flex-col gap-6">{children}</main>

        <aside className="hidden lg:flex lg:flex-col lg:gap-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-card backdrop-blur-xl">
            <ModelSelector />
          </div>
          {rightRail}
        </aside>
      </div>

      {showPromptBar && (
        <div className="fixed bottom-12 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-4 sm:px-0">
          <PromptBar />
        </div>
      )}
    </div>
  );
}
