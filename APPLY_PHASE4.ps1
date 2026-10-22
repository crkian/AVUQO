$ErrorActionPreference = "Stop"

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = "C:\avuqo"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Backup = Join-Path $Target "_avuqo_phase4_backup_$Stamp"

Write-Host ""
Write-Host "AVUQO Phase 4 - Secure Control Centre" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $Target)) {
    throw "C:\avuqo does not exist."
}

$Files = @(
    "proxy.ts",
    "lib\supabase\server.ts",
    "lib\supabase\proxy.ts",
    "lib\auth\requireControlCentreAccess.ts",
    "app\control-centre\layout.tsx",
    "app\unauthorized\page.tsx"
)

New-Item -ItemType Directory -Force -Path $Backup | Out-Null

foreach ($Relative in $Files) {
    $SourceFile = Join-Path $Source $Relative
    $TargetFile = Join-Path $Target $Relative

    if (-not (Test-Path $SourceFile)) {
        throw "Missing installer file: $Relative"
    }

    $TargetDir = Split-Path -Parent $TargetFile
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

    if (Test-Path $TargetFile) {
        $BackupFile = Join-Path $Backup $Relative
        $BackupDir = Split-Path -Parent $BackupFile
        New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
        Copy-Item $TargetFile $BackupFile -Force
    }

    Copy-Item $SourceFile $TargetFile -Force
    Write-Host "Installed $Relative" -ForegroundColor Green
}

$SqlTarget = Join-Path $Target "supabase\phase4"
New-Item -ItemType Directory -Force -Path $SqlTarget | Out-Null

Copy-Item (Join-Path $Source "sql\01_SECURE_CONTROL_CENTRE.sql") `
          (Join-Path $SqlTarget "01_SECURE_CONTROL_CENTRE.sql") -Force

Copy-Item (Join-Path $Source "sql\02_MAKE_YOUR_ACCOUNT_OWNER.sql") `
          (Join-Path $SqlTarget "02_MAKE_YOUR_ACCOUNT_OWNER.sql") -Force

Write-Host ""
Write-Host "Phase 4 application files installed." -ForegroundColor Green
Write-Host "Backup: $Backup"
Write-Host ""
Write-Host "Run the two SQL files in Supabase before testing access."
