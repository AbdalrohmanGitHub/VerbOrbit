-- VerbOrbit catalog is public to read. Progress belongs to the signed-in user.
-- The service role is not granted here and must never ship in a NEXT_PUBLIC variable.

create table if not exists public.base_verbs (
  id text primary key,
  rank_number int not null unique,
  infinitive text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  semantic_cluster text not null,
  auxiliary_verb text not null check (auxiliary_verb in ('haben', 'sein')),
  stem_present_3rd text not null,
  stem_preterite text not null,
  past_participle text not null,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.prefix_branches (
  id text primary key,
  base_verb_id text not null references public.base_verbs (id) on delete cascade,
  prefix text not null check (lower(prefix) <> 'ge'),
  full_verb text not null,
  is_separable boolean not null,
  stress_mark text not null,
  frequency_stars int not null check (frequency_stars between 1 and 5),
  onion_layer int not null check (onion_layer between 1 and 3),
  compass_angle_deg int not null check (compass_angle_deg between 0 and 359),
  color_hex text not null,
  tendency_de text not null,
  exception_note text,
  icon_key text,
  auxiliary_verb text not null check (auxiliary_verb in ('haben', 'sein')),
  stem_present_3rd text not null,
  stem_preterite text not null,
  past_participle text not null,
  chunks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_chunk_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  chunk_id text not null,
  base_verb_id text not null,
  branch_id text not null,
  state int not null,
  stability double precision not null,
  difficulty double precision not null,
  elapsed_days double precision not null default 0,
  scheduled_days double precision not null,
  learning_steps int not null,
  reps int not null,
  lapses int not null,
  due_at timestamptz not null,
  last_review_at timestamptz,
  last_rating int,
  updated_at timestamptz not null default now(),
  primary key (user_id, chunk_id)
);

create table if not exists public.user_study_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  streak_count int not null default 0,
  last_completed_day date,
  updated_at timestamptz not null default now()
);

create table if not exists public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chunk_id text not null,
  rating int not null check (rating between 1 and 4),
  reviewed_at timestamptz not null default now(),
  due_at timestamptz,
  state int
);

create index if not exists idx_branches_base_verb on public.prefix_branches (base_verb_id);
create index if not exists idx_progress_due on public.user_chunk_progress (user_id, due_at);

alter table public.base_verbs enable row level security;
alter table public.prefix_branches enable row level security;
alter table public.user_chunk_progress enable row level security;
alter table public.user_study_stats enable row level security;
alter table public.review_logs enable row level security;

create policy "base_verbs_select" on public.base_verbs
  for select to anon, authenticated
  using (true);

create policy "prefix_branches_select" on public.prefix_branches
  for select to anon, authenticated
  using (true);

create policy "progress_select" on public.user_chunk_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "progress_insert" on public.user_chunk_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "progress_update" on public.user_chunk_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "progress_delete" on public.user_chunk_progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "stats_select" on public.user_study_stats
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "stats_insert" on public.user_study_stats
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "stats_update" on public.user_study_stats
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "logs_select" on public.review_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "logs_insert" on public.review_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
