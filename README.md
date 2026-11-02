# AVUQO

An evidence-led UK comparison and savings application. Current customer website: https://www.avuqo.com.

## Start here

- **[Live project register](docs/PROJECT_STATUS.md):** feature status, release gates, open integration work, and what is NOT live.
- **[Prioritised roadmap](docs/ROADMAP.md):** P0–P4 work IDs, dependencies, blockers and acceptance criteria.
- **[Specification-to-code audit (2 Nov 2026)](docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md):** source-by-source requirements, inspected code/data and measurable maturity.
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
