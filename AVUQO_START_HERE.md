# AVUQO · START HERE (current GitHub state)

**For any future ChatGPT chat, developer or coding agent:** This repository holds the latest AVUQO handover. **Read from current `main`, not conversational memory or old screenshots.**

1. **[Live-versus-staged handover](docs/AVUQO_LIVE_HANDOVER.md)**: deployment evidence, current work, open PRs, image rights and exact next task.
2. **[Machine-readable state](docs/AVUQO_CURRENT_STATE.json)**: compact versioned JSON for an agent to parse and report. It is time-stamped, **not a live API**.
3. **[AGENTS.md](AGENTS.md)**: mandatory safety, Next.js, source rights, CI and visual-conformity instructions.
4. **[Project Compass](docs/AVUQO_PROJECT_COMPASS.md)**: extensive context, original specification and historical sources.
5. **[Project Status](docs/PROJECT_STATUS.md)** and **[Production Partner & Visual Backlog](docs/AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md)**: feature history and next execution work.
6. **[Original visual reference index](docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md)**: approved visual brief. Original design image binaries: historical `design/warm-premium-visual-system-20261105` branch, `docs/design/mockups/`.

## Important: what actually counts as LIVE?

**A merged PR isn't by itself a deployed feature.** In every session, verify current GitHub `main` and Vercel project `avuqo` latest READY **production** deployment and `www.avuqo.com` alias. If the SHA differs from this snapshot, treat the snapshot as stale and update it after verifying. For provider-dependent claims, inspect Supabase source permissions, feed freshness and publication gates. No public imported Awin/eBay/tyre images or prices without rights and current evidence.

**Latest verified production at 13 Nov 2026:** `9093cbc9d9f4b814beea5cb82b432896879a4e98` (Vercel READY and `www.avuqo.com` alias). This is a **snapshot**, not a promise that the domain has not changed since.

## Next work
Continue comparing production category, seasonal, product and account routes against the original warm-premium references. The faceted mark and storefront navigation changes are deployed via PR #161. Continue the private Awin and campaign scheduling work behind existing source and approval gates. Open PRs and status live in the handover files.

## Ask a fresh ChatGPT conversation to resume

> Open GitHub `crkian/AVUQO` and read `AVUQO_START_HERE.md` and the linked live handover/state JSON. Verify Vercel production READY commit and alias, relevant Supabase sources, plus open PRs. Report exactly what is live, owner-only or pending, then continue the next safe production task. Update the handover and changelog in every release.

These files are easy for a **connected GitHub-aware chat to read**, but **they are not injected automatically into every new conversation**; a future chat must retrieve them.
