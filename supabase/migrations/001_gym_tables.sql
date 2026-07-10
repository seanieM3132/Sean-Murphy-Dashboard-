-- Gym session logging tables
-- Run against your Supabase project when ready.

create table gym_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  session_id uuid references sessions,
  date date not null,
  template text not null,
  minutes int not null,
  session_rpe int check (session_rpe between 1 and 10),
  finished_at timestamptz,
  unique (user_id, date, template)
);

create table gym_exercise_log (
  id uuid primary key default gen_random_uuid(),
  gym_session_id uuid references gym_sessions on delete cascade not null,
  exercise_id text not null,
  reps_done int not null default 0,
  best_seconds numeric(5,2),
  unique (gym_session_id, exercise_id)
);
