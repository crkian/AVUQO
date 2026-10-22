-- Run this AFTER you have created your AVUQO login account.
--
-- IMPORTANT:
-- Replace YOUR_LOGIN_EMAIL@example.com with the exact email you use to
-- sign in to AVUQO, then run this query once in Supabase SQL Editor.

insert into public.user_roles (user_id, role)
select id, 'owner'
from auth.users
where lower(email) = lower('YOUR_LOGIN_EMAIL@example.com')
on conflict (user_id)
do update set
  role = excluded.role,
  updated_at = now();

-- Verify the result.
select
  u.email,
  r.role,
  r.updated_at
from public.user_roles r
join auth.users u on u.id = r.user_id
where lower(u.email) = lower('YOUR_LOGIN_EMAIL@example.com');
