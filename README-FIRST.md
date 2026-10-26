# AVUQO v0.8 Phase 2: Legal Content Management

**Not deployed or tested against the live Supabase project.** This is an additive patch based on the supplied v0.7 build and the Phase 1 content editor. Do not deploy directly to production without preview validation.

## Install order
1. Back up the current live repository and Supabase schema. Confirm the v0.8 Phase 1 footer editor has been integrated. This ZIP does **not** replace the footer editor.
2. Copy files into the matching project paths, preserving folder structure. Inspect conflicts first.
3. Run `sql/AVUQO_v0_8_LEGAL_CONTENT.sql` in a staging Supabase project after checking `public.is_avuqo_admin()` and `public.user_roles` match your deployed schema.
4. Run `npm run build` and TypeScript checks, then deploy to a Vercel preview.
5. Visit `/control-centre/content/legal`, save a draft, ensure anonymous users cannot see drafts, and publish using the owner account after genuine legal review.
6. Verify each public page still renders its original source copy before any new publication. Confirm published content becomes visible and revisions are recorded atomically.
7. Repeat tests in production before enabling edits for other administrators.

## Intentional safeguards
- Plain-text content is rendered as text, not arbitrary HTML or JavaScript.
- No policy is silently drafted or auto-published. Existing legal copy remains visible until reviewed content is published.
- Only server-confirmed owner accounts can publish. Database RPC rechecks ownership and creates version history in the same transaction.
- This release does not include a rollback UI, rich text, scheduled publishing, cookie consent or document approval delegation. Future stages can build these on the version records.
- Any prior legal-page changes made after the uploaded v0.7 source should be merged rather than overwritten. In particular, compare the cookies page with your current code.
- User's legal identity, data controller, service providers, purposes, retention schedules and actual cookie inventory must be verified by the business and appropriately reviewed before any published legal update.

## New files
- SQL migration; `lib/content/legal.ts`; `components/legal/ManagedLegalPage.tsx`; `components/legal/legacy/*`
- `/control-centre/content/legal` dashboard and server actions
- Replacement public route files for privacy, terms, cookies and affiliate disclosure

## Known integration note
Phase 1 footer editor navigation presently links only to `/control-centre/content`. Add a link to `/control-centre/content/legal` in the Control Centre menu after testing. Do not replace the entire navigation component from an older patch.
