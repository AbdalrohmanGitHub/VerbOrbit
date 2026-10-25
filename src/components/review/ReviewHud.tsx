"use client";

import { useState } from "react";
import { productionPrompt, normalizeAnswer } from "@/core/sentenceBracket";
import { Rating, type Grade } from "@/core/reviewScheduler";
import type { PrefixBranch, VerbChunk } from "@/types/verb.schema";

type ReviewProps = {
  branch: PrefixBranch;
  chunk: VerbChunk;
  onRate: (grade: Grade) => { ok: true } | { ok: false; reason: string };
  onClose: () => void;
  onNeedHint: () => void;
  prefill: string | null;
};

export function ReviewHud({ branch, chunk, onRate, onClose, onNeedHint, prefill }: ReviewProps) {
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState("");
  const [rated, setRated] = useState<Grade | null>(null);
  const [shake, setShake] = useState(false);

  return (
    <AnswerForm
      key={prefill ?? "plain"}
      branch={branch}
      chunk={chunk}
      prefill={prefill}
      hint={hint}
      message={message}
      rated={rated}
      shake={shake}
      setHint={setHint}
      setMessage={setMessage}
      setRated={setRated}
      setShake={setShake}
      onRate={onRate}
      onClose={onClose}
      onNeedHint={onNeedHint}
    />
  );
}

function AnswerForm({
  branch,
  chunk,
  prefill,
  hint,
  message,
  rated,
  shake,
  setHint,
  setMessage,
  setRated,
  setShake,
  onRate,
  onClose,
  onNeedHint,
}: ReviewProps & {
  hint: boolean;
  message: string;
  rated: Grade | null;
  shake: boolean;
  setHint: (value: boolean) => void;
  setMessage: (value: string) => void;
  setRated: (value: Grade | null) => void;
  setShake: (value: boolean) => void;
}) {
  const prompt = productionPrompt(branch, chunk.sentence_bracket);
  const [value, setValue] = useState(prefill ?? "");

  function apply(grade: Grade) {
    const result = onRate(grade);
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    setRated(grade);
    setMessage(grade === Rating.Again ? "Noch nicht. Die Karte kommt bald wieder." : "Gespeichert.");
  }

  function check() {
    const correct = normalizeAnswer(value) === normalizeAnswer(prompt.answer);
    if (correct && !hint) {
      setMessage("Stimmt. Wie sicher war das?");
      setRated(Rating.Good);
      return;
    }
    if (correct && hint) {
      apply(Rating.Hard);
      return;
    }
    setShake(true);
    window.setTimeout(() => setShake(false), 350);
    if (!hint) {
      setHint(true);
      onNeedHint();
      setMessage("Noch nicht. Vier Planeten sind markiert. Tippe einen als Hinweis und prüfe noch einmal.");
      return;
    }
    apply(Rating.Again);
  }

  return (
    <div id="review-hud" className={shake ? "animate-pulse" : ""}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-violet-700">Produktion</h2>
        <button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold" onClick={onClose}>
          Schließen
        </button>
      </div>
      <p className="text-lg font-extrabold text-slate-900">
        {prompt.before} <span className="text-violet-700">{prompt.blank}</span> {prompt.after}
      </p>
      <label className="mt-3 block text-xs font-bold text-slate-500" htmlFor="quiz-answer">
        {branch.is_separable ? "Welche Vorsilbe steht am Ende?" : "Welche Verbform steht an Position 2?"}
      </label>
      <input
        id="quiz-answer"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold"
        autoComplete="off"
        disabled={rated !== null && rated !== Rating.Good}
      />
      {rated === null || (rated === Rating.Good && message.startsWith("Stimmt")) ? (
        <button id="quiz-check" type="button" className="mt-3 min-h-11 rounded-xl bg-violet-700 px-4 font-extrabold text-white" onClick={check}>
          Prüfen
        </button>
      ) : null}
      {message.startsWith("Stimmt") ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-xl bg-slate-200 px-3 font-bold" onClick={() => apply(Rating.Hard)}>
            Mit Mühe
          </button>
          <button id="quiz-good" type="button" className="min-h-11 rounded-xl bg-emerald-600 px-3 font-extrabold text-white" onClick={() => apply(Rating.Good)}>
            Gut
          </button>
          <button type="button" className="min-h-11 rounded-xl bg-sky-600 px-3 font-bold text-white" onClick={() => apply(Rating.Easy)}>
            Leicht
          </button>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm font-bold text-slate-700">{message}</p> : null}
      {hint ? <p className="mt-1 text-xs text-slate-500">Hinweis benutzt. Eine richtige Antwort zählt als Mühe.</p> : null}
    </div>
  );
}
