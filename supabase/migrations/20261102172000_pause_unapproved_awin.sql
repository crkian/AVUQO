-- P0-02: Remove misleading active/sync state from the unapproved Awin source.
-- Only rows lacking required evidence are affected. No feed records, offers or
-- merchant data are deleted or published by this migration.
UPDATE public.sources
SET status='paused',
    sync_enabled=false,
    updated_at=now()
WHERE connector_key='awin'
  AND (
    credential_status IS DISTINCT FROM 'ready'
    OR metadata->>'usage_rights_confirmed' IS DISTINCT FROM 'true'
    OR coalesce(length(trim(metadata->>'rights_evidence_ref')),0) < 5
    OR metadata->>'feed_permission_confirmed' IS DISTINCT FROM 'true'
    OR coalesce(length(trim(metadata->>'feed_evidence_ref')),0) < 5
    OR NOT (coalesce(metadata->'allowed_territories','[]'::jsonb) @> '["GB"]'::jsonb)
    OR NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(metadata->'awin_advertisers')='array'
             THEN metadata->'awin_advertisers' ELSE '[]'::jsonb END
      ) AS approval
      WHERE approval->>'feed_permission_confirmed'='true'
        AND coalesce(length(trim(approval->>'approval_evidence_ref')),0)>=5
        AND approval->>'allowed_territory'='GB'
    )
  );
