# AVUQO Marketing: four-brand editorial module

Scope: AVUQO, Fantasy Lockr, Capshur and Cluedoku get the same private marketing controls, with distinct brand identity, facts, plans and channel records. This is a **foundation rollout**; publishing is deliberately not implemented or enabled.

## Changes
- Control Centre sidebar gets a Marketing entry at /control-centre/marketing.
- Unified overview and workspaces: Brands, Facts, Content Studio, Calendar, Social Connections, Website Content, Automation, Analytics and Audit.
- Users with existing Control Centre rights can create private drafts. Owner role approves facts and drafts.
- Facts are owner-managed; no Fantasy Lockr source connection is present or authorised.
- Social account references do not connect accounts or include credentials.
- Post calendar dates are editorial intentions, not provider scheduling.
- Analytics distinguishes draft/approved counts from provider impressions, clicks and real published posts. The latter are **not available**.
- The migration uses existing private.is_avuqo_admin(), keeps RLS enabled, adds row guards and immutable trigger-driven audit records.

## Before enabling on a deployment
1. Review on an isolated branch against the *latest* source; inspect migrations and confirm private.is_avuqo_admin() and user_roles roles exist.
2. Run node --test tests/marketing-policy.test.mjs with Node 22.16+ and npm run build; run TypeScript/lint and manually test account-denied flows.
3. Back up and review the SQL migration. **Do not apply it without separate explicit approval.**
4. Only after migration and approval, merge/deploy; verify access and four-brand isolation in a preview.
5. Supply approved facts, proofs, website link and authorised social accounts individually for each brand.
6. In a future reviewed phase, build media storage, provider OAuth, AI creative generation, durable scheduling/reconciliation, limits and attribution. No social post can currently be sent.

## Non-negotiable boundaries
- No Fantasy Lockr website access, feeds, fixture/Rival/score/deadline data, API, DB or sync.
- No external website monitoring for any brand in this phase.
- No secret keys stored in marketing_channels or shipped in browser code.
- No live publisher route, cron, Buffer integration, email campaign, ads API or advertiser billing.
- Existing AVUQO Score/Promotion Score and affiliate permissions are unaffected.
- The server intentionally contains no MARKETING_LIVE_PUBLISH=YES code path.


## Phase 2 branch additions (prepared, not deployed)
- Caption generation via OpenAI Responses, image creation via the OpenAI Images API, and owner-uploaded PNG/JPEG with a private media library.
- Owner-reviewed image promotion to an approved public asset bucket, with rights evidence and alt text.
- Owner-only Buffer channel identity verification against the account's own organizations; no account is connected until credentials are configured and verification is run.
- Per-brand and global publishing and AI switches, default OFF, plus an emergency stop.
- Approved post queue, uniquely keyed per post; idempotent atomic claim, no blind retries, unknown-outcome reconciliation, provider metrics if supported and explicit owner cancellation.
- One-click weekly evergreen draft planning from approved, unexpired Avugo-managed facts.
- Hard safety switches in addition to RLS, including MARKETING_LIVE_PUBLISH and MARKETING_WORKER_ENABLED.
- Database guard triggers freeze approved claims and channel identities; server actions perform additional checks.
- No RSS, Fantasy Lockr integration, ad spend, or automated website publishing.

### Install and connection gates
1. DO NOT merge/publish the branch automatically. Review both additive migrations in order:
   supabase/migrations/20261029190000_marketing_four_brand_foundation.sql
   supabase/migrations/20261029200000_marketing_production_pipeline_NOT_APPLIED.sql
2. Review the current production schema and local CI before applying SQL. The second migration is intentionally not yet executed.
3. Configure server-only variables in a **preview environment** (no keys in source):
   MARKETING_LIVE_PUBLISH=NO
   MARKETING_WORKER_ENABLED=NO
   MARKETING_CONNECT_PROVIDERS=NO
   MARKETING_AI_GENERATION=NO
   BUFFER_API_KEY=(once user has chosen and authorised Buffer)
   OPENAI_API_KEY=(once user approves model spending)
   CRON_SECRET=(generated secret, not shared in chat or code)
   MARKETING_TEXT_MODEL=(verified model accessible to account)
   MARKETING_IMAGE_MODEL=(verified image model accessible to account)
4. Verify four-brand owner controls, draft storage, media approval and brand separation in preview.
5. Separately activate MARKET_CONNECT_PROVIDERS=YES **using the actual variable name MARKETING_CONNECT_PROVIDERS**, verify channel identities, then keep posting disabled while testing.
6. Start with one test channel and deliberately approved, low-risk test content. Observe Buffer scheduled vs sent status and cancellation/reconciliation.
7. Only after explicit production signoff, set MARKETING_LIVE_PUBLISH=YES plus owner-controlled global, brand and channel switches. Add a trusted Vercel cron to the protected worker endpoint after review; it is NOT installed as part of this branch.
8. Emergency stop prevents **new** dispatches, but a post already accepted by Buffer can still publish unless canceled at Buffer.

### Not implemented / dependent on further permission
- No credentials or external Facebook/Instagram authorisations have been provided in this branch.
- No external website CMS adapter for Capshur or Cluedoku, because actual site stacks/permissions require separate validation.
- Absolutely no Fantasy Lockr website/API/database/CMS integration.
- Website drafts remain manual owner-approved copies, not automatic publication.
- Real analytics are only Buffer-reported provider values after successful connection; no fabricated conversion or affiliate revenue.
- AI usage limits are request-count limits, not an independently reconciled GBP spending ceiling.
- Asset publication makes approved media publicly accessible. Do not approve media without checking licences and terms.
