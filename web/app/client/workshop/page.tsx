"use client";

const discoveryTracks = [
  {
    title: "Opportunity framing",
    description: "Align stakeholders on desired outcomes, constraints, and AI leverage points before scoping sprints.",
    actions: ["Workshop canvas", "Stakeholder interviews", "AI risk/benefit heatmap"],
  },
  {
    title: "Research synthesis",
    description: "Aggregate qualitative + quantitative signals, then let NeuralGig summarize themes and blockers.",
    actions: ["Upload call transcripts", "Generate insights", "Share executive brief"],
  },
  {
    title: "Experiment backlog",
    description: "Plan rapid experiments with clear hypotheses, success metrics, and owner accountability.",
    actions: ["Prioritize backlog", "Assign squad", "Auto-build dashboards"],
  },
];

const workshopLanes = [
  {
    name: "Discovery lane",
    checkpoints: [
      "Kickoff canvas with goals & anti-goals",
      "Upload prior research for AI summary",
      "Identify fast-learning experiments",
    ],
  },
  {
    name: "Delivery lane",
    checkpoints: [
      "Define milestone gates & acceptance criteria",
      "Assign squads + availability",
      "Connect tooling: Linear, Slate, Loom",
    ],
  },
  {
    name: "Insight lane",
    checkpoints: [
      "Schedule weekly readouts",
      "Enable automatic sentiment recap",
      "Publish ROI + burn-down overview",
    ],
  },
];

const researchBacklog = [
  {
    title: "Customer health feed",
    summary: "AI rolled up 12 support escalations into 3 root themes. Review before Tuesday’s exec sync.",
    tags: ["Sentiment", "Support", "AI summary"],
  },
  {
    title: "Launch readiness checklist",
    summary: "Design QA and analytics instrumentation are 80% complete. Two blockers need decisions.",
    tags: ["Design", "Analytics", "Risk"],
  },
  {
    title: "Expansion play",
    summary: "NeuralGig suggests bundling onboarding + success squads to upsell pilot clients next quarter.",
    tags: ["Revenue", "Strategy", "AI insight"],
  },
];

const integrationStreams = [
  {
    title: "Source",
    description: "Connect Jira, Linear, and Notion to import work streams with NeuralGig auto-tagging squads.",
    tags: ["Jira", "Linear", "Notion"],
  },
  {
    title: "Signal",
    description: "Ingest Slack, email, and Loom to detect tone shifts, unanswered threads, and decision gaps.",
    tags: ["Slack", "Gmail", "Loom"],
  },
  {
    title: "Finance",
    description: "Sync NetSuite, Stripe, and QuickBooks so payouts reconcile automatically.",
    tags: ["NetSuite", "Stripe", "QuickBooks"],
  },
  {
    title: "Security",
    description: "Pipe alerts from Vanta, Drata, and SOC dashboards directly into your executive pulse.",
    tags: ["Vanta", "Drata", "SOC 2"],
  },
];

export default function ClientWorkshopPage() {
  return (
    <div className="flex min-h-full w-full flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Client workspace</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Strategy & research workshop</h1>
        <p className="text-sm text-slate-600">
          Orchestrate discovery, delivery, and insight loops in one control room. NeuralGig copilots translate business objectives into squad plans,
          experiments, and budget checks in minutes.
        </p>
      </header>

      <section className="glass-section grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-semibold text-slate-900">Discovery tracks</h2>
          <p className="text-sm text-slate-600">Mix and match tracks to move from opportunity framing to measurable delivery.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {discoveryTracks.map((track) => (
              <div key={track.title} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{track.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{track.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                  {track.actions.map((action) => (
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Workshop cues</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-700">
            <li>⌘ + Shift + P → Pull AI project pulse</li>
            <li>⌘ + Shift + M → Draft milestone canvas</li>
            <li>⌘ + Shift + B → Reveal budget forecast</li>
            <li>⌘ + Shift + S → Spin up stakeholder brief</li>
          </ul>
        </aside>
      </section>

      <section className="glass-section grid gap-4">
        <h2 className="text-lg font-display font-semibold text-slate-900">Workshop lanes</h2>
        <p className="text-sm text-slate-600">Keep discovery, delivery, and insight cadences in sync with reusable lane templates.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {workshopLanes.map((lane) => (
            <div key={lane.name} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{lane.name}</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {lane.checkpoints.map((item) => (
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
        <h2 className="text-lg font-display font-semibold text-slate-900">Research backlog</h2>
        <p className="text-sm text-slate-600">NeuralGig synthesizes signals so you can focus on executive decisions.</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {researchBacklog.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                {item.tags.map((tag) => (
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
        <h2 className="text-lg font-display font-semibold text-slate-900">Integration streams</h2>
        <p className="text-sm text-slate-600">Connect delivery, signals, and finance so AI copilots stay context-aware.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {integrationStreams.map((stream) => (
            <div key={stream.title} className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{stream.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{stream.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-brand-500">
                {stream.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                    {tag}
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
