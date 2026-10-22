param(
  [string]$Target = "C:\avuqo"
)

$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Backup = Join-Path $Target "_avuqo_backup_$Stamp"

$Files = @(
  "app\layout.tsx",
  "app\globals.css",
  "app\page.tsx",
  "app\search\page.tsx",
  "app\deal\[id]\page.tsx",
  "app\watches\page.tsx",
  "components\layout\Header.tsx",
  "components\score\AvuqoScore.tsx",
  "components\deal\DealCard.tsx",
  "components\watch\WatchButton.tsx",
  "data\mock\deals.ts",
  "types\deal.ts",
  "lib\supabase\client.ts",
  "supabase\migrations\20261021220000_avuqo_initial.sql"
)

if (-not [System.IO.Directory]::Exists($Target)) {
  throw "Target folder does not exist: $Target"
}

[System.IO.Directory]::CreateDirectory($Backup) | Out-Null

foreach ($Relative in $Files) {
  $Src = [System.IO.Path]::Combine($Source, $Relative)
  $Dst = [System.IO.Path]::Combine($Target, $Relative)
  $DstDir = [System.IO.Path]::GetDirectoryName($Dst)
  [System.IO.Directory]::CreateDirectory($DstDir) | Out-Null

  if ([System.IO.File]::Exists($Dst)) {
    $BackupFile = [System.IO.Path]::Combine($Backup, $Relative)
    $BackupDir = [System.IO.Path]::GetDirectoryName($BackupFile)
    [System.IO.Directory]::CreateDirectory($BackupDir) | Out-Null
    [System.IO.File]::Copy($Dst, $BackupFile, $true)
  }

  [System.IO.File]::Copy($Src, $Dst, $true)
  Write-Host "Installed $Relative" -ForegroundColor Green
}

Write-Host ""
Write-Host "AVUQO files installed into $Target" -ForegroundColor Cyan
Write-Host "Backup: $Backup" -ForegroundColor Yellow
Write-Host "Next: run npm.cmd run dev from C:\avuqo" -ForegroundColor Cyan
