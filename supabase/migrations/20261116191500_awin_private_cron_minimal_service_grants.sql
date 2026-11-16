-- Supabase defaults may automatically grant service_role additional table
-- privileges at creation. Limit the private cron journal to the three
-- operations its API actually performs; retain postgres table ownership.
REVOKE ALL ON TABLE public.awin_private_cron_attempts FROM service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.awin_private_cron_attempts TO service_role;
REVOKE ALL ON TABLE public.awin_private_cron_attempts FROM PUBLIC, anon, authenticated;
