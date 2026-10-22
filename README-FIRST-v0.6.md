# AVUQO v0.6 - Deal Intelligence Pipeline

This is an extract-over release for `C:\avuqo`.

It turns AVUQO's existing catalogue/control-centre foundation into an operating deal-intelligence loop:

**Source → ingestion evidence → normalisation → product matching → price history → AVUQO Score → publication → click attribution → Promotion candidate**

## What is new

### Private Control Centre

New route:

`/control-centre/pipeline`

It shows:
- pipeline readiness
- scored-offer count
- live-published count
- recent source runs
- accepted / rejected rows
- event stream
- one-click demo ingestion
- Awin ingestion button when credentials are configured

The source registry now keeps `status` and `sync_enabled` aligned when an owner pauses or resumes a source.

### Deterministic AVUQO Score v0.6

The pipeline stores seven score components separately:
- historical normal price
- competitor comparison
- historical low position
- genuine saving
- merchant quality
- delivery/inclusions
- evidence confidence

Affiliate commission has **zero influence** on this calculation.

### Canonical product matching

Matching order:
1. GTIN / EAN / UPC / MPN
2. canonical brand + model key
3. canonical title key
4. create a new canonical product when no safe match exists

Every match stores method, confidence and evidence.

### Price history

Every accepted observation writes a price-history point and an availability observation.

### Public publication layer

New `published_deals` table keeps public deal output separate from raw source/affiliate records.

New public routes:
- `/live`
- `/live/[offerId]`
- `/go/[offerId]`

The redirect route records the outbound merchant click before redirecting.

### Awin connector

The first live connector uses Awin's Enhanced Feed JSONL endpoint.

Server-only environment variables:
- `AWIN_PUBLISHER_ID`
- `AWIN_ADVERTISER_ID`
- `AWIN_ADVERTISER_NAME` (optional)
- `AWIN_ACCESS_TOKEN`
- `AWIN_LOCALE` (defaults to `en_GB`)

The connector streams and caps each run instead of loading an unlimited feed into memory.

### Automation endpoint

`POST /api/internal/pipeline/run`

Authorization:

`Authorization: Bearer <AVUQO_CRON_SECRET>`

Body example:

```json
{"sourceKey":"awin","limit":100}
```

This is designed for a future scheduled worker/cron. Do not expose the cron secret to browser code.

## Required installation

### 1. Extract

Stop AVUQO, then extract the ZIP directly over:

`C:\avuqo`

Choose **Replace files in the destination**.

### 2. Run SQL

Run this complete migration in Supabase SQL Editor:

`AVUQO_DEAL_INTELLIGENCE_PIPELINE_v0_6.sql`

It is additive and does not intentionally reset existing user data.

### 3. Add the backend Supabase secret

Open `C:\avuqo\.env.local` and add your server-only Supabase secret:

```env
SUPABASE_SECRET_KEY=sb_secret_...
```

Do **not** call it `NEXT_PUBLIC_SUPABASE_SECRET_KEY`.

Your existing public URL / anon or publishable key remains unchanged.

### 4. Build

```powershell
cd C:\avuqo
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
npm.cmd run build
```

### 5. Start

```powershell
npm.cmd run dev
```

### 6. Run the first pipeline

Sign in with your AVUQO owner account and open:

`/control-centre/pipeline`

Click **Run demo pipeline**.

Then open:

`/live`

You should see database-generated AVUQO deals.

## Enabling Awin later

Add the Awin environment values from `AVUQO_PIPELINE_ENV.example`, restart Next.js, then go to:

`/control-centre/sources`

Resume Awin, then go to:

`/control-centre/pipeline`

and run the Awin pipeline.

Do not paste Awin or Supabase secret keys into chat, Git, browser code or `NEXT_PUBLIC_*` variables.

## Git after a successful build/test

```powershell
git status
git add .
git commit -m "Add AVUQO deal intelligence pipeline"
git push origin main
```

`.env.local` is already ignored by the project's `.gitignore`, so secrets should not be committed.
