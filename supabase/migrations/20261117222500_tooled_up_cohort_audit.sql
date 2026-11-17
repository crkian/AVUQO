-- Audit every authenticated Tooled Up SKU cohort, including failed/no-match
-- runs, without persisting credentials, signed URLs, raw SKUs or product data.
alter table public.awin_private_cron_attempts
 drop constraint if exists awin_private_cron_attempts_job_key_check;
alter table public.awin_private_cron_attempts
 add constraint awin_private_cron_attempts_job_key_check check (
 job_key=any(array[
 'pilot_petlibro','pilot_mozillion','pilot_cadbury','pilot_craftbuddy',
 'tooled_up_snapshot','tooled_up_validation','tooled_up_cohort'
 ]::text[])
);
