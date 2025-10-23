"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApi } from "../../../lib/api";
import type { FreelancerDashboard } from "../../../types/dashboard";

const pipelineSeries = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 4 },
  { label: "Wed", value: 5 },
  { label: "Thu", value: 6 },
  { label: "Fri", value: 7 },
];

const skillHistogram = [
  { label: "Delivery", value: 36 },
  { label: "Discovery", value: 24 },
  { label: "R&D", value: 18 },
  { label: "Mentorship", value: 12 },
  { label: "Community", value: 10 },
];

const incomeBreakdown = [
  { label: "Invoiced", amount: 8200 },
  { label: "Pending", amount: 5400 },
  { label: "Upcoming", amount: 3600 },
];

const buildPipelinePath = (series: typeof pipelineSeries) => {
  if (series.length === 0) return "";
  const maxValue = Math.max(...series.map((point) => point.value));
  return series
    .map((point, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 85 - 7;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
};

const pipelinePath = buildPipelinePath(pipelineSeries);

export default function FreelancerDashboardPage() {
  const { data, error, isLoading } = useApi<FreelancerDashboard>("/freelancer/dashboard");

  const projectTiles = useMemo(
    () => [
      {
        name: "Generative analytics assistant",
        status: "Delivery",
        due: "Apr 12",
        highlights: ["Ship v1 dashboard", "Polish onboarding flow"],
      },
      {
        name: "AI onboarding copilot",
        status: "Discovery",
        due: "Apr 28",
        highlights: ["Draft knowledge base", "Prototype prompt orchestration"],
      },
    ],
    [],
  );

  const assessmentHistory = useMemo(
    () => [
      { name: "LangChain workflows", score: 88, date: "Mar 02", badge: "Advanced" },
      { name: "Prompt engineering", score: 92, date: "Feb 18", badge: "Expert" },
      { name: "System design", score: 85, date: "Jan 30", badge: "Proficient" },
    ],
    [],
  );

  const aiLearningHighlights = useMemo(
    () => [
      "Watch Hugging Face short course on retrieval augmented generation",
      "Pair with Velocity Pod on evaluation harness automation",
      "Document lessons learned for your portfolio case study",
    ],
    [],
  );

  if (isLoading) {
    return <p className="p-10 text-slate-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-10 text-sm text-red-600">Start the FastAPI server to populate the freelancer dashboard.</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="grid gap-6 rounded-[28px] border border-white/60 bg-white/90 px-8 py-10 shadow-card backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Freelancer workspace</p>
            <h1 className="text-3xl font-display font-semibold text-slate-900">{data.profile.name}</h1>
            <p className="text-sm text-slate-600">
              {data.profile.role} • {data.profile.focusAreas.join(" • ")}
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-4 shadow-inner sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available hours</span>
              <span className="text-2xl font-display text-slate-900">{data.profile.availableHours}</span>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">This week</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active engagements</span>
              <span className="text-2xl font-display text-slate-900">{data.activeEngagements.length}</span>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">Across squads</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Learning focus</span>
              <span className="text-2xl font-display text-slate-900">{data.aiLearningPlan.focusRole}</span>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">Next 30 days</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Link
              href="/freelancer/profile#availability"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 font-semibold transition hover:border-brand-200 hover:text-brand-600"
            >
              Update availability
            </Link>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
              AI boost: daily logs raised your match score by 12%
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/85 px-6 py-5 shadow-inner">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Today&apos;s spotlight</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="rounded-2xl bg-brand-50/70 px-4 py-3">Send project Loom recap before 3 PM ET.</li>
            <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">Sync with Velocity Pod to unblock analytics QA.</li>
            <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">Complete LangChain refresher highlighted by AI companion.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card flex flex-col gap-5">
          <h2 className="text-lg font-display font-semibold text-slate-900">My projects</h2>
          <div className="grid gap-4">
            {projectTiles.map((project) => (
              <div key={project.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-500">{project.status} • Due {project.due}</p>
                  </div>
                  <Link
                    href={`/freelancer/workshop?project=${encodeURIComponent(project.name)}`}
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:bg-brand-50"
                  >
                    Open workspace
                  </Link>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  {project.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="card flex flex-col gap-5">
          <header>
            <h2 className="text-lg font-display font-semibold text-slate-900">Milestone payments</h2>
            <p className="mt-1 text-sm text-slate-600">Invoiced vs pending vs upcoming this month.</p>
          </header>
          <div className="space-y-4">
            {incomeBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex-1 rounded-full bg-slate-100">
                  <div
                    className="flex h-3 items-center justify-end rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 px-2 text-[11px] font-semibold text-white"
                    style={{ width: `${Math.min(100, (item.amount / 9000) * 100)}%` }}
                  >
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
                <span className="w-24 text-xs uppercase tracking-wide text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500">
            Tip: finalize timesheets by Thursday to ensure Friday payouts.
          </div>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card flex flex-col gap-5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">AI learning companion</h2>
              <p className="mt-1 text-sm text-slate-600">NeuralGig curates a personalised roadmap around your current projects.</p>
            </div>
            <Link href="/freelancer/learning" className="text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:text-brand-500">
              View full plan →
            </Link>
          </header>
          <div className="space-y-3 text-sm text-slate-700">
            <p className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 leading-relaxed">{data.aiLearningPlan.summary}</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {aiLearningHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="grid gap-2 text-sm">
              {data.aiLearningPlan.resources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/60"
                >
                  <p className="font-semibold text-slate-900">{resource.title}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{resource.type}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card flex flex-col gap-5">
          <header>
            <h2 className="text-lg font-display font-semibold text-slate-900">Assessment hub</h2>
            <p className="mt-1 text-sm text-slate-600">Track NeuralGig assessments and skill badges.</p>
          </header>
          <div className="space-y-4 text-sm text-slate-600">
            {assessmentHistory.map((assessment) => (
              <div key={assessment.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{assessment.name}</p>
                    <p className="text-xs text-slate-500">Taken {assessment.date}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {assessment.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Score: {assessment.score}/100</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="card flex flex-col gap-5">
          <header>
            <h2 className="text-lg font-display font-semibold text-slate-900">How you spent your week</h2>
            <p className="mt-1 text-sm text-slate-600">Self-reported time across initiatives.</p>
          </header>
          <div className="flex flex-col gap-3">
            {skillHistogram.map((bucket) => (
              <div key={bucket.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  <span>{bucket.label}</span>
                  <span>{bucket.value}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                    style={{ width: `${bucket.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
