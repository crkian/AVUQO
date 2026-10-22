$ErrorActionPreference = "Stop"

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = "C:\avuqo"

Write-Host ""
Write-Host "AVUQO Phase 3 style fix" -ForegroundColor Cyan
Write-Host ""

$PageSource = Join-Path $Source "app\control-centre\promotions\page.tsx"
$PageTarget = Join-Path $Target "app\control-centre\promotions\page.tsx"
$CssSource = Join-Path $Source "promotion-control-centre.css"
$CssTarget = Join-Path $Target "app\globals.css"

if (-not (Test-Path $PageSource)) { throw "Missing page.tsx" }
if (-not (Test-Path $CssSource)) { throw "Missing promotion CSS" }
if (-not (Test-Path $CssTarget)) { throw "Missing C:\avuqo\app\globals.css" }

Copy-Item $PageSource $PageTarget -Force

$Css = [System.IO.File]::ReadAllText($CssTarget)
$Marker = "/* AVUQO PROMOTION CONTROL CENTRE */"

if ($Css.Contains($Marker)) {
    $Pattern = '(?s)/\* AVUQO PROMOTION CONTROL CENTRE \*/.*\z'
    $Css = [System.Text.RegularExpressions.Regex]::Replace($Css, $Pattern, "")
}

$PromotionCss = [System.IO.File]::ReadAllText($CssSource)
$Css = $Css.TrimEnd() + "`r`n`r`n" + $PromotionCss.Trim() + "`r`n"

[System.IO.File]::WriteAllText(
    $CssTarget,
    $Css,
    [System.Text.Encoding]::UTF8
)

Write-Host "Updated promotion page." -ForegroundColor Green
Write-Host "Added Control Centre styles to app\globals.css." -ForegroundColor Green
Write-Host ""
Write-Host "No SQL changes are required."
Write-Host "Restart with:"
Write-Host "  cd C:\avuqo"
Write-Host "  npm.cmd run dev"
