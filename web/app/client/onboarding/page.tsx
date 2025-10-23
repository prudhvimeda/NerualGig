"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDemoAuth } from "../../../components/demo-auth";

const steps = [
  { id: 1, title: "Company" },
  { id: 2, title: "Project needs" },
  { id: 3, title: "Budget & timeline" },
  { id: 4, title: "Review" },
];

const projectTypes = ["AI Platform", "Product Build", "Data/Analytics", "Design Sprint", "Maintenance", "Other"];
const teamSizes = ["Solo specialist", "2-3 person pod", "4-6 person squad", "Flexible" ];

export default function ClientOnboardingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([projectTypes[0], projectTypes[2]]);
  const [teamPreference, setTeamPreference] = useState(teamSizes[1]);
  const [budget, setBudget] = useState("$25k - $50k");
  const [timeline, setTimeline] = useState("Launch in 6-8 weeks");
  const { setRole } = useDemoAuth();

  useEffect(() => {
    setRole("client");
  }, [setRole]);

  const progress = useMemo(() => (activeStep / steps.length) * 100, [activeStep]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((value) => value !== type) : [...prev, type]));
  };

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Client Onboarding</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Tell us about your team and roadmap</h1>
        <p className="text-sm text-slate-600">
          We’ll personalize AI matches, project templates, and talent recommendations based on your answers.
        </p>
      </header>

      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur-xl">
        <div className="flex items-center justify-between text-sm font-medium text-slate-600">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  step.id === activeStep
                    ? "border-brand-400 bg-brand-50 text-brand-600"
                    : step.id < activeStep
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {step.id}
              </span>
              <span className="text-xs uppercase tracking-wide text-slate-500">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {activeStep === 1 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Company basics</h2>
            <p className="text-sm text-slate-600">Share the essentials so we can set up the right billing and compliance workflows.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Company name
              <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Neuron Labs" />
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Industry
              <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Healthcare AI" />
            </label>
          </div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Project vision
            <textarea className="mt-2 min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Describe what success looks like for this initiative." />
          </label>
        </section>
      )}

      {activeStep === 2 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Project requirements</h2>
            <p className="text-sm text-slate-600">Pick the project types and talent that best match your roadmap.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {projectTypes.map((type) => {
              const active = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active ? "bg-brand-500 text-white shadow-sm" : "bg-white/80 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Ideal team size
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {teamSizes.map((option) => (
                <button
                  key={option}
                  onClick={() => setTeamPreference(option)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    option === teamPreference ? "border-brand-300 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>
        </section>
      )}

      {activeStep === 3 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Budget & timeline</h2>
            <p className="text-sm text-slate-600">We’ll use this to recommend milestones and engagement models.</p>
          </div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Budget range
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Timeline goals
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none"
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
            />
          </label>
        </section>
      )}

      {activeStep === 4 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Review & confirm</h2>
            <p className="text-sm text-slate-600">We’ll spin up a project workspace and share tailored talent matches.</p>
          </div>
          <div className="grid gap-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Project types</h3>
              <p className="mt-1 text-slate-600">{selectedTypes.join(" • ") || "Select at least one project type"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Team preference</h3>
              <p className="mt-1 text-slate-600">{teamPreference}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Budget & timeline</h3>
              <p className="mt-1 text-slate-600">{budget} • {timeline}</p>
            </div>
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40"
          onClick={() => setActiveStep((step) => Math.max(1, step - 1))}
          disabled={activeStep === 1}
        >
          Back
        </button>
        {activeStep < steps.length ? (
          <button
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-400"
            onClick={() => setActiveStep((step) => Math.min(steps.length, step + 1))}
          >
            Continue
          </button>
        ) : (
          <Link
            href="/client/dashboard"
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-400"
          >
            Launch client workspace
          </Link>
        )}
      </footer>
    </div>
  );
}
