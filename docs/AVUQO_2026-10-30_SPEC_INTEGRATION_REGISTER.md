# AVUQO specification integration register, 30 October 2026

These three owner's handovers are preserved verbatim in the linked files in this commit. They are requirements and historical progress reports, not proof of the current implementation. Current GitHub main and actual Supabase state take precedence for release status.

## Verified current state
- GitHub: `crkian/AVUQO`, baseline `3471aff35eaa90760b6e2d99c12d1df2c6366f3d`. Existing website and Control Centre are live on Vercel.
- Supabase project `tfoukwcruaamrtgxzshh`: 1,384 category rows, 8 active, 1,376 inactive. Do not activate inactive records automatically.
- Private importer: 5 import runs, 4,588 staged records; this includes AKKO imported twice. Never equate staged rows with distinct products.
- Analytics: `public.analytics_events` already exists with zero events at audit, `click_events` had 7, `affiliate_conversions` had zero. There is no evidence of complete first-party analytics instrumentation or live revenue reconciliation.
- Existing `analytics_events` anonymous INSERT permission needs a separate privacy/security review. Do not turn on new tracking without consent and legal review.

## Outstanding unmerged PR dependencies
- #20 affiliate approval security: independent, draft.
- #21 overlapping Saved/Watches journey: draft; reconcile with #22, do not merge both blindly.
- #22 Saved/Watches and master delivery plan: draft.
- #23 Crafts/Chocolate/Keyboards premium pages and feed review: draft.
- #24 private Awin category seed: based on #23, draft; 25 category rows already in Supabase.
- #25 universal inactive taxonomy and Control Centre taxonomy: draft; 1,351 additional inactive rows already in Supabase.

Do not re-run seeds without checking idempotency, publish unverified imports, modify another brand's systems, or treat draft PR work as deployed.

## Product architecture decisions
1. One universal catalogue; canonical product identity separate from merchant offers, conditions, variants and price observations.
2. Reusable connectors only for explicitly authorised sources; source rights and health gate publication.
3. Separate commercial flows: Site Advertising for outside businesses, Brand Social Marketing for our four brands, and eligible affiliate promotion downstream of verified AVUQO value.
4. Analytics is first-party and must be privacy-gated. A merchant click is never a conversion, basket comparisons are complete only with verified eligible prices, and missing data must be marked unavailable.
5. Use the existing Control Centre rather than adding a second admin site.
6. Scale in stages: 10,000, 100,000, 1,000,000+ validated offers as targets, never displayed as actual achievements.
7. A staged, production-tested feature cannot be called live solely because a PR or ZIP exists.

## Next execution gates
- Reconcile stacked PRs #20–#25 against latest main, using CI/preview and role-security tests.
- Audit existing `analytics_events`, `click_events`, cookie consent and revenue models before adding new collectors. Do not create a duplicate analytics event table.
- Add an owner-only, truthful analytics dashboard over existing authorised records before enabling consented event intake.
- Map staged feed records to vetted categories and canonical identities under owner review, preserving original records and rights state.
- Require separate production verification and explicit connected-account permissions for all external feeds and publishing workflows.
