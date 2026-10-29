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
