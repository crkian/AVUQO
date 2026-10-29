-- Installed on AVUQO production after homepage migration to limit public metadata access.
revoke select on public.marketing_home_placements from anon;
grant select (id, brand_slug, title, summary, cta_label, href, sponsored, status, starts_at, ends_at, priority)
 on public.marketing_home_placements to anon;
