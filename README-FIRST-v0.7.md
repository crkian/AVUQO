# AVUQO v0.7 - Production Deployment Pack

This release prepares AVUQO to move from localhost to a public Vercel deployment
connected to Supabase.

## Adds

- production/canonical URL helper
- richer site metadata
- robots.txt
- sitemap.xml
- web manifest
- `/api/health` readiness endpoint
- Supabase SSR email-confirmation callback
- forgot/reset password flow
- About
- Trust
- Affiliate Disclosure
- Privacy
- Terms
- Contact
- production footer links
- custom 404
- Vercel/Supabase environment template
- read-only Supabase production checks
- full deployment runbook
- corrected Next CSS configuration

## Install

1. Stop AVUQO.
2. Extract this ZIP directly over `C:\avuqo`.
3. Choose **Replace files in the destination**.
4. No SQL migration is required.
5. Run:

```powershell
cd C:\avuqo
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm.cmd run build
```

6. If successful, commit:

```powershell
git status
git add .
git commit -m "Prepare AVUQO for production deployment"
git push origin main
```

Then follow `VERCEL_SUPABASE_DEPLOYMENT.md`.
