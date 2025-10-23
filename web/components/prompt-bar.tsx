"use client";

import axios from "axios";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ClockIcon, PaperAirplaneIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useModelSelector } from "../hooks/useModelSelector";
import { apiBase } from "../lib/api";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatRequest = {
  message: string;
  model: string;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

const HISTORY_STORAGE_KEY = "neuralgig:assistant-history";

export function PromptBar() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const { model } = useModelSelector();
  const listRef = useRef<HTMLDivElement | null>(null);
  const nextIdRef = useRef(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalised = parsed.map((message, index) => ({
          id: typeof message.id === "number" ? message.id : index + 1,
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content ?? "",
          timestamp: message.timestamp ?? new Date().toLocaleTimeString(),
        }));
        nextIdRef.current = normalised[normalised.length - 1].id + 1;
        setMessages(normalised);
      }
    } catch (error) {
      console.warn("Unable to load assistant chat history", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn("Unable to persist assistant chat history", error);
    }
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const pushMessage = (role: ChatMessage["role"], content: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { id: nextIdRef.current++, role, content, timestamp }]);
  };

  const handleSubmit = async () => {
    const prompt = value.trim();
    if (!prompt || isSending) return;

    pushMessage("user", prompt);
    setValue("");
    setIsSending(true);

    try {
      const payload: ChatRequest = {
        message: prompt,
        model,
        history: messages.map(({ role, content }) => ({ role, content })),
      };

      const response = await axios.post<{ reply: string }>(`${apiBase}/assistant/chat`, payload);
      pushMessage("assistant", response.data.reply ?? "I'm still thinking—try asking again in a moment.");
    } catch (error) {
      console.error(error);
      pushMessage(
        "assistant",
        "I couldn't reach the NeuralGig assistant. Make sure the FastAPI server and Ollama are running, then try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative mx-auto flex w-full flex-col items-stretch gap-2">
      <div className="flex items-center justify-between">
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-600"
          >
            <ClockIcon className="h-3.5 w-3.5" />
            View conversation history
          </button>
        ) : (
          <span className="text-[11px] uppercase tracking-wide text-slate-400">Ask a question to start the conversation.</span>
        )}
      </div>
      {messages.length > 0 && (
        <div
          ref={listRef}
          className="max-h-64 w-full overflow-y-auto rounded-3xl border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
        >
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {message.role === "user" ? "You" : "NeuralGig"}
                </span>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    message.role === "user" ? "bg-brand-50 text-brand-700" : "bg-white/90 text-slate-700 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex w-full items-center gap-3 rounded-full border border-white/65 bg-white/80 px-5 py-3 shadow-lg shadow-blue-500/20 backdrop-blur-xl">
        <SparklesIcon className="h-5 w-5 text-brand-500" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask NeuralGig to recommend talent, plan onboarding, or outline learning paths..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-slate-200 px-2 py-1 text-[11px] tracking-wide text-slate-500 sm:inline">
            ⌘ + Enter
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="flex items-center gap-1 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-200"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isSending ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10" role="dialog" aria-modal="true" aria-label="NeuralGig assistant history">
          <div className="relative flex w-full max-w-2xl flex-col gap-5 overflow-hidden rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-brand-200 hover:text-brand-600"
            >
              <XMarkIcon className="h-4 w-4" />
              Close
            </button>
            <header className="pr-16">
              <h2 className="text-lg font-display font-semibold text-slate-900">Conversation history</h2>
              <p className="mt-1 text-sm text-slate-600">Every prompt and response is stored here so you can revisit earlier guidance.</p>
            </header>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                  No messages yet. Ask NeuralGig a question to begin.
                </p>
              ) : (
                <div className="space-y-4 text-sm text-slate-700">
                  {messages.map((message) => (
                    <div key={`history-${message.id}`} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                        <span>{message.role === "user" ? "You" : "NeuralGig"}</span>
                        <span>{message.timestamp}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  nextIdRef.current = 1;
                  setHistoryOpen(false);
                }}
                className="self-end rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-100"
              >
                Clear history
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
