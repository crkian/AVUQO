$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = "C:\avuqo"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Backup = Join-Path $Target "_avuqo_phase3_backup_$Stamp"

if (-not (Test-Path $Target)) { throw "C:\avuqo does not exist." }

$Files = @(
  "types\promotion.ts",
  "lib\promotion\score.ts",
  "lib\promotion\compliance.ts",
  "data\mock\promotions.ts",
  "app\api\promotions\evaluate\route.ts",
  "components\promotion\PromotionScore.tsx",
  "app\control-centre\promotions\promotions.module.css",
  "app\control-centre\promotions\page.tsx"
)

New-Item -ItemType Directory -Force -Path $Backup | Out-Null
foreach ($Relative in $Files) {
  $SourceFile = Join-Path $Source $Relative
  $TargetFile = Join-Path $Target $Relative
  if (-not (Test-Path $SourceFile)) { throw "Missing installer file: $Relative" }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetFile) | Out-Null
  if (Test-Path $TargetFile) {
    $BackupFile = Join-Path $Backup $Relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $BackupFile) | Out-Null
    Copy-Item $TargetFile $BackupFile -Force
  }
  Copy-Item $SourceFile $TargetFile -Force
  Write-Host "Installed $Relative" -ForegroundColor Green
}

$SqlSource = Join-Path $Source "sql\AVUQO_PHASE3_PROMOTION_ENGINE.sql"
$SqlTargetDir = Join-Path $Target "supabase\phase3"
New-Item -ItemType Directory -Force -Path $SqlTargetDir | Out-Null
Copy-Item $SqlSource (Join-Path $SqlTargetDir "AVUQO_PHASE3_PROMOTION_ENGINE.sql") -Force

Write-Host "Phase 3 installed. Backup: $Backup" -ForegroundColor Cyan
Write-Host "Run the SQL in Supabase, then npm.cmd run dev and open /control-centre/promotions"
