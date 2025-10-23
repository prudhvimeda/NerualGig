"use client";

import { ReactNode } from "react";

type AnswerSource = {
  label: string;
  url?: string;
};

type AnswerCardProps = {
  heading: string;
  body: ReactNode;
  footnote?: string;
  sources?: AnswerSource[];
};

export function AnswerCard({ heading, body, footnote, sources }: AnswerCardProps) {
  return (
    <article className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-card backdrop-blur-xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-display font-semibold text-slate-900">{heading}</h2>
        {footnote && <span className="text-xs text-slate-500">{footnote}</span>}
      </header>
      <div className="mt-4 prose max-w-none text-sm leading-relaxed text-slate-600 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-brand-500">
        {body}
      </div>
      {sources && sources.length > 0 && (
        <footer className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</span>
          {sources.map((source) => (
            <a
              key={source.label}
              href={source.url ?? "#"}
              target={source.url ? "_blank" : undefined}
              rel={source.url ? "noopener noreferrer" : undefined}
              className="rounded-full border border-slate-300/60 px-3 py-1 text-xs text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
            >
              {source.label}
            </a>
          ))}
        </footer>
      )}
    </article>
  );
}
