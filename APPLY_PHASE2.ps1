$ErrorActionPreference = "Stop"

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = "C:\avuqo"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Backup = Join-Path $Target "_avuqo_phase2_backup_$Stamp"

if (-not (Test-Path $Target)) {
  throw "C:\avuqo was not found."
}

$Files = @(
  "app\layout.tsx",
  "app\phase2.css",
  "app\login\page.tsx",
  "app\watches\page.tsx",
  "components\layout\Header.tsx",
  "components\watch\WatchButton.tsx",
  "lib\watches\migrateLocalWatches.ts",
  "supabase\migrations\20261021223000_phase2_auth_watches.sql"
)

New-Item -ItemType Directory -Force -Path $Backup | Out-Null

foreach ($Relative in $Files) {
  $Existing = Join-Path $Target $Relative
  if (Test-Path $Existing) {
    $BackupFile = Join-Path $Backup $Relative
    $BackupDir = Split-Path -Parent $BackupFile
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    Copy-Item -Force $Existing $BackupFile
  }
}

foreach ($Relative in $Files) {
  $From = Join-Path $Source $Relative
  $To = Join-Path $Target $Relative
  $ToDir = Split-Path -Parent $To
  New-Item -ItemType Directory -Force -Path $ToDir | Out-Null
  Copy-Item -Force $From $To
}

Write-Host "AVUQO Phase 2 files installed." -ForegroundColor Green
Write-Host "Backup: $Backup"
Write-Host "Next: run AVUQO_PHASE2_AUTH_WATCHES.sql in Supabase SQL Editor, then npm.cmd run dev"
