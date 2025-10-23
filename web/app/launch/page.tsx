"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowUturnLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useDemoAuth } from "../../components/demo-auth";

const demoImages = [
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    alt: "Product leadership reviewing project dashboards",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    alt: "Remote team collaborating in a modern workspace",
  },
];

export default function LaunchWorkspacePage() {
  const { setRole } = useDemoAuth();
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:text-brand-500">
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Back to landing
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 shadow-sm">
            <SparklesIcon className="h-4 w-4" />
            NeuralGig launchpad
          </span>
        </div>
        <h1 className="w-full text-3xl font-display font-semibold text-slate-900 md:w-auto md:text-4xl">Launch your NeuralGig workspace</h1>
      </header>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Instant actions</h2>
            <p className="mt-2 text-sm text-slate-600">
              Connect Google or GitHub to jump into the console, sync project briefs, and spin up scoped squads with AI-assisted matches.
            </p>
          </div>
          <div className="grid gap-3">
            <button
              className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/60"
              onClick={() => signIn("google")}
            >
              Continue with Google
            </button>
            <button
              className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/60"
              onClick={() => signIn("github")}
            >
              Continue with GitHub
            </button>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-600"
                onClick={() => {
                  setRole("client");
                  router.push("/client/onboarding");
                }}
              >
                Continue as Demo Client
              </button>
              <button
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
                onClick={() => {
                  setRole("freelancer");
                  router.push("/freelancer/onboarding");
                }}
              >
                Continue as Demo Freelancer
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            SSO required for production environments. Sandbox mode available for rapid exploration—no credit card needed.
          </p>
        </div>

        <div className="grid gap-4">
          {demoImages.map((item, index) => (
            <div key={item.src} className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.65)]">
              <Image
                src={item.src}
                alt={item.alt}
                width={900}
                height={540}
                priority={index === 0}
                className="h-56 w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-5 py-4 text-sm text-slate-100">
                {item.alt}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
