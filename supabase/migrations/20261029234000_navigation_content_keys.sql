-- Navigation content shares the existing audited footer CMS tables.
-- No table recreation, no changes to published footer or existing keys/rows.
alter table public.site_content_drafts
 drop constraint site_content_drafts_key_check;
alter table public.site_content_drafts
 add constraint site_content_drafts_key_check check (key in ('footer','navigation'));
alter table public.site_content_published
 drop constraint site_content_published_key_check;
alter table public.site_content_published
 add constraint site_content_published_key_check check (key in ('footer','navigation'));
alter table public.site_content_revisions
 drop constraint site_content_revisions_key_check;
alter table public.site_content_revisions
 add constraint site_content_revisions_key_check check (key in ('footer','navigation'));

-- Existing RLS remains in place: public can read PUBLISHED content only, with
-- authenticated owner/editor checks enforced by server actions; draft is private.
-- The public header uses a vetted default until navigation is explicitly published.
