"use client";

import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { useApi, apiBase } from "../../../lib/api";
import type { ProjectApplication } from "../../../types/dashboard";

export default function FreelancerApplicationsPage() {
  const { data, error, isLoading, mutate } = useApi<ProjectApplication[]>("/freelancer/applications");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      await axios.post(`${apiBase}/freelancer/applications/withdraw`, { applicationId });
      await mutate();
    } catch (withdrawError) {
      console.error(withdrawError);
      alert("Unable to withdraw this application right now. Please ensure the API server is running.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Applications</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Your proposals</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track application status, schedule interviews, and receive client updates in one workspace.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading applications...</p>}
      {error && <p className="text-sm text-red-500">Unable to reach the backend. Start the FastAPI server.</p>}

      <div className="grid gap-4">
        {data?.map((application) => (
          <div key={application.id} className="card flex flex-col gap-2">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{application.projectName}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {application.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Submitted {new Date(application.submittedAt).toLocaleString(undefined, { dateStyle: "medium" })}
            </p>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/freelancer/workshop?project=${encodeURIComponent(application.projectName)}`}
                className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-400"
              >
                Open workspace
              </Link>
              <button
                onClick={() => handleWithdraw(application.id)}
                disabled={withdrawingId === application.id}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {withdrawingId === application.id ? "Withdrawing…" : "Withdraw application"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
