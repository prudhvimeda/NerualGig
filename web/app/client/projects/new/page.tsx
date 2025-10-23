"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { FormEvent, useState } from "react";
import { apiBase } from "../../../../lib/api";

type SkillEntry = {
  name: string;
  level: number;
};

type FormState = {
  projectId: string;
  title: string;
  summary: string;
  hoursNeeded: number;
  budget: number;
  allowGroup: boolean;
};

type DerivedProject = {
  formValues: FormState;
  skills: SkillEntry[];
  tools: string[];
};

type Feedback = {
  variant: "success" | "error";
  text: string;
};

type MatchProfile = {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  photo: string;
  tags: string[];
  group: "solo" | "squad";
  availability: string;
  description: string;
  rate: number;
  successes: number;
  pitch: string;
};

const SAMPLE_PROMPTS = [
  "We need a squad to design and ship an AI analytics dashboard for marketing leaders. Budget around $40k, 6 week timeline, integrate with Snowflake and ship a polished Next.js UI.",
  "Build an onboarding copilot for our support team. Prototype a FastAPI backend with a simple React front-end, strong prompt-engineering experience required. Target budget 18k and launch in four weeks.",
  "Modernize our legacy Django app with a serverless AWS stack, add a streaming data pipeline, and refresh the Tailwind UI. Need data + full-stack duo for roughly 10 weeks, $85k budget.",
];

const SKILL_KEYWORDS = [
  "python",
  "react",
  "next.js",
  "typescript",
  "javascript",
  "fastapi",
  "langchain",
  "graphql",
  "tailwind",
  "aws",
  "gcp",
  "azure",
  "kubernetes",
  "docker",
  "supabase",
  "postgres",
  "sql",
  "pandas",
  "pytorch",
  "tensorflow",
  "ml ops",
  "data engineering",
  "ui design",
  "ux design",
  "figma",
  "devops",
  "product management",
];

const TOOL_KEYWORDS = [
  "figma",
  "notion",
  "jira",
  "slack",
  "supabase",
  "snowflake",
  "vercel",
  "aws",
  "gcp",
  "azure",
  "langchain",
  "openai",
  "ollama",
  "hugging face",
  "fastapi",
  "next.js",
  "redis",
  "postgres",
];

