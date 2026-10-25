"use client";

import { useState } from "react";
import type { NativeAnchors, NativeLang } from "@/types/verb.schema";

const LABELS: Record<NativeLang, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
};

export function NativeAnchorPeek({
  anchors,
  lang,
  shown,
  onToggle,
}: {
  anchors: NativeAnchors;
  lang: NativeLang;
  shown: boolean;
  onToggle: (value: boolean) => void;
}) {
  const [holding, setHolding] = useState(false);
  const visible = shown || holding;
  const text = anchors[lang];
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-wide text-amber-800">{LABELS[lang]}</span>
        <button
          id="translation-toggle"
          type="button"
          aria-pressed={shown}
          className="min-h-11 rounded-xl bg-amber-200 px-3 text-sm font-extrabold text-amber-950"
          onClick={() => onToggle(!shown)}
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") return;
          }}
        >
          {shown ? "Übersetzung aus" : "Übersetzung"}
        </button>
      </div>
      <p
        id="native-anchor"
        lang={lang}
        dir={lang === "ar" ? "rtl" : "ltr"}
        className={`mt-2 text-base font-extrabold text-slate-900 ${lang === "ar" ? "font-[family-name:var(--font-naskh)]" : ""} ${visible ? "" : "blur-md select-none"}`}
      >
        {visible ? text : "Übersetzung verborgen"}
      </p>
    </div>
  );
}
