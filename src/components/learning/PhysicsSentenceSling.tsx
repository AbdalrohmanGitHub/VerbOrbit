"use client";

import { useSyncExternalStore } from "react";
import { useState } from "react";
import type { PrefixBranch, SentenceBracket } from "@/types/verb.schema";

type SlingProps = {
  branch: PrefixBranch;
  bracket: SentenceBracket;
  autoplay: boolean;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function PhysicsSentenceSling({ branch, bracket, autoplay }: SlingProps) {
  const reduce = usePrefersReducedMotion();
  const [both, setBoth] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const staticView = !branch.is_separable || Boolean(reduce) || both || !autoplay;

  return (
    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
        <span>{branch.is_separable ? "Trennbar: die Vorsilbe geht ans Satzende" : "Untrennbar: die Vorsilbe bleibt am Verb"}</span>
        <button
          type="button"
          className="min-h-11 rounded-xl px-3 text-sky-300"
          onClick={() => {
            setBoth(false);
            setPlayKey((value) => value + 1);
          }}
        >
          Nochmal
        </button>
      </div>
      {staticView ? (
        <StaticBracket branch={branch} bracket={bracket} />
      ) : (
        <Flight key={playKey} branch={branch} bracket={bracket} />
      )}
      <button
        id="bracket-both"
        type="button"
        aria-pressed={both || Boolean(reduce)}
        className="mt-3 min-h-11 rounded-xl bg-slate-800 px-3 text-sm font-bold"
        onClick={() => setBoth((value) => !value)}
      >
        {both || reduce ? "Flug zeigen" : "Beide Zustände"}
      </button>
    </div>
  );
}

function Flight({ branch, bracket }: { branch: PrefixBranch; bracket: SentenceBracket }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 text-lg font-extrabold">
      <span className="text-slate-200">{bracket.subject_and_vorfeld}</span>
      <span className="prefix-start inline-flex min-w-10 justify-center">
        <span className="rounded-l-lg bg-rose-500 px-2 py-1">{branch.prefix}</span>
      </span>
      <span className="rounded-lg bg-blue-600 px-2.5 py-1">{bracket.verb_position_2}</span>
      <span className="text-emerald-300 underline decoration-dashed underline-offset-4">{bracket.middle_field}</span>
      <span className="prefix-end inline-flex min-w-12 justify-center">
        <span className="rounded-lg bg-rose-500 px-2.5 py-1 shadow-lg">{bracket.sentence_end_prefix}.</span>
      </span>
    </div>
  );
}

function StaticBracket({ branch, bracket }: { branch: PrefixBranch; bracket: SentenceBracket }) {
  if (!branch.is_separable) {
    return (
      <p className="text-lg font-extrabold">
        {bracket.subject_and_vorfeld} {bracket.verb_position_2} {bracket.middle_field}.
      </p>
    );
  }
  return (
    <div id="bracket-static" className="space-y-2 text-lg font-extrabold">
      <p>
        <span className="rounded-l-lg bg-rose-500 px-2 py-1">{branch.prefix}</span>
        <span className="rounded-r-lg bg-blue-600 px-2 py-1">{bracket.verb_position_2}</span>
      </p>
      <p>
        {bracket.subject_and_vorfeld} {bracket.verb_position_2} {bracket.middle_field}{" "}
        <span className="rounded-lg bg-rose-500 px-2 py-1">[ {branch.prefix} ]</span>.
      </p>
    </div>
  );
}

export function principalParts(branch: PrefixBranch): string {
  if (branch.is_separable) {
    return `${branch.stem_present_3rd} … ${branch.prefix} · ${branch.stem_preterite} … ${branch.prefix} · ${branch.auxiliary_verb} ${branch.past_participle}`;
  }
  return `${branch.stem_present_3rd} · ${branch.stem_preterite} · ${branch.auxiliary_verb} ${branch.past_participle}`;
}
