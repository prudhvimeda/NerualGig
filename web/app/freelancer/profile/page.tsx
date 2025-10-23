"use client";

import Link from "next/link";
import { useApi } from "../../../lib/api";

type FreelancerProfile = {
  name: string;
  headline: string;
  location: string;
  email: string;
  hourlyRate: number;
  availability: {
    hoursPerWeek: number;
    timezone: string;
  };
  skills: string[];
  bio: string;
  social: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
};

export default function FreelancerProfilePage() {
  const { data, error, isLoading } = useApi<FreelancerProfile>("/freelancer/profile");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Profile</p>
        <h1 className="text-3xl font-display font-semibold text-slate-900">Freelancer profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Keep your NeuralGig profile sharp so the matching engine can surface the best opportunities.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading profile...</p>}
      {error && <p className="text-sm text-red-500">Unable to reach the backend. Start the FastAPI server.</p>}

      {data && (
        <section className="card grid gap-4 text-sm text-slate-700">
          <div>
            <p className="text-lg font-semibold text-slate-900">{data.name}</p>
            <p>{data.headline}</p>
            <p className="text-slate-500">
              {data.location} • {data.email}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Availability</h2>
            <p className="mt-2 text-slate-600">{data.availability.hoursPerWeek} hrs / week • {data.availability.timezone}</p>
            <p className="text-slate-600">Rate: ${data.hourlyRate}/hr</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">About</h2>
            <p className="mt-2 text-slate-600">{data.bio}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Social</h2>
            <div className="mt-2 flex flex-col gap-1 text-brand-500">
              {data.social.github && (
                <a href={data.social.github} target="_blank" rel="noopener noreferrer">
                  GitHub profile
                </a>
              )}
              {data.social.linkedin && (
                <a href={data.social.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn profile
                </a>
              )}
              {data.social.portfolio && (
                <a href={data.social.portfolio} target="_blank" rel="noopener noreferrer">
                  Portfolio
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/freelancer/onboarding"
              className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-400"
            >
              Edit profile
            </Link>
            <a
              href={`mailto:talent@neuralgig.dev?subject=${encodeURIComponent("Freelancer profile link")}`}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
            >
              Share profile
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
