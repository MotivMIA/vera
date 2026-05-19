# Supabase schema for Visual Era

Run this in the Supabase SQL editor after creating the project. Raw identity documents are intentionally absent from this schema; DIDIT owns document capture and storage.

```sql
create extension if not exists pgcrypto;

create type onboarding_step as enum ('consent', 'identity', 'documents', 'complete');
create type verification_state as enum ('pending', 'verified', 'failed');
create type document_state as enum ('not_started', 'sent', 'signed', 'voided');

create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table onboarding_status (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique references users(clerk_user_id) on delete cascade,
  current_step onboarding_step not null default 'consent',
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  esign_accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table verification_status (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique references users(clerk_user_id) on delete cascade,
  provider text not null default 'didit',
  provider_session_id text unique,
  status verification_state not null default 'pending',
  metadata_encrypted text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table signed_documents (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references users(clerk_user_id) on delete cascade,
  document_type text not null,
  provider text not null default 'internal',
  provider_document_id text,
  status document_state not null default 'not_started',
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, document_type)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  action text not null,
  ip_hash text,
  user_agent text,
  metadata_encrypted text,
  created_at timestamptz not null default now()
);
```

alter table users enable row level security;
alter table onboarding_status enable row level security;
alter table verification_status enable row level security;
alter table signed_documents enable row level security;
alter table audit_logs enable row level security;

-- The Next.js server uses SUPABASE_SERVICE_ROLE_KEY for secure writes.
-- Add user-facing read policies only when you expose direct Supabase clients.
