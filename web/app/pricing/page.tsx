export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      features: ["Unlimited proposals", "AI learning copilot", "Client messaging"],
    },
    {
      name: "Scale",
      price: "$299",
      features: ["Dedicated success manager", "Advanced analytics", "Custom compliance"],
    },
    {
      name: "Enterprise",
      price: "Let's talk",
      features: ["Private curated bench", "Onsite kickoff support", "Custom security reviews"],
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="text-center">
        <p className="text-sm uppercase tracking-wide text-slate-400">Pricing</p>
        <h1 className="mt-2 text-4xl font-display font-semibold text-slate-100">Pick the plan that scales with your product</h1>
        <p className="mt-3 text-sm text-slate-300">
          Clients only pay when projects kick off. Freelancers keep 100% of their rate and can opt in to premium benefits.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="card flex flex-col gap-4">
            <h2 className="text-lg font-display font-semibold text-slate-100">{tier.name}</h2>
            <p className="text-3xl font-display font-semibold text-slate-100">{tier.price}</p>
            <ul className="grid gap-2 text-sm text-slate-300">
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-brand-400">Select</button>
          </article>
        ))}
      </section>
    </main>
  );
}
