-- Replace the placeholder with the exact email you use to sign in to AVUQO.
insert into public.user_roles(user_id,role)
select id,'owner' from auth.users where lower(email)=lower('YOUR_LOGIN_EMAIL@example.com')
on conflict(user_id) do update set role='owner',updated_at=now();

select u.email,r.role from public.user_roles r join auth.users u on u.id=r.user_id
where lower(u.email)=lower('YOUR_LOGIN_EMAIL@example.com');
