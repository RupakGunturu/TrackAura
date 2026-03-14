create table if not exists projects (
  id uuid primary key,
  name text not null,
  website_url text,
  api_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_created_at
  on projects (created_at desc);

create table if not exists interaction_events (
  id bigint generated always as identity primary key,
  project_id text not null,
  session_id text not null,
  page_path text not null,
  event_type text not null check (event_type in ('click', 'scroll', 'attention')),
  x integer not null,
  y integer not null,
  value integer not null default 1,
  viewport_w integer not null,
  viewport_h integer not null,
  device_type text not null default 'desktop' check (device_type in ('desktop', 'tablet', 'mobile')),
  created_at timestamptz not null default now()
);

create index if not exists idx_interaction_events_project_page_mode_time
  on interaction_events (project_id, page_path, event_type, created_at desc);

create index if not exists idx_interaction_events_session
  on interaction_events (session_id, created_at desc);

alter table interaction_events enable row level security;

-- Read policy for frontend anon/auth users. Adjust to stricter auth constraints in production.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'interaction_events'
      and policyname = 'Allow read interaction events'
  ) then
    create policy "Allow read interaction events"
    on interaction_events
    for select
    using (true);
  end if;
end $$;

-- Writes from backend use service role key and bypass RLS.
