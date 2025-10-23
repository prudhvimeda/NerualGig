"use client";

import Link from "next/link";
import { useApi } from "../../../lib/api";
import type { ClientProfile } from "../../../types/dashboard";

export default function ClientProfilePage() {
  const { data, error, isLoading } = useApi<ClientProfile>("/client/profile");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Profile</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Client profile</h1>
        <p className="mt-2 text-sm text-slate-600">Manage account details, billing preferences, and communication cadences.</p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading profile…</p>}
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Unable to reach the backend. Start the FastAPI server.
        </p>
      )}

      {data && (
        <section className="glass-section grid gap-6 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{data.name}</p>
              <p>{data.company}</p>
              <p className="text-slate-500">{data.email}</p>
              <p className="text-slate-500">{data.timezone}</p>
            </div>
            <div className="flex gap-4 text-xs uppercase tracking-wide text-slate-500">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-center">
                <p className="text-xl font-display text-slate-900">{data.teams}</p>
                <p>Active squads</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-center">
                <p className="text-xl font-display text-slate-900">{data.activeProjects}</p>
                <p>In-flight projects</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Preferences</h2>
            <p className="mt-3 text-slate-600">
              Hiring focus: <span className="font-semibold text-slate-900">{data.preferences.hiringFocus.join(", ")}</span>
            </p>
            <p className="text-slate-600">Communication: {data.preferences.communication}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Billing</h2>
            <div className="mt-3 grid gap-2 text-slate-600">
              <p>
                Currency: <span className="font-medium text-slate-900">{data.billing.currency}</span>
              </p>
              <p>Payment method: {data.billing.paymentMethod}</p>
              <p>Invoices on file: {data.billing.invoices}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/client/onboarding"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
            >
              Update profile
            </Link>
            <Link
              href="/client/payments"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
            >
              Manage billing
            </Link>
          </div>
        </section>
      )}

      {!isLoading && !error && !data && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
          No profile data available yet. Complete onboarding to populate your workspace preferences.
        </p>
      )}
    </main>
  );
}
