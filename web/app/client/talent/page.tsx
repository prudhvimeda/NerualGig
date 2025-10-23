"use client";

import { useMemo, useState } from "react";
import { AssistLayout } from "../../../components/assist-layout";
import { AnswerCard } from "../../../components/answer-card";
import { useModelSelector } from "../../../hooks/useModelSelector";
import { useApi } from "../../../lib/api";
import type { ClientTalentRecommendation } from "../../../types/dashboard";

export default function ClientTalentPage() {
  const { model, isHydrated } = useModelSelector();
  const [focus, setFocus] = useState<string | null>(null);
  const endpoint = useMemo(
    () => `/client/talent?model=${model}${focus ? `&focus=${encodeURIComponent(focus)}` : ""}`,
    [model, focus],
  );
  const { data, error, isLoading } = useApi<ClientTalentRecommendation[]>(endpoint);

  return (
    <AssistLayout
      title="Curated talent pool"
      description="NeuralGig continuously analyses your briefs and creates shortlists with explainability built in."
      rightRail={
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-card backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-slate-900">Focus filters</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              {["AI Engineering", "Product", "Design", "Full Stack"].map((chip) => {
                const active = focus === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => setFocus(active ? null : chip)}
                    className={`rounded-full px-3 py-1 transition ${
                      active
                        ? "bg-brand-100 text-brand-600 shadow-sm"
                        : "bg-white/70 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      {isLoading && <p className="text-sm text-slate-500">Gathering recommendations…</p>}
      {error && (
        <p className="rounded-3xl border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-600">
          Unable to reach the backend. Start the FastAPI server.
        </p>
      )}

      {data?.map((talent) => (
        <AnswerCard
          key={talent.id}
          heading={`${talent.name} · ${talent.role}`}
          footnote={`Match ${(talent.score * 100).toFixed(0)}% · ${talent.location} · Model ${model}`}
          body={
            <div className="space-y-4">
              <p>{talent.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {talent.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          }
          sources={[{ label: "Portfolio", url: "#" }, { label: "Case study", url: "#" }]}
        />
      ))}

      {!data?.length && !isLoading && !error && (
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-card">
          No recommendations yet. Adjust filters or ask the assistant using the prompt bar.
        </div>
      )}
      <p className="text-xs text-slate-500">Model: {isHydrated ? model : "Loading…"}</p>
    </AssistLayout>
  );
}
