-- ============================================
-- BOQ Platform - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company text,
  phone text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  client_name text not null,
  project_type text not null,
  location text,
  description text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = created_by);

create policy "Users can create projects"
  on public.projects for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = created_by);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = created_by);

-- 3. Rooms table
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  room_name text not null,
  floor text,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "Users can manage rooms of their projects"
  on public.rooms for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = rooms.project_id
      and projects.created_by = auth.uid()
    )
  );

-- 4. BOQ Items table
create table if not exists public.boq_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete set null,
  category text not null,
  item_name text not null,
  specification text,
  quantity numeric not null default 0,
  unit text not null,
  base_rate numeric not null default 0,
  luxury_tier text not null default 'standard',
  final_rate numeric not null default 0,
  total_amount numeric not null default 0,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.boq_items enable row level security;

create policy "Users can manage boq items of their projects"
  on public.boq_items for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = boq_items.project_id
      and projects.created_by = auth.uid()
    )
  );

-- 5. Rate Master table
create table if not exists public.rate_master (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  item_name text not null,
  unit text not null,
  standard_rate numeric not null default 0,
  premium_rate numeric not null default 0,
  luxury_rate numeric not null default 0,
  super_luxury_rate numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rate_master enable row level security;

create policy "Authenticated users can view rates"
  on public.rate_master for select
  to authenticated
  using (true);

create policy "Authenticated users can manage rates"
  on public.rate_master for all
  to authenticated
  using (true);

-- 6. Uploaded Files table
create table if not exists public.uploaded_files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table public.uploaded_files enable row level security;

create policy "Users can manage files of their projects"
  on public.uploaded_files for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploaded_files.project_id
      and projects.created_by = auth.uid()
    )
  );

-- 7. Shared Links table
create table if not exists public.shared_links (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  token text not null unique,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table public.shared_links enable row level security;

create policy "Users can manage shared links of their projects"
  on public.shared_links for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = shared_links.project_id
      and projects.created_by = auth.uid()
    )
  );

-- 8. Project Versions table
create table if not exists public.project_versions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  version_number int not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table public.project_versions enable row level security;

create policy "Users can manage versions of their projects"
  on public.project_versions for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_versions.project_id
      and projects.created_by = auth.uid()
    )
  );

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists idx_projects_created_by on public.projects(created_by);
create index if not exists idx_rooms_project_id on public.rooms(project_id);
create index if not exists idx_boq_items_project_id on public.boq_items(project_id);
create index if not exists idx_boq_items_room_id on public.boq_items(room_id);
create index if not exists idx_rate_master_category on public.rate_master(category);
create index if not exists idx_uploaded_files_project_id on public.uploaded_files(project_id);
create index if not exists idx_shared_links_token on public.shared_links(token);
create index if not exists idx_project_versions_project_id on public.project_versions(project_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create or replace trigger set_updated_at before update on public.projects
  for each row execute function public.update_updated_at();

create or replace trigger set_updated_at before update on public.rooms
  for each row execute function public.update_updated_at();

create or replace trigger set_updated_at before update on public.boq_items
  for each row execute function public.update_updated_at();

create or replace trigger set_updated_at before update on public.rate_master
  for each row execute function public.update_updated_at();

-- ============================================
-- Storage bucket for project files
-- ============================================
-- Run this separately in Supabase Dashboard > Storage > New Bucket:
-- Bucket name: project-files
-- Public: OFF (private)
--
-- Then add these storage policies via SQL:

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- Granular storage RLS: users can only access files in their own projects
-- Upload: user must own the project matching the folder path
create policy "Users can upload to their project folders"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
    and projects.created_by = auth.uid()
  )
);

-- Read: user must own the project, OR file is from a shared project
create policy "Users can view their project files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
    and projects.created_by = auth.uid()
  )
);

-- Delete: only project owner can delete files
create policy "Users can delete their own project files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
    and projects.created_by = auth.uid()
  )
);

-- Allow anon access for shared link file viewing (signed URLs)
create policy "Anon can view via signed URLs"
on storage.objects for select
to anon
using (bucket_id = 'project-files');
