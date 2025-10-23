"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApi } from "../../../lib/api";
import type { ClientApplication } from "../../../types/dashboard";

const statusStyles: Record<ClientApplication["status"], string> = {
  new: "bg-brand-50 text-brand-600",
  reviewing: "bg-amber-50 text-amber-600",
  accepted: "bg-emerald-50 text-emerald-600",
  rejected: "bg-rose-50 text-rose-600",
};

export default function ClientApplicationsPage() {
  const { data, error, isLoading } = useApi<ClientApplication[]>("/client/applications");

  const sortedApplications = useMemo(
    () =>
      data
        ?.slice()
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [data],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Applications</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Talent applications</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review proposals, trigger interviews, and share feedback directly with NeuralGig curated squads.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading applications…</p>}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Unable to reach the backend. Start the FastAPI server.
        </p>
      )}

      <div className="grid gap-4">
        {sortedApplications?.map((application) => {
          const statusClass = statusStyles[application.status];
          return (
            <article key={application.id} className="card flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-display font-semibold text-slate-900">{application.projectName}</h2>
                  <p className="text-sm text-slate-600">
                    Submitted {new Date(application.submittedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
                  {application.status}
                </span>
              </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/client/workshop?project=${encodeURIComponent(application.id)}`}
                className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-400"
              >
                Open workspace
              </Link>
              <a
                href={`mailto:success@neuralgig.dev?subject=${encodeURIComponent(`Feedback on ${application.projectName}`)}`}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                Share feedback
              </a>
            </div>
            </article>
          );
        })}
      </div>

      {!isLoading && !error && sortedApplications && sortedApplications.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
          Once talent submits proposals for your briefs, they will appear here for review.
        </p>
      )}
    </main>
  );
}
