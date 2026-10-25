import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabase(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  const config = supabaseConfig();
  browserClient = config ? createClient(config.url, config.anonKey) : null;
  return browserClient;
}
