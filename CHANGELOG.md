# AVUQO software changelog

## Unreleased documentation / audit addendum (2 November 2026)
- Indexed nine original owner-provided source files using SHA-256, without publishing the confidential source documents or concept art to the GitHub repository.
- Traced 12 granular requirements not obvious from broad feature rows, particularly real natural-language search, explainable Preference Graph, scheduled seasonal campaigns, and PWA/push/native differences.
- Updated roadmap with P1-07, P2-06, P3-06, P4-05, and snapshot-integrity acceptance in P0-03. Read-only database checks reconfirmed baseline; no schema, product, feed or app code changed.
- **Documentation only:** software version remains v0.2.0.

## Original source-to-code audit (2 November 2026)
- Reviewed original master product and grocery PDFs, affiliate, content/Control Centre, analytics, unified source-of-truth and catalogue handovers and brand visual reference against current main, Vercel and read-only Supabase.
- Added `docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md` with source provenance, 25 workstream maturity assessments and data/rights caveats.
- Added `docs/ROADMAP.md` with prioritised P0–P4 work, explicit acceptance gates and preservation of PR #21/#25 dependencies.
- Updated the living status, README and coding-agent entry point. **Documentation only: software remains v0.2.0; no migration, feed, credential or publication state changed.**

Versions below refer to the Next.js application in `package.json`, not historical v0.8 planning documents. GitHub tags and production SHA are the definitive release record.

## [0.2.0] - 2026-11-02 (main, deployment READY; signed-in customer acceptance pending)
- Merged through PR #34 at commit `79064ac4f24a73459c0506c4a18a4eeb9c07b2b4`, deployed to Vercel production with READY status.\n- Establish a living, versioned feature register and a mandatory check that future change PRs update the changelog/status.
- Add personal wishlist and a single grouped planning basket for approved affiliate offers, using existing private Supabase list tables.
- Allow the customer to save a basket into a named private list, copy the summary and launch an email draft in their own email application.
- Explicitly keep checkout with retailers and label saved prices as captured snapshots. No automated email service or source feeds activated.

## [0.1.0] - Existing baseline (through 2026-11-01)
- Version previously recorded in the application's package metadata.
- Main already includes private Awin staged imports, a Control Centre, eight-network affiliate-readiness planning (PR #33), and promotion approval improvements (PR #20).
- Production baseline verified at `17a73a6fc20ecad2c892d45f2e2c95b82a6087ef`. Earlier project documentation may call the product v0.8; that is a separate historical planning label.
