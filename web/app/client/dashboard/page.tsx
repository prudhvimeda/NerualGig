"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApi } from "../../../lib/api";
import type { ClientDashboard } from "../../../types/dashboard";

const velocitySeries = [
  { label: "W1", value: 62 },
  { label: "W2", value: 70 },
  { label: "W3", value: 74 },
  { label: "W4", value: 81 },
  { label: "W5", value: 88 },
  { label: "W6", value: 92 },
];

const allocationHistogram = [
  { label: "Strategy", value: 18 },
  { label: "Delivery", value: 32 },
  { label: "Design", value: 14 },
  { label: "Platform", value: 22 },
  { label: "QA", value: 14 },
];

const budgetCategories = [
  { label: "In Flight", amount: 64000, color: "from-brand-500 to-indigo-500" },
  { label: "Pending", amount: 28000, color: "from-emerald-400 to-teal-500" },
  { label: "Released", amount: 52000, color: "from-slate-400 to-slate-500" },
];

const buildVelocityPath = (series: typeof velocitySeries) => {
  if (series.length === 0) return "";
  const maxValue = Math.max(...series.map((point) => point.value));
  return series
    .map((point, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 90 - 5;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
};

const velocityPath = buildVelocityPath(velocitySeries);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function ClientDashboardPage() {
  const { data, error, isLoading } = useApi<ClientDashboard>("/client/dashboard");

  const cards = useMemo(() => {
    if (!data) {
      return [];
    }
    const nextMilestone = data.upcomingMilestones[0];
    return [
      {
        label: "Active projects",
        value: data.account.activeProjects.toString(),
        caption: "Running this quarter",
      },
      {
        label: "Active squads",
        value: data.account.teams.toString(),
        caption: "Multidisciplinary pods",
      },
      {
        label: "Next milestone",
        value: nextMilestone ? formatDate(nextMilestone.dueDate) : "—",
        caption: nextMilestone ? nextMilestone.projectName : "No upcoming deliverables",
      },
    ];
  }, [data]);

  const projectSnapshot = useMemo(() => {
    if (!data) {
      return [];
    }
    const derived = [
      {
        name: "Generative analytics assistant",
        status: "In delivery",
        health: "On track",
        eta: "12 days",
        owner: "Velocity Pod",
      },
      {
        name: "Composable design system refresh",
        status: "Kickoff",
        health: "Needs staffing",
        eta: "Planning",
        owner: "Experience Studio",
      },
      {
        name: "AI onboarding copilot",
        status: "Discovery",
        health: "Green",
        eta: "18 days",
        owner: "Insight Squad",
      },
    ];
    return derived;
  }, [data]);

  const aiInsights = [
    {
      title: "Upcoming dependency risk",
      body: "Design deliverables for the analytics assistant are tracking 2 days ahead. Approve the next milestone to keep engineering unblocked.",
      action: "Review milestone brief",
    },
    {
      title: "Budget optimization",
      body: "Freelancer cadence shows 18% unused hours. Consider converting Maya Chen to part-time for the next sprint.",
      action: "Adjust allocation",
    },
    {
      title: "Suggested squad",
      body: "Spin up Velocity Pod + Miles Chen for the onboarding copilot. They’ve shipped similar LLM workflows recently.",
      action: "Preview squad",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="grid gap-8 rounded-[28px] border border-white/60 bg-white/90 px-8 py-10 shadow-card backdrop-blur-xl lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-lg font-semibold text-white">
              {data ? data.account.name.slice(0, 1) : "N"}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Client workspace</p>
              <h1 className="text-3xl font-display font-semibold text-slate-900">
                {data ? `Welcome back, ${data.account.name}` : "Client dashboard"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Monitor delivery velocity, stay ahead of milestone approvals, and let AI pair you with the right squad for every initiative.
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-4 shadow-inner sm:grid-cols-3">
            {cards.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</span>
                <span className="text-2xl font-display text-slate-900">{item.value}</span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">{item.caption}</span>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-brand-100 bg-brand-50/70 px-4 py-4 text-sm text-brand-700">
            <strong>AI insight:</strong> Portfolio burn is pacing 6% under plan. Consider freeing the Design Studio squad for next month’s launch.
          </div>
        </div>
        <aside className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 px-6 py-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Active projects</h2>
          <div className="space-y-4">
            {projectSnapshot.map((project) => (
              <div key={project.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {project.health}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span>{project.status}</span>
                  <span>ETA {project.eta}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Owner · {project.owner}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">Milestone tracker</h2>
              <p className="mt-1 text-sm text-slate-600">Approve deliverables and release payments with confidence.</p>
            </div>
            {data?.upcomingMilestones[0] && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                Next due {formatDate(data.upcomingMilestones[0].dueDate)}
              </span>
            )}
          </header>
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-slate-500">Pulling milestone schedules…</p>}
            {error && <p className="text-sm text-red-600">Unable to reach the backend. Start the FastAPI server.</p>}
            {!isLoading && !error && (
              <ul className="space-y-3 text-sm">
                {data?.upcomingMilestones.map((milestone) => (
                  <li key={`${milestone.projectId}-${milestone.dueDate}`} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{milestone.projectName}</p>
                        <p className="text-xs text-slate-500">Due {formatDate(milestone.dueDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{formatCurrency(milestone.amount)}</span>
                        <Link
                          href={`/client/payments?project=${milestone.projectId}`}
                          className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:bg-brand-50"
                        >
                          Review & approve
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!isLoading && !error && data && data.upcomingMilestones.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-600">
                Once projects are underway, escrow milestones will appear here.
              </p>
            )}
          </div>
        </div>

        <aside className="card flex flex-col gap-5">
          <header>
            <h2 className="text-lg font-display font-semibold text-slate-900">Freelancer & squad performance</h2>
            <p className="mt-1 text-sm text-slate-600">AI surfaces the people driving the highest impact this sprint.</p>
          </header>
          {isLoading && <p className="text-sm text-slate-500">Scoring top specialists…</p>}
          {error && <p className="text-sm text-red-600">Backend unavailable. Start the FastAPI server.</p>}
          {!isLoading && !error && (
            <ul className="space-y-3 text-sm">
              {data?.recommendations.map((recommendation) => {
                return (
                  <li key={recommendation.id} className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{recommendation.name}</p>
                        <p className="text-xs text-slate-500">{recommendation.role}</p>
                      </div>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                        Match {Math.round(recommendation.score * 100)}%
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                      {recommendation.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/client/workshop?talent=${encodeURIComponent(recommendation.id)}`}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:text-brand-500"
                    >
                      Open workspace →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {!isLoading && !error && data && data.recommendations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-600">
              Post a project or update your preferences to trigger fresh talent recommendations.
            </p>
          )}
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card flex flex-col gap-5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">Portfolio velocity</h2>
              <p className="mt-1 text-sm text-slate-600">Weekly story points delivered across all squads.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
              +12% vs last month
            </span>
          </header>
          <svg viewBox="0 0 100 100" className="h-48 w-full overflow-visible rounded-2xl bg-gradient-to-b from-white/90 to-white/60 p-4 text-brand-500">
            <defs>
              <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
              </linearGradient>
            </defs>
            <path d={`${velocityPath} L 100,100 L 0,100 Z`} fill="url(#velocityGradient)" stroke="none" />
            <path d={velocityPath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {velocitySeries.map((point, index) => {
              const maxValue = Math.max(...velocitySeries.map((p) => p.value));
              const x = (index / (velocitySeries.length - 1)) * 100;
              const y = 100 - (point.value / maxValue) * 90 - 5;
              return <circle key={point.label} cx={x} cy={y} r={2.1} fill="currentColor" />;
            })}
            <g className="text-[9px] font-medium text-slate-400">
              {velocitySeries.map((point, index) => {
                const x = (index / (velocitySeries.length - 1)) * 100;
                return (
                  <text key={point.label} x={x} y={98} textAnchor="middle">
                    {point.label}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="card flex flex-col gap-5">
          <header>
            <h2 className="text-lg font-display font-semibold text-slate-900">Budget & payment insights</h2>
            <p className="mt-1 text-sm text-slate-600">Track allocated spend, pending approvals, and runway.</p>
          </header>
          <div className="space-y-4">
            {budgetCategories.map((bucket) => (
              <div key={bucket.label} className="flex items-center gap-3">
                <div className="flex-1 rounded-full bg-slate-100">
                  <div
                    className={`flex h-3 items-center justify-end rounded-full bg-gradient-to-r ${bucket.color} px-2 text-[11px] font-semibold text-white`}
                    style={{ width: `${Math.min(100, (bucket.amount / 90000) * 100)}%` }}
                  >
                    {formatCurrency(bucket.amount)}
                  </div>
                </div>
                <span className="w-24 text-xs uppercase tracking-wide text-slate-500">{bucket.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500">
            NeuralGig estimates a 9% budget buffer if you approve the next milestone by Friday.
          </div>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {aiInsights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-white/70 bg-white/85 px-6 py-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]">
            <h3 className="text-sm font-semibold text-slate-900">{insight.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{insight.body}</p>
            <Link
              href="/client/workshop"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:text-brand-500"
            >
              {insight.action} →
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
