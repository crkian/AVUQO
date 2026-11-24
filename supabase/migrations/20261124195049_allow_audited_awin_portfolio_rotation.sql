-- Reconcile production migration 20261124195049.
-- Keep the existing fixed journal allowlist, adding the already scheduled
-- portfolio worker. Do not bypass the mandatory audit-before-download gate.
alter table public.awin_private_cron_attempts
 drop constraint awin_private_cron_attempts_job_key_check,
 add constraint awin_private_cron_attempts_job_key_check
 check (job_key in ('pilot_petlibro','pilot_mozillion','pilot_cadbury','pilot_craftbuddy',
 'tooled_up_snapshot','tooled_up_validation','tooled_up_cohort','tyres_uk_recheck',
 'pneus_private_import','portfolio_rotation'));
