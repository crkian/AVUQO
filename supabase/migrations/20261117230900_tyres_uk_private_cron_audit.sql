-- Distinct private audit lane for Tyres UK 12715 exact authenticated feed checks.
-- No feed rows, source URLs or secrets are recorded in this allowlisted journal.
alter table public.awin_private_cron_attempts
 drop constraint if exists awin_private_cron_attempts_job_key_check;
alter table public.awin_private_cron_attempts
 add constraint awin_private_cron_attempts_job_key_check check (
 job_key=any(array[
 'pilot_petlibro','pilot_mozillion','pilot_cadbury','pilot_craftbuddy',
 'tooled_up_snapshot','tooled_up_validation','tooled_up_cohort',
 'tyres_uk_recheck'
 ]::text[])
);
