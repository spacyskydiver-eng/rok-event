-- Drop tables if they exist for clean setup
drop table if exists public.events cascade;
drop table if exists public.whitelist cascade;
drop table if exists public.event_categories cascade;

-- Create event categories table first (referenced by events)
create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#3b82f6',
  created_at timestamp with time zone default now()
);

-- Create events table for RoK calendar
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_day integer not null check (start_day >= 1 and start_day <= 130),
  end_day integer not null check (end_day >= 1 and end_day <= 130),
  category_id uuid references public.event_categories(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint valid_day_range check (end_day >= start_day)
);

-- Create whitelist table for user permissions
create table public.whitelist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.events enable row level security;
alter table public.whitelist enable row level security;
alter table public.event_categories enable row level security;

-- Events policies: everyone can read, only whitelisted can modify
create policy "events_select_all" on public.events 
  for select using (true);

create policy "events_insert_whitelist" on public.events 
  for insert with check (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid()
    )
  );

create policy "events_update_whitelist" on public.events 
  for update using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid()
    )
  );

create policy "events_delete_whitelist" on public.events 
  for delete using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid()
    )
  );

-- Whitelist policies: only admins can view and modify
create policy "whitelist_select_admin" on public.whitelist 
  for select using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "whitelist_insert_admin" on public.whitelist 
  for insert with check (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "whitelist_update_admin" on public.whitelist 
  for update using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "whitelist_delete_admin" on public.whitelist 
  for delete using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Categories policies: everyone can read, whitelisted can modify
create policy "categories_select_all" on public.event_categories 
  for select using (true);

create policy "categories_insert_whitelist" on public.event_categories 
  for insert with check (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid()
    )
  );

create policy "categories_delete_whitelist" on public.event_categories 
  for delete using (
    exists (
      select 1 from public.whitelist 
      where user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index idx_events_days on public.events (start_day, end_day);
create index idx_events_category on public.events (category_id);
create index idx_whitelist_user on public.whitelist (user_id);
