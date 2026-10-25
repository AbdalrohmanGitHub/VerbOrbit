import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mergeProgress } from "@/lib/supabase/sync";
import type { ProgressRecord } from "@/store/useVerbOrbitStore";

describe("row level security migration", () => {
  const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/0001_initial_verborbit.sql"), "utf8").toLowerCase();

  it("enables rls and keeps catalog writes unpublished", () => {
    for (const table of ["base_verbs", "prefix_branches", "user_chunk_progress", "user_study_stats", "review_logs"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
    expect(sql).toContain("for select to anon, authenticated");
    expect(sql).not.toContain("for insert on public.base_verbs");
    expect(sql).not.toContain("for update on public.base_verbs");
    expect(sql).not.toContain("for delete on public.base_verbs");
    expect(sql).not.toContain("for all");
    expect(sql).not.toContain("service_role");
  });

  it("checks the owner on insert and update", () => {
    expect(sql).toContain("for insert to authenticated");
    expect(sql).toContain("with check ((select auth.uid()) = user_id)");
    expect(sql).toContain("for update to authenticated");
    expect(sql).toContain("using ((select auth.uid()) = user_id)");
  });

  it("does not put a service key in client source", () => {
    const files = walk(path.join(process.cwd(), "src")).filter((file) => !file.includes(`${path.sep}__tests__${path.sep}`));
    const offenders = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return text.includes("SUPABASE_SERVICE_ROLE_KEY") || text.includes("service_role");
    });
    expect(offenders).toEqual([]);
  });
});

describe("progress merge", () => {
  it("keeps the newer card", () => {
    const older = record("a", "2026-10-25T10:00:00.000Z");
    const newer = record("a", "2026-10-25T12:00:00.000Z");
    expect(mergeProgress({ a: newer }, { a: older }).a?.updatedAt).toBe(newer.updatedAt);
    expect(mergeProgress({ a: older }, { a: newer }).a?.updatedAt).toBe(newer.updatedAt);
  });
});

function record(id: string, updatedAt: string): ProgressRecord {
  return {
    chunkId: id,
    branchId: "kommen_an",
    baseVerbId: "kommen",
    dueAt: updatedAt,
    lastRating: 3,
    updatedAt,
    card: {
      due: updatedAt,
      stability: 1,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 1,
      reps: 1,
      lapses: 0,
      state: 1,
    },
  };
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full;
  });
}
