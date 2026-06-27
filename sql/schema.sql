create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_paid boolean not null default false,
  stripe_customer_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.name_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('free', 'paid')),
  input jsonb not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.name_reports enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own reports" on public.name_reports;
create policy "Users can read own reports"
on public.name_reports for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own reports" on public.name_reports;
create policy "Users can insert own reports"
on public.name_reports for insert
with check (auth.uid() = user_id);

create index if not exists name_reports_user_created_idx
on public.name_reports (user_id, created_at desc);

create index if not exists name_reports_free_limit_idx
on public.name_reports (user_id, mode, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
