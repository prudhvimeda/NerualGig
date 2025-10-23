export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Legal</p>
        <h1 className="text-3xl font-semibold text-slate-900">Terms of service</h1>
      </header>
      <article className="card grid gap-4 text-sm text-slate-700">
        <p>
          This is a prototype document. Replace with finalized legal language before going into production. It outlines the
          rules for using NeuralGig as a client or freelancer, covering acceptable use, data ownership, and payment terms.
        </p>
      </article>
    </main>
  );
}
