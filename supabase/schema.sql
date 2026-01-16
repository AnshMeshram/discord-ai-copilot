-- Discord AI Copilot Database Schema
-- Run this in the Supabase SQL Editor (Project → SQL)

create extension if not exists pgcrypto;
-- Vector search for RAG
create extension if not exists vector;

/* =====================================================
   SETTINGS (System instructions, AI config)
===================================================== */
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Seed defaults (idempotent)
insert into settings (key, value)
values
  ('system_instructions', '{"text": "You are a helpful Discord assistant. Be friendly, concise, and helpful."}'),
  ('ai_config', '{"provider": "gemini", "model": "gemini-1.5-flash", "temperature": 0.7, "max_tokens": 512}')
on conflict (key) do nothing;

-- Ensure ai_config uses Gemini defaults (updates if exists)
insert into settings (key, value)
values ('ai_config', '{"provider": "gemini", "model": "gemini-1.5-flash", "temperature": 0.7, "max_tokens": 512}')
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

/* =====================================================
   ALLOWED CHANNELS (Guild text channels the bot will read/respond)
===================================================== */
create table if not exists allowed_channels (
  id uuid primary key default gen_random_uuid(),
  channel_id text unique not null,
  channel_name text,
  server_id text,
  added_at timestamptz default now()
);

-- Note: Add channels using the addChannel script or admin dashboard
-- Example: npm run add:channel -- --channelId=YOUR_CHANNEL_ID --serverId=YOUR_SERVER_ID --name="general"

/* =====================================================
   MESSAGES (Optional short-lived history for context)
===================================================== */
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  server_id text,
  message_id text not null,
  user_id text not null,
  username text,
  content text not null,
  role text check (role in ('user','assistant')),
  created_at timestamptz default now()
);

/* =====================================================
   SUMMARIES (Rolling memory per channel)
===================================================== */
create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  channel_id text unique not null,
  server_id text,
  summary text not null,
  message_count integer default 0,
  updated_at timestamptz default now(),
  last_message_at timestamptz default now()
);

-- Backfill columns for existing databases (safe if already present)
alter table if exists allowed_channels add column if not exists server_id text;
alter table if exists messages add column if not exists server_id text;
alter table if exists summaries add column if not exists server_id text;

/* =====================================================
   KNOWLEDGE CHUNKS (RAG store)
   - Stores embedded chunks for retrieval
   - Uses text-embedding-004 (768-dim)
===================================================== */
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768) not null,
  created_at timestamptz default now()
);

create index if not exists idx_knowledge_chunks_source on knowledge_chunks(source);
create index if not exists idx_knowledge_chunks_embedding on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC helper: match knowledge chunks by cosine similarity
create or replace function match_knowledge_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_source text default null
)
returns table (
  id uuid,
  content text,
  source text,
  source_id text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    kc.id,
    kc.content,
    kc.source,
    kc.source_id,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  where filter_source is null or kc.source = filter_source
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

/* =====================================================
   INDEXES
===================================================== */
create index if not exists idx_messages_channel on messages(channel_id);
create index if not exists idx_messages_server_channel on messages(server_id, channel_id);
create index if not exists idx_messages_created on messages(created_at desc);
create index if not exists idx_allowed_channels_channel_id on allowed_channels(channel_id);
create index if not exists idx_allowed_channels_server_channel on allowed_channels(server_id, channel_id);

/* =====================================================
   NOTES
 - This schema assumes the bot uses the Service Role key
   for all writes. The web app can read via anon key.
 - Row Level Security (RLS) is NOT enabled by default here.
   If you enable RLS, add policies to allow required access.
 - Upserts from code should use onConflict on the unique columns:
   e.g., settings.onConflict('key'), summaries.onConflict('channel_id').
===================================================== */
