-- AVUQO Phase 2 patch: account-backed Watches
-- Run AFTER AVUQO_SUPABASE_RESET_AND_SETUP.sql has completed successfully.

alter table public.watches
  add column if not exists watch_key text;

update public.watches
set watch_key = 'legacy:' || id::text
where watch_key is null;

alter table public.watches
  alter column watch_key set not null;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'watches_user_watch_key_key'
      AND conrelid = 'public.watches'::regclass
  ) THEN
    ALTER TABLE public.watches
      ADD CONSTRAINT watches_user_watch_key_key UNIQUE (user_id, watch_key);
  END IF;
END $$;

create index if not exists watches_watch_key_idx
  on public.watches(watch_key);

-- Existing RLS policies from Phase 1 remain in force.
-- Quick verification output:
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'watches'
order by ordinal_position;