const DEFAULT_FORM_STATE: FormState = {
  projectId: "",
  title: "",
  summary: "",
  hoursNeeded: 40,
  budget: 20000,
  allowGroup: true,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || `proj-${Math.floor(Date.now() / 1000)}`;

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      if (word.length <= 2) return word.toUpperCase();
      if (word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

function parseProjectPrompt(prompt: string): DerivedProject {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("Please describe your project so we can draft the details.");
  }

  const firstSentence =
    cleanPrompt.split(/[\n.!?]/).map((segment) => segment.trim()).find((segment) => segment.length > 0) ?? cleanPrompt;
  let title = firstSentence
    .replace(/^(i\s+need|we\s+need|looking\s+for|seeking|need\s+help\s+with|need\s+an?|build|create|develop|modernize)\s+/i, "")
    .replace(/^to\s+/i, "")
    .trim();
  if (!title) {
    title = "New NeuralGig Project";
  }
  if (title.length > 80) {
    const words = title.split(" ");
    let shortened = "";
    for (const word of words) {
      if ((shortened + " " + word).trim().length > 60) {
        break;
      }
      shortened = shortened ? `${shortened} ${word}` : word;
    }
    if (shortened) {
      title = shortened;
    }
  }
  title = toTitleCase(title.replace(/\.$/, ""));

  const projectId = slugify(title);

  let budget = 20000;
  const budgetMatch =
    cleanPrompt.match(
      /(?:budget|cost|spend|up to|around|approximately|about)\s*(?:is|of|=|around|about|approximately)?\s*(?:\$|usd)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|m|million|thousand)?/i,
    ) || cleanPrompt.match(/(?:\$|usd)\s*(\d[\d,]*(?:\.\d+)?)\s*(k|m|million|thousand)?/i);
  if (budgetMatch) {
    let amount = parseFloat((budgetMatch[1] ?? "0").replace(/,/g, ""));
    const magnitude = (budgetMatch[2] ?? "").toLowerCase();
    if (!Number.isNaN(amount)) {
      if (magnitude === "k" || magnitude === "thousand") amount *= 1000;
      if (magnitude === "m" || magnitude === "million") amount *= 1_000_000;
      budget = Math.max(1000, Math.round(amount));
    }
  }

  let hoursNeeded = 40;
  const hoursMatch = cleanPrompt.match(/(\d+)\s*(?:hours|hrs|hr|h)\b/i);
  const weeksMatch = cleanPrompt.match(/(\d+)\s*(?:weeks|week|wk|wks)\b/i);
  const daysMatch = cleanPrompt.match(/(\d+)\s*(?:days|day)\b/i);
  if (hoursMatch) {
    hoursNeeded = clamp(parseInt(hoursMatch[1] ?? "0", 10), 1, 2000);
  } else if (weeksMatch) {
    hoursNeeded = clamp(parseInt(weeksMatch[1] ?? "0", 10) * 40, 40, 2000);
  } else if (daysMatch) {
    hoursNeeded = clamp(parseInt(daysMatch[1] ?? "0", 10) * 6, 24, 2000);
  }

  let allowGroup = true;
  if (/\b(solo|individual contributor|single freelancer|one person)\b/i.test(cleanPrompt)) {
    allowGroup = false;
  } else if (/\b(squad|team|multiple freelancers|blended squad|pod)\b/i.test(cleanPrompt)) {
    allowGroup = true;
  }

  const skillSet = new Map<string, SkillEntry>();
  for (const keyword of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(".", "\\.")}\\b`, "i");
    if (regex.test(cleanPrompt)) {
      const levelRegex = new RegExp(`${keyword}\\D*(\\d)`, "i");
      const levelMatch = cleanPrompt.match(levelRegex);
      let level = 3;
      if (levelMatch) {
        level = clamp(parseInt(levelMatch[1] ?? "3", 10), 1, 5);
      } else if (/\b(expert|senior|advanced)\b/i.test(cleanPrompt)) {
        level = 4;
      }
      const label = toTitleCase(keyword);
      skillSet.set(label.toLowerCase(), { name: label, level });
    }
  }

  const stackMatch =
    cleanPrompt.match(/(?:stack|tools?|tech|frameworks?)\s*(?:include|is|are|:)?\s*([a-z0-9 ,/&+\-]+)/i)?.[1] ?? "";
  if (stackMatch) {
    stackMatch
      .split(/[,/|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const label = toTitleCase(item);
        if (!skillSet.has(label.toLowerCase())) {
          skillSet.set(label.toLowerCase(), { name: label, level: 3 });
        }
      });
  }

  if (skillSet.size === 0) {
    skillSet.set("product strategy", { name: "Product Strategy", level: 3 });
    skillSet.set("executive communication", { name: "Executive Communication", level: 3 });
  }

  const toolSet = new Map<string, string>();
  for (const keyword of TOOL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(".", "\\.")}\\b`, "i");
    if (regex.test(cleanPrompt.toLowerCase())) {
      const label = toTitleCase(keyword);
      toolSet.set(label.toLowerCase(), label);
    }
  }
  if (stackMatch) {
    stackMatch
      .split(/[,/|]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const label = toTitleCase(item);
        toolSet.set(label.toLowerCase(), label);
      });
  }

  return {
    formValues: {
      projectId,
      title,
      summary: cleanPrompt,
      hoursNeeded,
      budget,
      allowGroup,
    },
    skills: Array.from(skillSet.values()),
    tools: Array.from(toolSet.values()),
  };
}

function skillEntriesToMap(skills: SkillEntry[]): Record<string, number> {
  return skills.reduce<Record<string, number>>((acc, skill) => {
    const key = slugify(skill.name).replace(/^proj-/, "") || skill.name.toLowerCase();
    acc[key] = clamp(skill.level, 1, 5);
    return acc;
  }, {});
}

