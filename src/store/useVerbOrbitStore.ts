"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findChunk, findVerb } from "@/content/published";
import { unlockedOnionLayer, type ChunkRecall } from "@/core/onionScaffolding";
import {
  dueAt,
  emptyCard,
  hydrateCard,
  Rating,
  reviewCard,
  serializeCard,
  serializeLog,
  type Grade,
  type StoredCard,
  type StoredReviewLog,
} from "@/core/reviewScheduler";
import type { CefrLevel, NativeLang, OnionLayer, SemanticCluster } from "@/types/verb.schema";

export const NEW_CHUNK_CAP = 5;
const STORAGE_KEY = "verborbit-progress-v1";

export type OrbitView =
  | { kind: "galaxy" }
  | { kind: "cluster"; cluster: SemanticCluster }
  | { kind: "verb"; verbId: string };

export type ProgressRecord = {
  chunkId: string;
  branchId: string;
  baseVerbId: string;
  card: StoredCard;
  dueAt: string;
  lastRating: Grade | null;
  updatedAt: string;
};

export type StudyStreak = {
  count: number;
  lastCompletedDay: string | null;
};

type OrbitState = {
  progress: Record<string, ProgressRecord>;
  logs: Array<StoredReviewLog & { chunkId: string }>;
  streak: StudyStreak;
  nativeLang: NativeLang;
  showTranslation: boolean;
  onionChoice: Record<string, OnionLayer>;
  minStars: number;
  cefr: "ALL" | CefrLevel;
  view: OrbitView;
  history: OrbitView[];
  selectedChunkId: string | null;
  introducedDay: string;
  introducedChunkIds: string[];
  setView: (view: OrbitView) => void;
  goBack: () => void;
  goUp: () => void;
  selectChunk: (chunkId: string) => void;
  setNativeLang: (lang: NativeLang) => void;
  setShowTranslation: (value: boolean) => void;
  setOnion: (verbId: string, layer: OnionLayer) => void;
  setMinStars: (stars: number) => void;
  setCefr: (cefr: "ALL" | CefrLevel) => void;
  rateChunk: (chunkId: string, grade: Grade, now?: Date) => { ok: true } | { ok: false; reason: string };
  replaceProgress: (progress: Record<string, ProgressRecord>, streak: StudyStreak) => void;
};

function todayKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(year!, (month ?? 1) - 1, date ?? 1);
  value.setDate(value.getDate() - 1);
  return todayKey(value);
}

function sameView(a: OrbitView, b: OrbitView): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function recallMap(progress: Record<string, ProgressRecord>): Record<string, ChunkRecall> {
  return Object.fromEntries(
    Object.values(progress).map((record) => [
      record.chunkId,
      { reps: record.card.reps, lastRating: record.lastRating },
    ]),
  );
}

export function effectiveOnion(verbId: string, choice: OnionLayer | undefined, progress: Record<string, ProgressRecord>): OnionLayer {
  const verb = findVerb(verbId);
  if (!verb) return 1;
  const unlocked = unlockedOnionLayer(verb, recallMap(progress));
  const wanted = choice ?? 1;
  return (Math.min(wanted, unlocked) as OnionLayer);
}

function dueRecords(progress: Record<string, ProgressRecord>, now: Date): ProgressRecord[] {
  return Object.values(progress)
    .filter((record) => new Date(record.dueAt).getTime() <= now.getTime())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export const useVerbOrbitStore = create<OrbitState>()(
  persist(
    (set, get) => ({
      progress: {},
      logs: [],
      streak: { count: 0, lastCompletedDay: null },
      nativeLang: "ar",
      showTranslation: false,
      onionChoice: {},
      minStars: 1,
      cefr: "ALL",
      view: { kind: "verb", verbId: "kommen" },
      history: [],
      selectedChunkId: "kommen_an_in",
      introducedDay: todayKey(),
      introducedChunkIds: [],
      setView: (view) =>
        set((state) => ({
          history: sameView(state.view, view) ? state.history : [...state.history, state.view].slice(-25),
          view,
        })),
      goBack: () =>
        set((state) => {
          const history = [...state.history];
          const previous = history.pop();
          if (!previous) return state;
          return { history, view: previous };
        }),
      goUp: () => {
        const { view, setView } = get();
        if (view.kind === "verb") {
          const verb = findVerb(view.verbId);
          setView({ kind: "cluster", cluster: verb?.semantic_cluster ?? "Bewegung" });
          return;
        }
        if (view.kind === "cluster") setView({ kind: "galaxy" });
      },
      selectChunk: (chunkId) => {
        const found = findChunk(chunkId);
        if (!found) return;
        set({
          selectedChunkId: chunkId,
          view: { kind: "verb", verbId: found.verb.id },
        });
      },
      setNativeLang: (nativeLang) => set({ nativeLang }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setOnion: (verbId, layer) =>
        set((state) => ({
          onionChoice: { ...state.onionChoice, [verbId]: layer },
        })),
      setMinStars: (minStars) => set({ minStars }),
      setCefr: (cefr) => set({ cefr }),
      rateChunk: (chunkId, grade, now = new Date()) => {
        const found = findChunk(chunkId);
        if (!found) return { ok: false, reason: "Unbekannte Karte." };
        const state = get();
        const day = todayKey(now);
        const introduced = state.introducedDay === day ? state.introducedChunkIds : [];
        const existing = state.progress[chunkId];
        const isNew = !existing;
        if (isNew && !introduced.includes(chunkId) && introduced.length >= NEW_CHUNK_CAP) {
          return { ok: false, reason: "Heute sind schon fünf neue Karten dran. Zuerst die fälligen Wiederholungen." };
        }
        const card = existing ? hydrateCard(existing.card) : emptyCard(now);
        const result = reviewCard(card, now, grade);
        const stored = serializeCard(result.card);
        const record: ProgressRecord = {
          chunkId,
          branchId: found.branchId,
          baseVerbId: found.verb.id,
          card: stored,
          dueAt: dueAt(result.card),
          lastRating: grade,
          updatedAt: now.toISOString(),
        };
        const progress = { ...state.progress, [chunkId]: record };
        const stillDue = dueRecords(progress, now);
        let streak = state.streak;
        if (stillDue.length === 0) {
          if (streak.lastCompletedDay === day) {
            streak = streak;
          } else if (streak.lastCompletedDay === previousDay(day)) {
            streak = { count: streak.count + 1, lastCompletedDay: day };
          } else {
            streak = { count: 1, lastCompletedDay: day };
          }
        }
        set({
          progress,
          streak,
          logs: [...state.logs, { ...serializeLog(result.log), chunkId }].slice(-400),
          introducedDay: day,
          introducedChunkIds: introduced.includes(chunkId) ? introduced : [...introduced, chunkId],
          selectedChunkId: chunkId,
          view: { kind: "verb", verbId: found.verb.id },
        });
        return { ok: true };
      },
      replaceProgress: (progress, streak) => set({ progress, streak }),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
    },
  ),
);

export function openDueChunk(now = new Date()): void {
  const { progress, view, selectedChunkId } = useVerbOrbitStore.getState();
  const due = dueRecords(progress, now);
  const first = due[0];
  if (!first) return;
  if (view.kind === "verb" && view.verbId === first.baseVerbId && selectedChunkId === first.chunkId) return;
  useVerbOrbitStore.setState({
    view: { kind: "verb", verbId: first.baseVerbId },
    selectedChunkId: first.chunkId,
  });
}

export { Rating, STORAGE_KEY };
