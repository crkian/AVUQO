AVUQO Groceries: Suspense prerender fix

This patch replaces only two new groceries pages, preserving all existing AVUQO source elsewhere.

Windows PowerShell:
cd C:\avuqo
Copy-Item app\groceries\page.tsx app\groceries\page.tsx.before-suspense-fix -Force
Copy-Item app\control-centre\groceries\page.tsx app\control-centre\groceries\page.tsx.before-suspense-fix -Force
$zip = "$env:USERPROFILE\Downloads\AVUQO_Groceries_Suspense_Fix.zip"
$stage = Join-Path $env:TEMP 'AVUQO_Groceries_Suspense_Fix'
Expand-Archive -LiteralPath $zip -DestinationPath $stage -Force
Copy-Item (Join-Path $stage 'app\groceries\page.tsx') 'C:\avuqo\app\groceries\page.tsx' -Force
Copy-Item (Join-Path $stage 'app\control-centre\groceries\page.tsx') 'C:\avuqo\app\control-centre\groceries\page.tsx' -Force
npm run build

No SQL migration is needed. Don't deploy unless build succeeds. This patch was created from the supplied groceries addendum patch, not verified against the current Windows checkout.
