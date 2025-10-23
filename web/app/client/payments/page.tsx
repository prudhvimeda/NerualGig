"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useApi, apiBase } from "../../../lib/api";
import type { ClientPaymentSchedule } from "../../../types/dashboard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const statusColors: Record<ClientPaymentSchedule["milestones"][number]["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  released: "bg-emerald-50 text-emerald-600",
  "in-review": "bg-brand-50 text-brand-600",
};

export default function ClientPaymentsPage() {
  const { data, error, isLoading, mutate } = useApi<ClientPaymentSchedule[]>("/client/payments");
  const [releasingKey, setReleasingKey] = useState<string | null>(null);

  const handleExport = useCallback((schedule: ClientPaymentSchedule) => {
    const payload = {
      projectId: schedule.projectId,
      projectName: schedule.projectName,
      totalBudget: schedule.totalBudget,
      generatedAt: new Date().toISOString(),
      milestones: schedule.milestones,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${schedule.projectId}-ledger.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleRelease = useCallback(
    async (projectId: string, milestoneName: string) => {
      const key = `${projectId}:${milestoneName}`;
      setReleasingKey(key);
      try {
        await axios.post(`${apiBase}/client/payments/release`, { projectId, milestoneName });
        await mutate();
      } catch (releaseError) {
        console.error(releaseError);
        alert("Unable to release funds right now. Please ensure the API server is running.");
      } finally {
        setReleasingKey(null);
      }
    },
    [mutate],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Payments</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Milestone escrow</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review escrow schedules, release funds as deliverables are approved, and maintain a clear audit trail across every engagement.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading payment schedules…</p>}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Unable to reach the backend. Start the FastAPI server.
        </p>
      )}

      <div className="grid gap-6">
        {data?.map((schedule) => (
          <section key={schedule.projectId} className="card flex flex-col gap-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-900">{schedule.projectName}</h2>
                <p className="text-sm text-slate-600">{formatCurrency(schedule.totalBudget)} total budget</p>
              </div>
              <button
                onClick={() => handleExport(schedule)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                Export ledger
              </button>
            </header>
            <div className="grid gap-3">
              {schedule.milestones.map((milestone) => {
                const badgeClass = statusColors[milestone.status] ?? "bg-slate-100 text-slate-600";
                const isPending = milestone.status === "pending";
                return (
                  <div
                    key={`${schedule.projectId}-${milestone.name}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm transition hover:border-brand-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{milestone.name}</p>
                      <p className="text-xs text-slate-500">Due {formatDate(milestone.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-700">{formatCurrency(milestone.amount)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
                        {milestone.status}
                      </span>
                      {isPending && (
                        <button
                          onClick={() => handleRelease(schedule.projectId, milestone.name)}
                          disabled={releasingKey === `${schedule.projectId}:${milestone.name}`}
                          className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-200"
                        >
                          Release funds
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {!isLoading && !error && data && data.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
          When you approve milestones and set escrow schedules, they will show up here for real-time tracking.
        </p>
      )}
    </main>
  );
}
