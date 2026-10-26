-- AVUQO production-readiness checks.
-- This file is READ-ONLY. It does not modify your database.

-- 1) Public tables and whether Row Level Security is enabled.
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2) Current AVUQO owner/admin roles.
select
  u.email,
  r.role,
  r.updated_at
from public.user_roles r
join auth.users u on u.id = r.user_id
where r.role in ('admin', 'owner')
order by r.role, u.email;

-- 3) Operational source status.
select
  name,
  status,
  sync_enabled,
  last_synced_at
from public.sources
order by name;

-- 4) Open operational exceptions.
select
  id,
  exception_type,
  severity,
  status,
  created_at
from public.exceptions
where status not in ('resolved', 'closed')
order by created_at desc
limit 50;
