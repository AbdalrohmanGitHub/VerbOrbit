"use client";

import { useEffect, useState } from "react";
import { getSupabase, supabaseConfig } from "@/lib/supabase/browser";
import { mergeProgress, pullProgress, pushProgress } from "@/lib/supabase/sync";
import { useVerbOrbitStore } from "@/store/useVerbOrbitStore";

export function AccountPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const configured = supabaseConfig() !== null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;
    void client.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      if (session?.user.id) void syncNow(session.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    return useVerbOrbitStore.subscribe((state, previous) => {
      if (state.progress === previous.progress && state.streak === previous.streak) return;
      const client = getSupabase();
      if (!client) return;
      void pushProgress(client, userId, state.progress, state.streak).catch((error: unknown) => {
        setNote(error instanceof Error ? error.message : "Sync fehlgeschlagen");
      });
    });
  }, [userId]);

  if (!open) return null;

  async function signIn(signUp: boolean) {
    const client = getSupabase();
    if (!client) return;
    const result = signUp
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });
    setNote(result.error ? result.error.message : signUp ? "Konto angelegt. Bitte E-Mail bestätigen, falls nötig." : "Angemeldet. Fortschritt wird synchronisiert.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Konto</h2>
          <button type="button" className="min-h-11 rounded-xl px-3 font-bold" onClick={onClose}>
            Schließen
          </button>
        </div>
        {!configured ? (
          <p className="mt-3 text-sm font-bold text-slate-700">
            Konto ist nicht konfiguriert. Der Fortschritt bleibt auf diesem Gerät.
          </p>
        ) : userId ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-bold text-emerald-800">Angemeldet. Wiederholungen werden in dein Konto geschrieben.</p>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-slate-900 px-4 font-extrabold text-white"
              onClick={() => void getSupabase()?.auth.signOut()}
            >
              Abmelden
            </button>
          </div>
        ) : (
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void signIn(false);
            }}
          >
            <input className="min-h-11 w-full rounded-xl border px-3" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-Mail" />
            <input className="min-h-11 w-full rounded-xl border px-3" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Passwort" />
            <div className="flex gap-2">
              <button type="submit" className="min-h-11 rounded-xl bg-blue-600 px-4 font-extrabold text-white">
                Anmelden
              </button>
              <button type="button" className="min-h-11 rounded-xl bg-slate-100 px-4 font-extrabold" onClick={() => void signIn(true)}>
                Registrieren
              </button>
            </div>
          </form>
        )}
        {note ? <p className="mt-3 text-sm font-bold text-slate-600">{note}</p> : null}
        <p className="mt-4 text-xs text-slate-500">Keine Ligen, kein Streak-Kauf. Die Serie zählt nur einen Tag mit erledigter Wiederholung.</p>
      </div>
    </div>
  );
}

async function syncNow(userId: string) {
  const client = getSupabase();
  if (!client) return;
  const local = useVerbOrbitStore.getState();
  const remote = await pullProgress(client, userId);
  const progress = mergeProgress(local.progress, remote.progress);
  const streak = remote.streak.lastCompletedDay && (!local.streak.lastCompletedDay || remote.streak.lastCompletedDay > local.streak.lastCompletedDay)
    ? remote.streak
    : local.streak;
  useVerbOrbitStore.getState().replaceProgress(progress, streak);
  await pushProgress(client, userId, progress, streak);
}
