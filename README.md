# AVUQO

An evidence-led UK comparison and savings application. Current customer website: https://www.avuqo.com.

## One-link live handover for new chats

**[AVUQO_START_HERE.md](AVUQO_START_HERE.md)** is the canonical first file for every new ChatGPT/project development conversation. It links to **[live vs private state](docs/AVUQO_LIVE_HANDOVER.md)** and **[machine-readable state](docs/AVUQO_CURRENT_STATE.json)**. A connected chat must fetch current GitHub, open PRs and Vercel READY production SHA rather than blindly trusting snapshot metadata.

## Start here

- **[Complete Git, all 22 branches, original ideas and every handover](docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md):** master navigable index of 9 original source assets, all 29 numbered workstreams, 12 detailed gaps, 22 current branch refs, five open PRs, verified releases and source/privacy caveats. [Machine-readable index](docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.json). This is a dated inventory, not proof that every idea is live.

- **[AVUQO Project Compass](docs/AVUQO_PROJECT_COMPASS.md):** mandatory cross-chat handover for the original sources, the warm-premium design, branch audits, deployment history, owner advertising/automation and the next verified milestone.
- **[Approved design reference screenshots](docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md):** original uploaded account, seasonal, beauty, home, lists, watches, product and mobile concepts.
- **[Warm-premium design specification](docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md):** locked visual baseline and tokens.

- **[Live project register](docs/PROJECT_STATUS.md):** feature status, release gates, open integration work, and what is NOT live.
- **[Prioritised roadmap](docs/ROADMAP.md):** P0–P4 work IDs, dependencies, blockers and acceptance criteria.
- **[Specification-to-code audit (2 Nov 2026)](docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md):** source-by-source requirements, inspected code/data and measurable maturity.
- **[Source manifest and requirement gaps](docs/SOURCE_MANIFEST_2026-11-02.md):** exact supplied source inventory and [specific uncovered requirements](docs/SOURCE_REQUIREMENT_GAPS_2026-11-02.md).
- **[Changelog](CHANGELOG.md):** versioned customer and infrastructure changes.
- **[Technical integration register](docs/AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md):** architectural decisions and earlier handover audit.
- **[Contributor/assistant instructions](AGENTS.md):** read these before editing code.

### Version and release rules

The single application version is `package.json#version`, mirrored in `package-lock.json`. A feature PR must update the living register and changelog; planned features must remain labelled proposed until production deployment and verification. GitHub `main` and its commit SHA are definitive for what has been merged. The current production SHA must be checked in Vercel separately.

This repository is connected to GitHub and Vercel. Other chats can read the current register **when they access the GitHub repository**; the document does not auto-appear in every chat.

### Safe local workflow (Windows PowerShell)

```powershell
cd C:\\avuqo
npm ci
npm run lint
npm run build
```

Original historical v0.8 footer patch notes are preserved in Git history and are not the current README.
