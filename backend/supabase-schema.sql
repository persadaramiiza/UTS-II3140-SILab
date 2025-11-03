-- Supabase schema for SILab backend
-- Run this in the Supabase SQL editor (authenticated with service role privileges).

create table if not exists public.users (
  id text primary key,
  role text not null check (role in ('admin', 'assistant', 'student')),
  username text not null unique,
  name text not null,
  password_hash text,
  email text unique,
  picture text,
  google_id text unique,
  email_verified boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  auth_provider text,
  student_id text,
  department text,
  phone text,
  bio text
);

create table if not exists public.assignments (
  id text primary key,
  title text not null,
  description text,
  focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id text not null references public.assignments (id) on delete cascade,
  student_id text not null references public.users (id) on delete cascade,
  student_name text not null,
  link text,
  notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  grade jsonb
);

create index if not exists submissions_assignment_id_idx on public.submissions (assignment_id);
create index if not exists submissions_student_id_idx on public.submissions (student_id);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  content_type text,
  size_bytes bigint,
  uploaded_by text not null references public.users (id),
  created_at timestamptz not null default now()
);

create index if not exists submission_files_submission_id_idx on public.submission_files (submission_id);

-- Remember to create a storage bucket (default name: submission-files) in Supabase Storage
-- and grant the service role permission to read/write objects within that bucket.
