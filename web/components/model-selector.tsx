"use client";

import { useModelSelector } from "../hooks/useModelSelector";

const MODELS = [{ id: "qwen", label: "Qwen 2.5 (7B)" }] as const;

export function ModelSelector() {
  const { model, setModel, isHydrated } = useModelSelector();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Model selector</h2>
        <p className="mt-1 text-xs text-slate-500">NeuralGig runs on a lightweight Phi-3 model so responses stay fast on local Ollama.</p>
      </div>
      <div className="flex flex-col gap-2">
        {MODELS.map(({ id, label }) => {
          const active = isHydrated && model === id;
          return (
            <button
              key={id}
              onClick={() => setModel(id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                active
                  ? "border-brand-400/80 bg-brand-50 text-slate-900 shadow-sm"
                  : "border-white/50 bg-white/60 text-slate-600 hover:border-brand-200 hover:text-slate-900"
              }`}
            >
              <span>{label}</span>
              {active && (
                <span className="rounded-full bg-brand-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