export default function PostProjectPage() {
  const [prompt, setPrompt] = useState("");
  const [formValues, setFormValues] = useState<FormState>(DEFAULT_FORM_STATE);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [newTool, setNewTool] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<MatchProfile | null>(null);
  const handleCloseProfile = () => setSelectedProfile(null);

  const hasDraft = Boolean(formValues.title);

  const buildMatches = ({
    projectTitle,
    allowGroup,
    currentSkills,
    currentTools,
  }: {
    projectTitle: string;
    allowGroup: boolean;
    currentSkills: SkillEntry[];
    currentTools: string[];
  }): MatchProfile[] => {
    const primarySkill = currentSkills[0]?.name ?? "AI Strategy";
    const secondarySkill = currentSkills[1]?.name ?? "Full Stack Engineering";
    const primaryTool = currentTools[0] ?? "Next.js";
    const secondaryTool = currentTools[1] ?? "LangChain";
    const sanitizedTitle = projectTitle || "your initiative";

    const solo: MatchProfile = {
      id: "tal-401",
      name: "Amelia Ortiz",
      role: "Lead AI Product Architect",
      matchScore: 94,
      photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
      tags: [primarySkill, primaryTool],
      group: "solo",
      availability: "Available next week",
      description: `Specializes in launching ${sanitizedTitle.toLowerCase()} playbooks with measurable ROI.`,
      rate: 165,
      successes: 28,
      pitch: "Refined the go-to-market for an enterprise analytics platform with 18% faster rollouts while mentoring a dual-track squad.",
    };

    const blended: MatchProfile = {
      id: "squad-208",
      name: "Velocity Pod",
      role: "Blended squad · Product + Platform",
      matchScore: 91,
      photo: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80",
      tags: [primaryTool, secondaryTool, "Design Ops"],
      group: "squad",
      availability: "Kickoff in 10 days",
      description: "Product designer, full-stack lead, and ML engineer aligned to shipping dual-track discovery.",
      rate: 490,
      successes: 12,
      pitch: "Combines design research, platform engineering, and ML experimentation to stand up AI-native experiences in under eight weeks.",
    };

    const specialist: MatchProfile = {
      id: "tal-527",
      name: "Miles Chen",
      role: "Platform Engineer · Realtime Systems",
      matchScore: 88,
      photo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
      tags: [secondarySkill, "Infra", "Observability"],
      group: "solo",
      availability: "Part-time immediately",
      description: "Ships resilient infra with telemetry-first workflows and tight communication cadences.",
      rate: 145,
      successes: 19,
      pitch: "Scaled realtime streaming pipelines for fintech clients, weaving in guardrails and cost controls.",
    };

    return allowGroup ? [solo, blended, specialist] : [solo, specialist];
  };

  const handleGenerateDraft = () => {
    try {
      const derived = parseProjectPrompt(prompt);
      setFormValues(derived.formValues);
      setSkills(derived.skills);
      setTools(derived.tools);
      setFeedback({
        variant: "success",
        text: "Draft generated. Review the details below and adjust anything before posting.",
      });
      setMatches([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read the prompt. Please try again.";
      setFeedback({ variant: "error", text: message });
    }
  };

  const handleReset = () => {
    setPrompt("");
    setFormValues(DEFAULT_FORM_STATE);
    setSkills([]);
    setTools([]);
    setNewSkill("");
    setNewSkillLevel(3);
    setNewTool("");
    setFeedback(null);
    setMatches([]);
  };

  const updateFormValue = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    if (skills.some((skill) => skill.name.toLowerCase() === normalized)) {
      setFeedback({ variant: "error", text: "That skill is already listed. Adjust the level if needed." });
      return;
    }
    setSkills((prev) => [...prev, { name: toTitleCase(value), level: clamp(newSkillLevel, 1, 5) }]);
    setNewSkill("");
    setNewSkillLevel(3);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillLevelChange = (index: number, level: number) => {
    setSkills((prev) =>
      prev.map((skill, i) => (i === index ? { ...skill, level: clamp(level, 1, 5) } : skill)),
    );
  };

  const handleAddTool = () => {
    const value = newTool.trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    if (tools.some((tool) => tool.toLowerCase() === normalized)) {
      setFeedback({ variant: "error", text: "That tool is already listed." });
      return;
    }
    setTools((prev) => [...prev, toTitleCase(value)]);
    setNewTool("");
  };

  const handleRemoveTool = (index: number) => {
    setTools((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasDraft) {
      setFeedback({ variant: "error", text: "Describe your project and generate a draft first." });
      return;
    }

    const requiredSkills = skillEntriesToMap(skills);
    if (Object.keys(requiredSkills).length === 0) {
      setFeedback({ variant: "error", text: "Add at least one skill so we can match the right talent." });
      return;
    }

    const title = formValues.title.trim();
    if (!title) {
      setFeedback({ variant: "error", text: "Please provide a project title." });
      return;
    }

    const projectId = (formValues.projectId || slugify(title)).trim();
    const payload = {
      project_id: projectId,
      title,
      hours_needed: Math.max(1, Math.round(formValues.hoursNeeded)),
      budget: Math.max(1000, Math.round(formValues.budget)),
      allow_group: formValues.allowGroup,
      required_skills: requiredSkills,
      preferred_tools: tools,
    };

    const generatedMatches = buildMatches({
      projectTitle: title,
      allowGroup: formValues.allowGroup,
      currentSkills: skills,
      currentTools: tools,
    });

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await axios.post(`${apiBase}/client/projects`, payload);
      setMatches(generatedMatches);
      setFeedback({
        variant: "success",
        text: "Project posted successfully. The matching engine will begin triaging candidates shortly.",
      });
      setSelectedProfile(null);
      setFormValues(DEFAULT_FORM_STATE);
      setSkills([]);
      setTools([]);
      setPrompt("");
    } catch (error) {
      console.error(error);
      setMatches(generatedMatches);
      setFeedback({
        variant: "error",
        text: "We staged the project locally, but the API couldn’t be reached. Start the FastAPI server (and Ollama) to sync this brief.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Post a Project</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Describe what you need, we&apos;ll handle the rest</h1>
        <p className="mt-2 text-sm text-slate-600">
          Drop a simple prompt in plain language. We&apos;ll translate it into a structured brief, suggest key skills, and send it to the
          NeuralGig matching engine.
        </p>
      </header>

      <section className="glass-section grid gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="project-prompt" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tell us about the project
          </label>
          <p className="text-xs text-slate-500">
            Mention timelines, budget, tooling, and whether you need a blended squad. We&apos;ll translate it into structured project data automatically.
          </p>
          <textarea
            id="project-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: We need a team to design and ship an AI-driven analytics dashboard for our marketing org..."
            className="min-h-[180px] rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-base leading-relaxed text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerateDraft}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-300/40 transition hover:bg-brand-400"
          >
            Generate project draft
          </button>
          {hasDraft && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
            >
              Start over
            </button>
          )}
        </div>
        <div className="grid gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Prompts we understand:</span>
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setPrompt(sample)}
              className="rounded-xl border border-transparent bg-white/70 px-3 py-2 text-left text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      {feedback && (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-600"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {hasDraft && (
        <form className="glass-section grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project title</label>
              <input
                value={formValues.title}
                onChange={(event) => updateFormValue("title", event.target.value)}
                className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project identifier</label>
              <input
                value={formValues.projectId}
                onChange={(event) => updateFormValue("projectId", event.target.value)}
                placeholder="auto-generated slug"
                className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-slate-500">Used internally to link milestones, payments, and applications.</p>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick summary</label>
              <textarea
                value={formValues.summary}
                onChange={(event) => updateFormValue("summary", event.target.value)}
                className="min-h-[120px] rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-slate-500">
                This isn&apos;t sent to the API yet, but it&apos;s handy when sharing the project with stakeholders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estimated budget (USD)
              <input
                type="number"
                min={1000}
                step={500}
                value={formValues.budget}
                onChange={(event) => updateFormValue("budget", Number(event.target.value))}
                className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estimated effort (hours)
              <input
                type="number"
                min={1}
                step={1}
                value={formValues.hoursNeeded}
                onChange={(event) => updateFormValue("hoursNeeded", Number(event.target.value))}
                className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formValues.allowGroup}
              onChange={(event) => updateFormValue("allowGroup", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            We&apos;re open to NeuralGig assembling a blended squad (design + engineering).
          </label>

          <section className="grid gap-3">
            <header>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key skills & depth</h2>
              <p className="text-xs text-slate-500">Adjust the list or levels so we can match the right specialists.</p>
            </header>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-semibold text-slate-900">{skill.name}</span>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    Depth
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={skill.level}
                      onChange={(event) => handleSkillLevelChange(index, Number(event.target.value))}
                      className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500"
                    />
                    <span className="text-slate-700">{skill.level}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm">
              <input
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                placeholder="Add another skill..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                Depth
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={newSkillLevel}
                  onChange={(event) => setNewSkillLevel(Number(event.target.value))}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-400"
              >
                Add skill
              </button>
            </div>
          </section>

          <section className="grid gap-3">
            <header>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Preferred tools & platforms</h2>
            </header>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, index) => (
                <span
                  key={`${tool}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(index)}
                    className="text-slate-400 transition hover:text-rose-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={newTool}
                onChange={(event) => setNewTool(event.target.value)}
                placeholder="Add a preferred tool (optional)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={handleAddTool}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                Add tool
              </button>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              {isSubmitting ? "Posting project…" : "Post project"}
            </button>
          </div>
        </form>
      )}
      {matches.length > 0 && (
        <section className="glass-section grid gap-6">
          <header className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">AI-matched talent</p>
            <h2 className="text-lg font-display font-semibold text-slate-900">Profiles ready to join this initiative</h2>
            <p className="text-sm text-slate-600">
              NeuralGig copilots compared availability, skills, and tooling preferences to surface the best-fit specialists and blended squads.
            </p>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {matches.map((profile) => (
              <div key={profile.id} className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:shadow-[0_34px_70px_-30px_rgba(15,23,42,0.55)]">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={profile.photo}
                    alt={profile.name}
                    width={600}
                    height={320}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      profile.group === "squad" ? "bg-emerald-500/80 text-white" : "bg-white/85 text-slate-700"
                    }`}
                  >
                    {profile.group === "squad" ? "Blended squad" : "Solo specialist"}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Match {profile.matchScore}%
                  </span>
                </div>
                <div className="flex flex-col gap-3 px-5 py-5 text-sm text-slate-600">
                  <div>
                    <p className="text-base font-display font-semibold text-slate-900">{profile.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{profile.role}</p>
                  </div>
                  <p>{profile.description}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                    {profile.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{profile.availability}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      className="font-semibold text-brand-500 transition hover:text-brand-400"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-dialog-title"
          onClick={handleCloseProfile}
        >
          <div
            className="relative flex w-full max-w-3xl flex-col gap-5 overflow-hidden rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseProfile}
              className="absolute right-5 top-5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
            >
              Close
            </button>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="sm:w-48">
                <div className="overflow-hidden rounded-3xl">
                  <Image src={selectedProfile.photo} alt={selectedProfile.name} width={400} height={400} className="h-48 w-full object-cover" />
                </div>
              </div>
              <div className="flex-1 space-y-3 text-sm text-slate-600">
                <div>
                  <h2 id="profile-dialog-title" className="text-2xl font-display font-semibold text-slate-900">
                    {selectedProfile.name}
                  </h2>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{selectedProfile.role}</p>
                </div>
                <p className="text-base text-slate-700">{selectedProfile.pitch}</p>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                    <p className="text-sm font-display font-semibold text-slate-900">{selectedProfile.matchScore}%</p>
                    <p className="uppercase tracking-wide">Match score</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                    <p className="text-sm font-display font-semibold text-slate-900">${selectedProfile.rate}/hr</p>
                    <p className="uppercase tracking-wide">Rate</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                    <p className="text-sm font-display font-semibold text-slate-900">{selectedProfile.successes}</p>
                    <p className="uppercase tracking-wide">Shipped projects</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
                    <p className="text-sm font-display font-semibold text-slate-900">{selectedProfile.availability}</p>
                    <p className="uppercase tracking-wide">Availability</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                  {selectedProfile.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <p>{selectedProfile.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseProfile}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                Maybe later
              </button>
              <Link
                href={selectedProfile.group === "squad" ? "/client/workshop?view=squad" : "/client/workshop?view=solo"}
                className="rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-400"
                onClick={handleCloseProfile}
              >
                Open workspace
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
