export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Legal</p>
        <h1 className="text-3xl font-semibold text-slate-900">Privacy policy</h1>
      </header>
      <article className="card grid gap-4 text-sm text-slate-700">
        <p>
          NeuralGig respects your privacy. This placeholder explains what data we collect, how it is used, and the controls
          available to clients and freelancers. Consult with legal counsel before publishing.
        </p>
      </article>
    </main>
  );
}
