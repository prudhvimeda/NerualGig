"use client";

import { FormEvent, useMemo, useState } from "react";
import axios from "axios";
import { AssistLayout } from "../../../components/assist-layout";
import { AnswerCard } from "../../../components/answer-card";
import { useModelSelector } from "../../../hooks/useModelSelector";
import { useApi, apiBase } from "../../../lib/api";

type LearningTrack = {
  focusRole: string;
  model: string;
  summary: string;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
};

type PlanBlock =
  | { type: "paragraph"; text: string }
  | { type: "unordered"; items: string[] }
  | { type: "ordered"; items: string[] };

type PlanSection = {
  title: string;
  blocks: PlanBlock[];
};

type ParsedPlan = {
  title?: string;
  sections: PlanSection[];
};

const parsePlan = (raw: string): ParsedPlan => {
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const plan: ParsedPlan = { sections: [] };
  let currentSection: PlanSection | null = null;

  const ensureSection = (title: string) => {
    if (currentSection && currentSection.title === title) {
      return currentSection;
    }
    currentSection = { title, blocks: [] };
    plan.sections.push(currentSection);
    return currentSection;
  };

  const pushListItem = (section: PlanSection, type: "unordered" | "ordered", text: string) => {
    const lastBlock = section.blocks[section.blocks.length - 1];
    if (lastBlock && lastBlock.type === type) {
      lastBlock.items.push(text);
    } else {
      section.blocks.push({ type, items: [text] });
    }
  };

  const headingMatchers = [
    /^Phase\s+/i,
    /^Continuous Improvement/i,
    /^Resources/i,
    /^Automation Hooks/i,
    /^Next Check-in/i,
  ];

  lines.forEach((line) => {
    if (!line) return;
    if (line.startsWith("========================")) return;
    if (line.startsWith("Learning Plan For")) {
      plan.title = line;
      return;
    }

    const heading = headingMatchers.find((regex) => regex.test(line));
    if (heading) {
      ensureSection(line);
      return;
    }

    if (line.startsWith("- ")) {
      const section = currentSection ?? ensureSection("Details");
      pushListItem(section, "unordered", line.slice(2));
      return;
    }

    const orderedMatch = line.match(/^(\d+)\.(.*)$/);
    if (orderedMatch) {
      const section = currentSection ?? ensureSection("Details");
      pushListItem(section, "ordered", orderedMatch[2].trim());
      return;
    }

    const indentedBullet = line.match(/^[*-]\s+(.*)$/);
    if (indentedBullet) {
      const section = currentSection ?? ensureSection("Details");
      pushListItem(section, "unordered", indentedBullet[1].trim());
      return;
    }

    const section = currentSection ?? ensureSection("Details");
    section.blocks.push({ type: "paragraph", text: line });
  });

  return plan;
};

const formatModelLabel = (value: string | undefined) => {
  if (!value) return "";
  return value === "qwen" ? "Qwen 2.5 (7B)" : value;
};

const ROLE_OPTIONS = [
  { value: "ai-engineer", label: "AI Engineer" },
  { value: "full-stack", label: "Full Stack Engineer" },
  { value: "ml-ops", label: "ML Ops Specialist" },
  { value: "product-designer", label: "Product Designer" },
  { value: "product-manager", label: "Product Manager" },
  { value: "project-manager", label: "Project Manager" },
  { value: "growth-marketer", label: "Growth Marketer" },
  { value: "customer-success", label: "Customer Success Lead" },
  { value: "operations-lead", label: "Operations Lead" },
];

export default function LearningCopilotPage() {
  const [role, setRole] = useState("ai-engineer");
  const [isGenerating, setIsGenerating] = useState(false);
  const { model, isHydrated } = useModelSelector();
  const endpoint = useMemo(() => `/freelancer/learning?role=${role}&model=${model}`, [role, model]);
  const { data, error, mutate } = useApi<LearningTrack>(endpoint);
  const parsedPlan = useMemo(() => (data ? parsePlan(data.summary) : null), [data]);

  const generatePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    try {
      await axios.post(`${apiBase}/freelancer/learning`, { role, model });
      await mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AssistLayout
      title="AI-personalized learning plans"
      description="Generate curated roadmaps leveraging open-source models via Ollama. Stay sharp for roles like AI engineer, full-stack architect, and more."
      rightRail={
        <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-card backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li>• Export learning plan</li>
            <li>• Share with engagement manager</li>
            <li>• Schedule mentoring session</li>
          </ul>
        </div>
      }
      showPromptBar
    >
      <form className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-card backdrop-blur-xl" onSubmit={generatePlan}>
        <label className="text-sm font-medium text-slate-700">
          Focus role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="ml-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={isGenerating}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-300/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-200"
        >
          {isGenerating ? "Generating..." : "Generate plan"}
        </button>
        <span className="text-xs text-slate-500">
          Model: {isHydrated ? formatModelLabel(model) : "Loading..."}
        </span>
      </form>

      {error && (
        <p className="rounded-3xl border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-500">
          Unable to retrieve learning plan. Ensure the backend and Ollama service are running.
        </p>
      )}

      {data && parsedPlan && (
        <AnswerCard
          heading={parsedPlan.title ?? `Learning Plan For ${data.focusRole}`}
          footnote={`Model · ${formatModelLabel(data.model)}`}
          body={
            <div className="space-y-4">
              <div className="space-y-6">
                {parsedPlan.sections.map((section) => (
                  <div key={section.title} className="rounded-3xl border border-white/60 bg-white/85 px-4 py-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">{section.title}</h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      {section.blocks.map((block, index) => {
                        if (block.type === "paragraph") {
                          return (
                            <p key={index} className="leading-relaxed">
                              {block.text}
                            </p>
                          );
                        }
                        if (block.type === "unordered") {
                          return (
                            <ul key={index} className="space-y-1 pl-4 text-slate-700">
                              {block.items.map((item, itemIndex) => {
                                const colonIndex = item.indexOf(":");
                                return (
                                  <li key={itemIndex} className="list-disc">
                                    {colonIndex > 0 ? (
                                      <>
                                        <span className="font-semibold text-slate-800">{item.slice(0, colonIndex + 1)}</span>{" "}
                                        {item.slice(colonIndex + 1).trim()}
                                      </>
                                    ) : (
                                      item
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }
                        return (
                          <ol key={index} className="space-y-1 pl-4 text-slate-700">
                            {block.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="list-decimal">
                                {item}
                              </li>
                            ))}
                          </ol>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Suggested Resources</h3>
                <ul className="mt-2 space-y-2">
                  {data.resources.map((resource) => (
                    <li key={resource.url}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
                      >
                        <span className="font-medium">{resource.title}</span>
                        <span className="text-xs uppercase tracking-wide text-slate-500">{resource.type}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          }
        />
      )}

      {!data && !error && (
        <div className="rounded-3xl border border-white/60 bg-white/75 p-6 text-sm text-slate-600 shadow-card">
          Choose a focus role and generate a plan to see AI-curated recommendations here.
        </div>
      )}
    </AssistLayout>
  );
}
