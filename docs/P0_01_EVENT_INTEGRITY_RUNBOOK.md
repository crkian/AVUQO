# P0-01 event-write integrity | 2 November 2026

## Why this patch exists
At the 2 Nov production audit, `public.analytics_events` and `public.click_events` each had effective INSERT grants to both `anon` and `authenticated`. Their RLS insert predicates only checked that the event user was absent or the current user. That does **not** prove a click, prevent client-forged campaign metadata, or establish tracking consent. No security incident was established by this audit.

## Remediation in this release
1. The `GET /go/[offerId]` endpoint still performs the existing verified-offer and HTTPS merchant-destination checks, then redirects. It **no longer writes a click event**, reads authentication, or stores referrer data. This deliberately pauses newly captured click metrics rather than retaining an untrustworthy logging path.
2. `20261102153000_event_write_integrity.sql` revokes direct INSERT/UPDATE/DELETE access to both event tables from anonymous/authenticated/PUBLIC roles and removes the two unsafe INSERT policies. It does not delete records or alter conversion-commission tables.
3. Tests assert safe merchant URL handling, verified redirect admission, disabled measurement switches, migration privileges and preservation of existing records.
4. The private analytics dashboard must continue to report existing records as **uncertified historical rows**, not verified clicks or sales.

## Safe release sequence
- Merge code only after GitHub CI success. Verify production Vercel SHA.
- Apply the **matching** reviewed Supabase migration after the redirect code is deployed. This is an explicit database operation, not performed by Vercel.
- Re-query effective grants and `pg_policies`; confirm `has_table_privilege('anon' / 'authenticated', ..., 'INSERT')` is false and both old INSERT policies have been removed.
- Confirm existing seven historical click rows remain and visiting an eligible `/go` route still redirects. No non-demo eligible public offers were available in the audit, so a real merchant smoke test requires a permissioned offer fixture.
- Check service role availability to internal reporting and check RLS security advisors. No new analytics collection should start.

## Negative acceptance cases
- Anonymous and signed-in REST direct POST to both tables returns permission denied, including with a `NULL` user_id, forged offer_id and arbitrarily large campaign metadata.
- Anonymous and signed-in callers cannot write affiliate conversions, modify past clicks or make a click appear as an earned sale.
- No browser/local-storage/consent status silently reactivates tracking. The cookie UI presently describes optional analytics as **not connected**.
- Existing redirects reject invalid offer IDs, unverified offers and non-HTTPS/credential-bearing destinations.
- Future provider ingestion must be separately approved, authenticated server-side, idempotent, auditable and separate `clicks` from network-confirmed `conversions`.

## Not yet implemented
This patch does not introduce consented visitor collection, a provider-reconciled revenue ledger, rate limiting, bot protections, email tracking or a customer acceptance test of real authenticated merchant clicks. These remain P0-01/P1-06/P3-04 and must be reviewed with the updated privacy notice before activation.

## Verification queries (read-only)
```sql
select relname, relrowsecurity,
  has_table_privilege('anon', 'public.' || quote_ident(relname), 'INSERT') as anon_insert,
  has_table_privilege('authenticated', 'public.' || quote_ident(relname), 'INSERT') as authenticated_insert
from pg_class
where relname in ('analytics_events', 'click_events') and relnamespace = 'public'::regnamespace;

select tablename, policyname, cmd, roles
from pg_policies where schemaname = 'public'
and tablename in ('analytics_events', 'click_events');

select (select count(*) from public.click_events) as historical_click_rows,
       (select count(*) from public.analytics_events) as historical_analytics_rows;
```

**Rollback consideration:** Do not blindly restore the former public INSERT policies. A code rollback may re-enable a route that attempts untrusted writes; keep the table closed until reviewed trusted measurement exists.
