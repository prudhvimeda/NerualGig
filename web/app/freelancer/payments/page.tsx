"use client";

import { useCallback } from "react";
import { useApi } from "../../../lib/api";

type FreelancerPayment = {
  projectId: string;
  projectName: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "in-review" | "released" | "upcoming";
};

export default function FreelancerPaymentsPage() {
  const { data, error, isLoading } = useApi<FreelancerPayment[]>("/freelancer/payments");

const buildInvoiceHtml = (payment: FreelancerPayment) => {
  const issuedDate = new Date().toLocaleDateString();
  const dueDate = new Date(payment.dueDate).toLocaleDateString();
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Invoice - ${payment.projectName}</title>
    <style>
      body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
      .invoice { max-width: 720px; margin: 32px auto; background: #ffffff; border-radius: 24px; padding: 32px 40px; box-shadow: 0 24px 55px -30px rgba(15,23,42,0.35); }
      h1 { font-size: 28px; margin-bottom: 4px; }
      h2 { font-size: 20px; margin: 0; }
      p { margin: 4px 0; }
      .header { display: flex; justify-content: space-between; align-items: center; }
      .badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
      .paid { background: #ecfdf5; color: #047857; }
      .pending { background: #fff7ed; color: #c2410c; }
      .upcoming { background: #eff6ff; color: #1d4ed8; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { text-align: left; padding: 12px; font-size: 14px; }
      th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: #475569; }
      tbody tr:nth-child(even) { background: #f8fafc; }
      .total { font-size: 18px; font-weight: 600; margin-top: 24px; text-align: right; }
      .footer { margin-top: 32px; font-size: 12px; color: #475569; }
      .footer strong { color: #1d4ed8; }
    </style>
  </head>
  <body>
    <section class="invoice">
      <div class="header">
        <div>
          <h1>Invoice</h1>
          <p>Issued ${issuedDate}</p>
        </div>
        <div class="badge ${payment.status === "released" ? "paid" : payment.status === "in-review" ? "pending" : "upcoming"}">
          ${payment.status.replace("-", " ")}
        </div>
      </div>

      <div style="margin-top: 24px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <div>
          <h2>Bill to</h2>
          <p><strong>${payment.client}</strong></p>
          <p>NeuralGig Client Workspace</p>
        </div>
        <div>
          <h2>Project</h2>
          <p><strong>${payment.projectName}</strong></p>
          <p>Project ID: ${payment.projectId}</p>
        </div>
        <div>
          <h2>Dates</h2>
          <p>Due date: ${dueDate}</p>
          <p>Issued: ${issuedDate}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payment.projectName} milestone payout</td>
            <td>1</td>
            <td>$${payment.amount.toLocaleString()}</td>
            <td>$${payment.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="total">Total due: $${payment.amount.toLocaleString()}</div>

      <div class="footer">
        <p>Payments are processed securely via NeuralGig&apos;s escrow system. Release funds once deliverables meet acceptance criteria.</p>
        <p>Need help? Contact <strong>success@neuralgig.dev</strong></p>
      </div>
    </section>
  </body>
</html>`;
};

const handleViewInvoice = useCallback((payment: FreelancerPayment) => {
  const invoiceWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!invoiceWindow) {
    alert("Your browser blocked the invoice window. Please allow pop-ups for this site.");
    return;
  }
  invoiceWindow.document.write(buildInvoiceHtml(payment));
  invoiceWindow.document.close();
}, []);

const handleDownloadReceipt = useCallback((payment: FreelancerPayment) => {
  const html = buildInvoiceHtml(payment);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${payment.projectId}-invoice.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Payments</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Payouts & escrow</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track milestone approvals, monitor payouts, and export earnings right from NeuralGig.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading payments...</p>}
      {error && <p className="text-sm text-red-500">Unable to reach the backend. Start the FastAPI server.</p>}

      <div className="grid gap-4">
        {data?.map((payment) => (
          <div key={payment.projectId} className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-900">{payment.projectName}</h2>
                <p className="text-sm text-slate-500">{payment.client}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  payment.status === "released"
                    ? "bg-green-50 text-green-600"
                    : payment.status === "in-review"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-brand-50 text-brand-600"
                }`}
              >
                {payment.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Due {new Date(payment.dueDate).toLocaleDateString()}</span>
              <span>${payment.amount.toLocaleString()}</span>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => handleViewInvoice(payment)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                View invoice
              </button>
              <button
                onClick={() => handleDownloadReceipt(payment)}
                className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-400"
              >
                Download receipt
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
