"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";
import { useDemoAuth } from "../components/demo-auth";

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
  const { status } = useSession();
  const [ctaLabel, setCtaLabel] = useState("Get Started");
  const { setRole } = useDemoAuth();
  const router = useRouter();

  useEffect(() => {
    setCtaLabel(status === "authenticated" ? "Go to Dashboard" : "Join NeuralGig");
  }, [status]);

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
              href="/auth/signup"
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

        <div className="card flex h-full flex-col justify-between gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Instant actions</h2>
            <p className="mt-2 text-sm text-slate-600">
              Connect Google or GitHub to jump into the console, sync project briefs, and spin up scoped squads with
              AI-assisted matches.
            </p>
          </div>
          <div className="grid gap-3">
            <button
              className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/60"
              onClick={() => signIn("google")}
            >
              Continue with Google
            </button>
            <button
              className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/60"
              onClick={() => signIn("github")}
            >
              Continue with GitHub
            </button>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-600"
                onClick={() => {
                  setRole("client");
                router.push("/client/onboarding");
                }}
              >
                Continue as Demo Client
              </button>
              <button
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
                onClick={() => {
                  setRole("freelancer");
                router.push("/freelancer/onboarding");
                }}
              >
                Continue as Demo Freelancer
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">SSO required for production environments. Sandbox mode available.</p>
        </div>
      </section>
    </main>
  );
}
