# AVUQO v0.7 - Vercel + Supabase production deployment

This pack is designed to make AVUQO publicly reviewable and production-connected.

## Recommended launch architecture

For the quickest Awin-ready launch, keep the current Supabase project as the
initial production database. Once AVUQO has real traffic, create a separate
staging Supabase project and keep production isolated.

Vercel:
- `main` branch = Production
- other branches / PRs = Preview

Supabase:
- current project = Production initially
- RLS remains the security boundary
- Control Centre remains admin/owner only

## Before deployment

Run locally:

```powershell
cd C:\avuqo
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm.cmd run build
```

Commit:

```powershell
git status
git add .
git commit -m "Prepare AVUQO for production deployment"
git push origin main
```

## First Vercel deployment

1. Sign in to Vercel with GitHub.
2. Choose **Add New → Project**.
3. Import the AVUQO GitHub repository.
4. Ensure the Production Branch is `main`.
5. Framework should auto-detect as **Next.js**.
6. Leave Build Command as the Next.js default (`npm run build`).
7. Add environment variables before deploying.

### Vercel Production environment variables

Config:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Secret:
- `SUPABASE_SECRET_KEY`

After you know the final production URL/domain also add:
- `NEXT_PUBLIC_SITE_URL=https://your-domain.example`

Awin secrets should be added only after approval:
- `AWIN_PUBLISHER_ID`
- `AWIN_ADVERTISER_ID`
- `AWIN_ADVERTISER_NAME`
- `AWIN_ACCESS_TOKEN`
- `AWIN_LOCALE=en_GB`

Do not expose `SUPABASE_SECRET_KEY` or `AWIN_ACCESS_TOKEN` with
`NEXT_PUBLIC_`.

## Preview environment

For Preview deployments you can use:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

It is safer to omit privileged production values from Preview:
- do not add `SUPABASE_SECRET_KEY`
- do not add Awin credentials

That means previews can render the consumer application and auth, while they
cannot run privileged ingestion jobs.

## Supabase Auth URL Configuration

Go to:
Authentication → URL Configuration

### During the first Vercel deployment

Set Site URL to the production Vercel URL, e.g.

`https://avuqo.vercel.app`

Add Redirect URLs:
- `http://localhost:3000/**`
- `http://localhost:3001/**`
- `http://localhost:3002/**`
- `https://YOUR-PROJECT.vercel.app/**`
- your Vercel Preview wildcard if you use Preview auth

### After connecting your final domain

Change Site URL to your canonical domain:

`https://www.your-domain.example`

Add:
- `https://www.your-domain.example/**`
- `https://your-domain.example/**`

Keep localhost redirects for development.

## Supabase email templates

Because AVUQO uses server-side cookie auth, configure the email templates to
send token hashes to the AVUQO confirmation route.

Authentication → Email Templates → Confirm signup

Use a link equivalent to:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

For password recovery, use:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

AVUQO v0.7 includes both `/auth/confirm` and `/reset-password`.

## Supabase production hardening

Before real traffic:
- run Security Advisor
- confirm RLS is enabled on every public table that should not be globally open
- review all policies
- enable SSL Enforcement
- protect your Supabase organization/account with MFA
- enable email confirmations
- configure a custom SMTP service before relying on auth email deliverability
- review Auth rate limits
- run Performance Advisor

`SUPABASE_PRODUCTION_CHECKS.sql` provides read-only checks for RLS, roles,
sources and exceptions.

## Custom domain on Vercel

Vercel:
Project → Settings → Domains

Add your production domain. Vercel will show the exact DNS records required by
your DNS provider.

Recommended canonical setup:
- add apex domain: `your-domain.example`
- add `www.your-domain.example`
- choose one as canonical and redirect the other

After DNS is verified:
1. set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL
2. redeploy
3. update Supabase Site URL
4. add both domain forms to Supabase Redirect URLs

## Production smoke test

Public:
- `/`
- `/discover`
- `/categories`
- `/score`
- `/reality-check`
- `/about`
- `/trust`
- `/affiliate-disclosure`
- `/privacy`
- `/terms`
- `/contact`
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`
- `/api/health`

Authentication:
- create account
- receive confirmation email
- confirm email
- sign in
- sign out
- forgot password
- reset password

User state:
- Watch a deal
- Save a deal
- create/use a Shared List
- verify persistence after refresh/sign-in

Private:
- sign in as owner
- `/control-centre`
- `/control-centre/sources`
- `/control-centre/pipeline`
- `/control-centre/promotions`
- `/control-centre/exceptions`
- `/control-centre/automation`
- `/control-centre/revenue`
- `/control-centre/trust`

Pipeline:
- run demo ingestion
- inspect published deal
- test `/go/[offerId]`
- confirm click attribution

## Awin

Do not finish the Promotional Space application until:
- AVUQO is publicly reachable over HTTPS
- About/Trust/Affiliate Disclosure/Privacy/Terms/Contact are visible
- the homepage and discovery experience work
- there are no public build/runtime errors

Use the canonical production domain as the Awin Promotional Space URL.
