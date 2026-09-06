-- Run in the Supabase SQL editor (Free tier).

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null default 'Untitled CV',
  content_json jsonb not null,
  target_lang text not null default 'EN' check (target_lang in ('EN', 'TR')),
  updated_at timestamptz not null default now()
);

create index if not exists cvs_user_id_idx on public.cvs (user_id);

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "cvs_select_own" on public.cvs
  for select using (auth.uid() = user_id);
create policy "cvs_insert_own" on public.cvs
  for insert with check (auth.uid() = user_id);
create policy "cvs_update_own" on public.cvs
  for update using (auth.uid() = user_id);
create policy "cvs_delete_own" on public.cvs
  for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('cv_assets', 'cv_assets', false)
on conflict (id) do nothing;

create policy "cv_assets_select_own"
  on storage.objects for select
  using (bucket_id = 'cv_assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cv_assets_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'cv_assets' and auth.uid()::text = (storage.foldername(name))[1]);
