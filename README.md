# VerbOrbit

German prefix-verb practice: a stable orbit, a real sentence bracket, and spaced recall.

```bash
npm install
npm test
npm run dev
```

Progress stays in the browser until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. Copy `.env.example`. The service role key is server-only. Apply `supabase/migrations/0001_initial_verborbit.sql` before signing in.

Audio for the published sentences is in `public/audio`. Regenerate it on macOS with `npx tsx scripts/render-audio.ts`.
