import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProgressRecord, StudyStreak } from "@/store/useVerbOrbitStore";

type ProgressRow = {
  user_id: string;
  chunk_id: string;
  base_verb_id: string;
  branch_id: string;
  state: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  due_at: string;
  last_review_at: string | null;
  last_rating: number | null;
  updated_at: string;
};

export async function pushProgress(client: SupabaseClient, userId: string, progress: Record<string, ProgressRecord>, streak: StudyStreak): Promise<void> {
  const rows = Object.values(progress).map((record) => ({
    user_id: userId,
    chunk_id: record.chunkId,
    base_verb_id: record.baseVerbId,
    branch_id: record.branchId,
    state: record.card.state,
    stability: record.card.stability,
    difficulty: record.card.difficulty,
    elapsed_days: record.card.elapsed_days,
    scheduled_days: record.card.scheduled_days,
    learning_steps: record.card.learning_steps,
    reps: record.card.reps,
    lapses: record.card.lapses,
    due_at: record.dueAt,
    last_review_at: record.card.last_review ?? null,
    last_rating: record.lastRating,
    updated_at: record.updatedAt,
  }));
  if (rows.length > 0) {
    const { error } = await client.from("user_chunk_progress").upsert(rows, { onConflict: "user_id,chunk_id" });
    if (error) throw error;
  }
  const { error: streakError } = await client.from("user_study_stats").upsert({
    user_id: userId,
    streak_count: streak.count,
    last_completed_day: streak.lastCompletedDay,
    updated_at: new Date().toISOString(),
  });
  if (streakError) throw streakError;
}

export async function pullProgress(client: SupabaseClient, userId: string): Promise<{ progress: Record<string, ProgressRecord>; streak: StudyStreak }> {
  const { data, error } = await client.from("user_chunk_progress").select("*").eq("user_id", userId);
  if (error) throw error;
  const progress: Record<string, ProgressRecord> = {};
  for (const row of (data ?? []) as ProgressRow[]) {
    progress[row.chunk_id] = {
      chunkId: row.chunk_id,
      branchId: row.branch_id,
      baseVerbId: row.base_verb_id,
      dueAt: row.due_at,
      lastRating: row.last_rating as ProgressRecord["lastRating"],
      updatedAt: row.updated_at,
      card: {
        due: row.due_at,
        stability: row.stability,
        difficulty: row.difficulty,
        elapsed_days: row.elapsed_days,
        scheduled_days: row.scheduled_days,
        learning_steps: row.learning_steps,
        reps: row.reps,
        lapses: row.lapses,
        state: row.state,
        last_review: row.last_review_at ?? undefined,
      },
    };
  }
  const { data: stats, error: statsError } = await client.from("user_study_stats").select("*").eq("user_id", userId).maybeSingle();
  if (statsError) throw statsError;
  return {
    progress,
    streak: {
      count: stats?.streak_count ?? 0,
      lastCompletedDay: stats?.last_completed_day ?? null,
    },
  };
}

export function mergeProgress(local: Record<string, ProgressRecord>, remote: Record<string, ProgressRecord>): Record<string, ProgressRecord> {
  const merged = { ...remote };
  for (const [id, record] of Object.entries(local)) {
    const other = merged[id];
    if (!other || new Date(record.updatedAt).getTime() >= new Date(other.updatedAt).getTime()) {
      merged[id] = record;
    }
  }
  return merged;
}
