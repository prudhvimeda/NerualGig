"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDemoAuth } from "../../../components/demo-auth";

const steps = [
  { id: 1, title: "Account setup" },
  { id: 2, title: "Skills & expertise" },
  { id: 3, title: "Preview" },
];

const skillTags = [
  "AI Engineering",
  "Full Stack",
  "Data Science",
  "Product Design",
  "DevOps",
  "Generative AI",
  "Mobile",
  "Research",
];

export default function FreelancerOnboardingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["AI Engineering", "Generative AI"]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(["Lead AI Engineer"]);
  const { setRole } = useDemoAuth();

  useEffect(() => {
    setRole("freelancer");
  }, [setRole]);

  const progress = useMemo(() => (activeStep / steps.length) * 100, [activeStep]);

  const toggleValue = (value: string, state: string[], setter: (next: string[]) => void) => {
    setter(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Freelancer Onboarding</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Design your NeuralGig workspace</h1>
        <p className="text-sm text-slate-600">
          Tell us about your skills and project preferences so the AI copilot can match you to the best projects.
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
            <h2 className="text-lg font-display font-semibold text-slate-900">Introduce yourself</h2>
            <p className="text-sm text-slate-600">You can edit everything later from your profile settings.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Full name
              <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Jordan Harper" />
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Headline
              <input className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Lead AI Engineer" />
            </label>
          </div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Short bio
            <textarea className="mt-2 min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none" placeholder="Share recent wins, industries, or favorite problems to solve." />
          </label>
        </section>
      )}

      {activeStep === 2 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">What are your core skills?</h2>
            <p className="text-sm text-slate-600">Select at least three tags so the AI copilot understands your focus.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleValue(skill, selectedSkills, setSelectedSkills)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active ? "bg-brand-500 text-white shadow-sm" : "bg-white/80 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Preferred roles
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none"
              placeholder="Lead AI Engineer, Prompt Engineer"
              value={preferredRoles.join(", ")}
              onChange={(event) => setPreferredRoles(event.target.value.split(",").map((value) => value.trim()).filter(Boolean))}
            />
          </label>
        </section>
      )}

      {activeStep === 3 && (
        <section className="card grid gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Review your profile snapshot</h2>
            <p className="text-sm text-slate-600">We’ll generate a curated match list and learning path once you confirm.</p>
          </div>
          <div className="grid gap-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Skills & focus</h3>
              <p className="mt-1 text-slate-600">{selectedSkills.join(" • ") || "Add at least three skills"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Preferred roles</h3>
              <p className="mt-1 text-slate-600">{preferredRoles.join(", ") || "Add preferred roles"}</p>
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
            href="/freelancer/dashboard"
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-400"
          >
            Launch freelancer workspace
          </Link>
        )}
      </footer>
    </div>
  );
}
