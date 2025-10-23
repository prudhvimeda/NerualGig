"use client";

const modules = [
  {
    title: "Project Command Center",
    description: "Monitor every project from one view: status, squad availability, milestone health, and real-time updates from NeuralGig copilots.",
    tags: ["Timeline", "Milestones", "Squad health"],
  },
  {
    title: "AI Match Studio",
    description: "Benchmark proposed freelancers, view match rationale, and invite the perfect team with a single click.",
    tags: ["Match score", "Case studies", "Invite"],
  },
  {
    title: "Collaboration Hub",
    description: "Chat, share files, and review designs in a secure thread with AI-generated summaries and follow-ups.",
    tags: ["Chat", "Files", "Summaries"],
  },
  {
    title: "Milestone Console",
    description: "Approve deliverables, release payments, and forecast burn with intelligent alerts before deadlines slip.",
    tags: ["Approvals", "Payments", "Forecast"],
  },
  {
    title: "Insights & Budgeting",
    description: "Visual dashboards track spend vs timeline, quality metrics, and portfolio velocities across squads.",
    tags: ["Analytics", "Budget", "Efficiency"],
  },
];

const quickAutomations = [
  "Draft milestone plan",
  "Sync with finance",
  "Generate talent brief",
  "Share weekly digest",
];

export default function ClientWorkspacePage() {
  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Client workspace</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Control center</h1>
        <p className="text-sm text-slate-600">
          Oversee projects, collaborate with squads, and orchestrate payments with a glassy cockpit that keeps every stakeholder aligned.
        </p>
      </header>

      <section className="glass-section grid gap-6 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-semibold text-slate-900">Project Overview Suite</h2>
          <p className="text-sm text-slate-600">
            See status, squad capacity, and risk indicators for every engagement. The overview suite highlights blockers, upcoming approvals,
            and AI recommendations so you stay ahead of deadlines.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {["Live status", "Escalations", "Squad health"].map((chip) => (
              <span key={chip} className="rounded-full bg-brand-50 px-3 py-1 text-brand-600">
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white px-6 py-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Automations</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            {quickAutomations.map((automation) => (
              <li key={automation} className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                {automation}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass-section grid gap-4 text-sm text-slate-600">
        <h2 className="text-lg font-display font-semibold text-slate-900">Workspace modules</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <div key={module.title} className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-5 shadow-sm transition hover:shadow-lg">
              <h3 className="text-sm font-semibold text-slate-900">{module.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                {module.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-section grid gap-4 text-sm text-slate-600">
        <h2 className="text-lg font-display font-semibold text-slate-900">Templates & rituals</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              title: "Project intake",
              items: ["Scoping questionnaire", "Budget calculator", "Legal check"],
            },
            {
              title: "Weekly ops",
              items: ["AI stand-up recap", "Squad scorecard", "Action items"],
            },
            {
              title: "Stakeholder comms",
              items: ["Executive digest", "Roadmap update", "Risk summary"],
            },
          ].map((template) => (
            <div key={template.title} className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{template.title}</h3>
              <ul className="mt-3 space-y-1 text-xs">
                {template.items.map((item) => (
                  <li key={item} className="rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
