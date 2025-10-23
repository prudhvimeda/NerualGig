"use client";

import { signIn } from "next-auth/react";
import { useDemoAuth } from "../../../components/demo-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { setRole } = useDemoAuth();
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-center text-xl font-display font-semibold text-slate-100">
        🧠 NeuralGig
      </Link>
      <div className="card flex flex-col gap-4">
        <h1 className="text-2xl font-display font-semibold text-slate-100">Sign in</h1>
        <p className="text-sm text-slate-300">
          Use your Google or GitHub account. We will only request the minimum scopes required to create your NeuralGig
          workspace.
        </p>
        <button
          className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-brand-400"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </button>
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
        <p className="text-xs text-slate-400">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <p className="text-center text-sm text-slate-300">
        New to NeuralGig?{" "}
        <Link href="/auth/signup" className="font-medium text-brand-300 hover:text-brand-200">
          Create your account
        </Link>
      </p>
    </div>
  );
}
