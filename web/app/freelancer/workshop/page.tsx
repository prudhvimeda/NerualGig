"use client";

const makerStations = [
  {
    title: "Build lane",
    description: "Spin up maker stations for code, product, and research tasks with AI copilots embedded in each step.",
    actions: ["Open repo workspace", "Review AI diff", "Request design feedback"],
  },
  {
    title: "Learning lane",
    description: "Pair learning objectives with active projects so every deliverable reinforces new skills.",
    actions: ["Launch micro-course", "Log practice reps", "Request mentor review"],
  },
  {
    title: "Story lane",
    description: "Capture artifacts, wins, and retros so NeuralGig can generate case studies for your portfolio.",
    actions: ["Upload artifact", "Summarize lesson", "Publish portfolio entry"],
  },
];

const craftPods = [
  {
    name: "Rapid prototyping pod",
    description: "Blend pair programming, AI diff review, and design QA for sprint spikes.",
    checklist: ["Open paired coding session", "Run test suite", "Capture demo clip"],
  },
  {
    name: "Research pod",
    description: "Use AI to summarize interviews, cluster insights, and draft opportunity briefs.",
    checklist: ["Upload transcript", "Tag insights", "Draft opportunity brief"],
  },
  {
    name: "Growth pod",
    description: "Track assessments, badges, and mentor feedback to sharpen your craft each month.",
    checklist: ["Schedule assessment", "Review feedback", "Update learning plan"],
  },
];

const practiceCatalog = [
  {
    title: "AI code lab",
    description: "Daily scenarios to improve retrieval augmented generation, evaluation harnesses, and guardrails.",
    resources: ["LangChain workflow kata", "Evaluation notebook", "Prompt refinery"],
  },
  {
    title: "Product storytelling",
    description: "Templates and prompts to turn project wins into polished portfolio narratives.",
    resources: ["Retro storyboard", "Case study outline", "AI editing assistant"],
  },
  {
    title: "Service design toolkit",
    description: "Orchestrate discovery assets, journey maps, and research ops to deliver richer insights.",
    resources: ["Interview kit", "Journey canvas", "Insight tagging"],
  },
];

const integrationStack = [
  {
    name: "Code",
    integrations: ["GitHub", "GitLab", "Bitbucket"],
    note: "NeuralGig annotates pull requests with AI test suggestions and refactor hints.",
  },
  {
    name: "Notes",
    integrations: ["Notion", "Obsidian", "Coda"],
    note: "Every note and retro can be summarized, tagged, and surfaced in future briefs.",
  },
  {
    name: "Comms",
    integrations: ["Slack", "Email", "Loom"],
    note: "Thread summaries, sentiment scores, and follow-up suggestions keep clients in the loop.",
  },
];

export default function FreelancerWorkshopPage() {
  return (
    <div className="flex min-h-full w/full flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Freelancer workspace</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Creator workshop</h1>
        <p className="text-sm text-slate-600">
          Switch between making, learning, and storytelling without losing momentum. NeuralGig keeps your craft pods, AI copilots, and
          portfolio artifacts connected.
        </p>
      </header>

      <section className="glass-section grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-semibold text-slate-900">Maker stations</h2>
          <p className="text-sm text-slate-600">Three lanes to guide your week: shipping work, leveling up, and capturing the story.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {makerStations.map((station) => (
              <div key={station.title} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{station.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{station.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                  {station.actions.map((action) => (
                    <span key={action} className="rounded-full bg-brand-50 px-3 py-1">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-brand-100 bg-brand-50/80 px-6 py-6 shadow-inner">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Quick actions</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-700">
            <li>⌘ + K → Launch command palette</li>
            <li>⌘ + Shift + L → Capture learning snippet</li>
            <li>⌘ + Shift + F → Open focus timer</li>
            <li>⌘ + Shift + U → Upload artifact to portfolio</li>
          </ul>
        </aside>
      </section>

      <section className="glass-section grid gap-4">
        <h2 className="text-lg font-display font-semibold text-slate-900">Craft pods</h2>
        <p className="text-sm text-slate-600">Pick a pod to orchestrate context switching between clients, learning, and community.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {craftPods.map((pod) => (
            <div key={pod.name} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{pod.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{pod.description}</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {pod.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-section grid gap-4">
        <h2 className="text-lg font-display font-semibold text-slate-900">Practice catalog</h2>
        <p className="text-sm text-slate-600">Curated loops to sharpen your craft alongside live client work.</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {practiceCatalog.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {item.resources.map((resource) => (
                  <li key={resource} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-section grid gap-4 text-sm text-slate-600">
        <h2 className="text-lg font-display font-semibold text-slate-900">Integration stack</h2>
        <p className="text-sm text-slate-600">NeuralGig keeps your favourite tools in sync and adds AI context on top.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {integrationStack.map((stream) => (
            <div key={stream.name} className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{stream.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{stream.note}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                {stream.integrations.map((tool) => (
                  <span key={tool} className="rounded-full bg-brand-50 px-3 py-1">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
