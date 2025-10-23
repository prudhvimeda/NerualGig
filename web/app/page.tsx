"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

type Metric = {
  label: string;
  value: string;
};

const metrics: Metric[] = [
  { label: "Active Clients", value: "1.2K" },
  { label: "Verified Freelancers", value: "9.8K" },
  { label: "Projects Delivered", value: "24K" },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Link href="/" className="w-fit rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-display font-semibold text-slate-900 shadow-sm">
            🧠 NeuralGig
          </Link>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 shadow-sm">
            <SparklesIcon className="h-4 w-4" />
            AI Native Talent Marketplace
          </span>
          <h1 className="text-5xl font-display font-semibold leading-tight text-slate-900 md:text-6xl">
            Build{" "}
            <span className="bg-gradient-to-r from-brand-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              AI-native teams
            </span>{" "}
            in hours, not weeks.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            NeuralGig blends AI copilots with curated communities of builders. Launch scoped squads, orchestrate onboarding,
            and keep budgets aligned with milestone escrow — all from one glassy workspace.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Live matches every <strong className="font-semibold text-slate-900">12 minutes</strong>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
              Curated by <strong className="font-semibold text-slate-900">AI + experts</strong>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/launch"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400"
            >
              Launch your workspace <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-600"
            >
              Watch product tour
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="card">
                <span className="text-3xl font-display font-semibold text-slate-900">{metric.value}</span>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex h-full flex-col justify-between gap-6 bg-gradient-to-br from-brand-50 via-white to-indigo-50">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-display font-semibold text-slate-900">A single pane for every squad</h2>
            <p className="text-sm text-slate-600">
              Track milestones, surface AI recommendations, and review talent signals on a glassy command center tuned for distributed teams.
            </p>
            <div className="grid gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-8 w-8 rounded-full bg-brand-500/15 text-center text-sm font-semibold leading-8 text-brand-600">01</span>
                Live portfolio metrics &amp; burn-down charts
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-8 w-8 rounded-full bg-brand-500/15 text-center text-sm font-semibold leading-8 text-brand-600">02</span>
                AI copilots embedded in every workflow
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
                <span className="h-8 w-8 rounded-full bg-brand-500/15 text-center text-sm font-semibold leading-8 text-brand-600">03</span>
                One-click workspace creation for clients &amp; talent
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/80 px-4 py-3 text-xs text-slate-500 shadow-sm">
            Trusted by venture-backed scale-ups to orchestrate AI-native delivery with predictable velocity.
          </div>
        </div>
      </section>
    </main>
  );
}
