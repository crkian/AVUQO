-- Private cron attempt audit for four physical feeds and the existing Tooled Up
-- capture/validation stages. Exactly fixed jobs. No urls, secrets or product rows.
CREATE TABLE IF NOT EXISTS public.awin_private_cron_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 job_key text NOT NULL CHECK (job_key IN (
  'pilot_petlibro','pilot_mozillion','pilot_cadbury','pilot_craftbuddy',
  'tooled_up_snapshot','tooled_up_validation')),
 started_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz,
 state text NOT NULL DEFAULT 'started' CHECK
  (state IN ('started','completed','disabled','rejected','exception')),
 http_status smallint CHECK (http_status BETWEEN 100 AND 599),
 outcome_code text CHECK (outcome_code ~ '^[a-z0-9_]{2,80}$'),
 duration_ms integer CHECK (duration_ms BETWEEN 0 AND 3600000),
 CONSTRAINT awin_private_cron_complete_consistency CHECK (
  (state='started' AND finished_at IS NULL AND http_status IS NULL)
  OR (state<>'started' AND finished_at IS NOT NULL AND http_status IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS awin_private_cron_attempts_recent
 ON public.awin_private_cron_attempts (job_key,started_at DESC);
ALTER TABLE public.awin_private_cron_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.awin_private_cron_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.awin_private_cron_attempts TO service_role;
COMMENT ON TABLE public.awin_private_cron_attempts IS
 'Service-role-only, sanitized, private scheduled feed attempts. No credentials, merchant URLs, sample rows, images or public release privileges.';
