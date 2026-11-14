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

**Verified production snapshot on 14 November 2026:** `0727c0866ad15053955dc3b9fa6822a043122376` (Vercel `dpl_5z93DKd4sceJjCdMFDpyi5zzca5U`, READY, `www.avuqo.com` alias, homepage HTTP 200). PR #183 Awin metadata monitor ambiguity guard is live; PR #181 editorial draft scheduler resilience and #176 private import setup retry are already live. This is a snapshot and must be reverified before changes.

## Next work
Continue reviewing private Awin import failure/retry behaviour and metadata freshness, with the new #183 feed inventory validation already live. Unauthenticated private monitor HTTP check remains unverified because connected Vercel inspection was blocked by deployment authentication. Do not invoke provider import to test it. Then finish owner-approved editorial draft acceptance. Preserve paused Awin source, image/offer rights, marketing emergency stop and Pneus cron.

## Additional visual work
Continue comparing production category, seasonal, product and account routes against the original warm-premium references. The faceted mark and storefront navigation changes are deployed via PR #161. Continue private Awin feed discovery/import retries and marketing editorial draft scheduling behind existing source and approval gates. PR #173 homepage fact-expiry/revocation safety is already live, with social publishing/AI still disabled and zero approved homepage campaigns on the latest database check. Open PRs and status live in the handover files.

## Ask a fresh ChatGPT conversation to resume

> Open GitHub `crkian/AVUQO` and read `AVUQO_START_HERE.md` and the linked live handover/state JSON. Verify Vercel production READY commit and alias, relevant Supabase sources, plus open PRs. Report exactly what is live, owner-only or pending, then continue the next safe production task. Update the handover and changelog in every release.

These files are easy for a **connected GitHub-aware chat to read**, but **they are not injected automatically into every new conversation**; a future chat must retrieve them.
