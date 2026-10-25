"use client";

import { useMemo, useState } from "react";
import { PUBLISHED_VERBS } from "@/content/published";
import type { CefrLevel } from "@/types/verb.schema";

export function VerbGalaxyDrawer({
  open,
  cefr,
  onClose,
  onPick,
}: {
  open: boolean;
  cefr: "ALL" | CefrLevel;
  onClose: () => void;
  onPick: (verbId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const verbs = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de-DE");
    return PUBLISHED_VERBS.filter((verb) => {
      if (cefr !== "ALL" && verb.cefr_level !== cefr) return false;
      if (!needle) return true;
      const names = [verb.infinitive, verb.translations.en, verb.semantic_cluster, ...verb.branches.map((branch) => branch.full_verb)];
      return names.some((name) => name.toLocaleLowerCase("de-DE").includes(needle));
    });
  }, [cefr, query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center">
      <div className="max-h-[80dvh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-extrabold">Verbkatalog</h2>
          <button type="button" className="min-h-11 rounded-xl px-3 font-bold" onClick={onClose}>
            Schließen
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            id="catalog-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suche: kommen oder ankommen"
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3"
          />
        </div>
        <ul className="grid max-h-[55dvh] grid-cols-2 gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-3">
          {verbs.map((verb) => (
            <li key={verb.id}>
              <button
                type="button"
                className="min-h-11 w-full rounded-2xl bg-slate-50 px-3 py-3 text-left"
                onClick={() => {
                  onPick(verb.id);
                  onClose();
                }}
              >
                <span className="block font-extrabold">{verb.infinitive}</span>
                <span className="text-xs text-slate-500">
                  {verb.cefr_level} · {verb.semantic_cluster}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
