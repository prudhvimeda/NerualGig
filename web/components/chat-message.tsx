"use client";

import { ReactNode } from "react";

type MessageProps = {
  role: "assistant" | "user";
  children: ReactNode;
  timestamp?: string;
};

export function ChatMessage({ role, children, timestamp }: MessageProps) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-md backdrop-blur transition ${
          isAssistant
            ? "border-white/65 bg-white/80 text-slate-700"
            : "border-brand-300/60 bg-brand-500/15 text-brand-800"
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide">
          <span className={`font-semibold ${isAssistant ? "text-brand-600" : "text-brand-600"}`}>
            {isAssistant ? "NeuralGig" : "You"}
          </span>
          {timestamp && <span className="text-slate-500">{timestamp}</span>}
        </div>
        <div className="prose max-w-none text-sm leading-relaxed text-slate-700 [&_code]:rounded [&_code]:bg-slate-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
