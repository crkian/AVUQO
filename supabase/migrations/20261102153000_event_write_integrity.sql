-- P0-01: Fail closed on untrusted event insertion.
-- Both tables had anon/authenticated INSERT grants and permissive INSERT RLS
-- allowing clients to submit arbitrary event properties and fake offer clicks.
-- Historical event rows are intentionally preserved.
--
-- Deploy the matching /go route first: it must redirect eligible offers
-- without inserting client-trusted click_events records.
-- Future tracking requires explicit purpose-specific consent and a trusted,
-- rate-limited server intake; this migration does not enable one.

begin;

alter table public.analytics_events enable row level security;
alter table public.click_events enable row level security;

-- Remove the known writable surface, including possible PUBLIC inheritance.
revoke insert, update, delete on table public.analytics_events, public.click_events
  from anon, authenticated, public;

drop policy if exists "analytics event insert" on public.analytics_events;
drop policy if exists "click event insert" on public.click_events;

-- Do not grant any new privileges to client roles or relax conversion records.
-- Existing service_role grants remain intact for authorised future collectors.

commit;
