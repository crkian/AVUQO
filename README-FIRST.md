# AVUQO v0.8: Inline product inspection + images

This patch updates only the current feed import review UI, parser, query and adds an additive SQL migration. No public publishing or affiliate activation.

## PowerShell (Windows)

```powershell
cd C:\avuqo
$backup = "C:\avuqo-backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
Copy-Item -LiteralPath "C:\avuqo" -Destination $backup -Recurse -Force
$zip = "$env:USERPROFILE\Downloads\AVUQO_v0.8_Inline_Product_Inspect.zip"
Expand-Archive -LiteralPath $zip -DestinationPath "C:\avuqo" -Force
npm run build
```

## Supabase SQL Editor BEFORE uploading another feed
Run `supabase/migrations/20261028020000_feed_import_images.sql` in the project SQL Editor.

## Backfill images
The earlier import only saved `image_present`, not the actual image URL. Upload the same AKKO `.csv.gz` **again** in the Control Centre after the migration. The newest run will then have thumbnails. Older import runs will not gain images automatically.

The image is sourced from the original merchant image field, only if it is an HTTPS URL. Missing/invalid URLs produce a placeholder. The full data feed is not published.

## Verify
- Inspect opens directly beneath the clicked product row; click Close to collapse.
- Thumbnail and larger image display for newly imported rows where the merchant supplies a valid HTTPS URL.
- Search and pagination work; review notes and decisions save and persist after refresh.
- Excluded products stay excluded and no links are exposed.

## Deploy (PowerShell, only after successful build)
```powershell
cd C:\avuqo
git status
git add app/control-centre/feed-imports/ReviewDashboard.tsx app/control-centre/feed-imports/page.tsx lib/feed-imports/parse.ts supabase/migrations/20261028020000_feed_import_images.sql
git commit -m "AVUQO inline product inspection and private feed images"
git push
```

Do not copy older dashboard files over this patch. No dependency changes required.
