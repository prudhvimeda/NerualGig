"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useDemoAuth } from "../../../components/demo-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const { setRole } = useDemoAuth();
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email) {
      signIn("google", { email });
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-center text-xl font-display font-semibold text-slate-100">
        🧠 NeuralGig
      </Link>
      <div className="card flex flex-col gap-4">
        <h1 className="text-2xl font-display font-semibold text-slate-100">Create your NeuralGig account</h1>
        <p className="text-sm text-slate-300">
          Sign up to access client and freelancer dashboards, AI copilots, and a curated marketplace of opportunities.
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Work email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-brand-400"
          >
            Continue with Google
          </button>
        </form>
        <button
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200"
          onClick={() => signIn("github")}
        >
          Continue with GitHub
        </button>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            className="rounded-lg border border-white/15 bg-white/20 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-white/40"
            onClick={() => {
              setRole("client");
              router.push("/client/onboarding");
            }}
          >
            Continue as Demo Client
          </button>
          <button
            className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
            onClick={() => {
              setRole("freelancer");
              router.push("/freelancer/onboarding");
            }}
          >
            Continue as Demo Freelancer
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-brand-300 hover:text-brand-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
