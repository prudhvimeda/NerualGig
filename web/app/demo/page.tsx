export default function ProductDemoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Product tour</p>
        <h1 className="text-3xl font-semibold text-slate-900">Experience NeuralGig in action</h1>
        <p className="mt-2 text-sm text-slate-600">
          This interactive demo walks through client onboarding, AI matching, and freelancer experience. Replace with live
          Loom or customer footage in production.
        </p>
      </header>
      <section className="card min-h-[320px]">
        <p className="text-sm text-slate-600">
          Embed a video demo or product tour here. For now, use the dashboards in this prototype to explore the workflows for
          both sides of the marketplace.
        </p>
      </section>
    </main>
  );
}
