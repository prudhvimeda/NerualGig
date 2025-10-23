"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi, apiBase } from "../../../lib/api";

type ProjectListing = {
  id: string;
  title: string;
  client: string;
  budget: number;
  durationWeeks: number;
  description: string;
  tags: string[];
  suitabilityScore: number;
};

export default function FindProjectsPage() {
  const { data, error, isLoading } = useApi<ProjectListing[]>("/freelancer/projects");
  const router = useRouter();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<Record<string, boolean>>({});

  const toggleSave = (projectId: string) => {
    setSavedProjects((prev) => {
      const next = { ...prev };
      if (next[projectId]) {
        delete next[projectId];
      } else {
        next[projectId] = true;
      }
      return next;
    });
  };

  const handleApply = async (projectId: string) => {
    setApplyingId(projectId);
    try {
      await axios.post(`${apiBase}/freelancer/applications`, { projectId });
      router.push("/freelancer/applications");
    } catch (applyError) {
      console.error(applyError);
      alert("Unable to submit your application. Please ensure the API server is running.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Opportunities</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Projects curated for you</h1>
        <p className="mt-2 text-sm text-slate-600">
          NeuralGig matches you with briefs tailored to your stack, availability, and rate preferences.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading projects...</p>}
      {error && <p className="text-sm text-red-600">Unable to reach the backend. Start the FastAPI server.</p>}

      <div className="grid gap-5">
        {data?.map((project) => (
          <article key={project.id} className="card flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                <p className="text-sm text-slate-600">
                  {project.client} • {project.durationWeeks} week engagement
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">${project.budget.toLocaleString()}</span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  Fit {Math.round(project.suitabilityScore * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => handleApply(project.id)}
                disabled={applyingId === project.id}
                className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-300"
              >
                {applyingId === project.id ? "Applying…" : "Apply"}
              </button>
              <button
                onClick={() => toggleSave(project.id)}
                className={`rounded-lg border px-4 py-2 font-semibold transition ${
                  savedProjects[project.id]
                    ? "border-brand-300 bg-brand-50 text-brand-600"
                    : "border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                {savedProjects[project.id] ? "Saved" : "Save for later"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
