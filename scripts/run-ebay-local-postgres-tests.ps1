# Free, local, ephemeral PostgreSQL 17 ONLY. Requires Docker already installed.
# No network, no published ports, no Supabase, no cloud provisioning, no production data.
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$repo=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is not installed; no chargeable resources will be created.' }
$container='avuqo-ebay-local-'+[guid]::NewGuid().ToString('N').Substring(0,12)
$started=$false
try {
 & docker info --format '{{.ServerVersion}}' | Out-Null
 if ($LASTEXITCODE -ne 0) { throw 'Local Docker Engine is not available.' }
 & docker run -d --name $container --network none --tmpfs '/var/lib/postgresql/data:rw,size=256m' -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17 | Out-Null
 if ($LASTEXITCODE -ne 0) { throw 'Disposable local postgres container did not start.' }
 $started=$true
 $ready=$false
 for($i=0;$i -lt 45;$i++){
  & docker exec -u postgres $container pg_isready -q
  if($LASTEXITCODE -eq 0){$ready=$true;break}
  Start-Sleep -Seconds 1
 }
 if(-not $ready){throw 'Disposable PostgreSQL did not become ready.'}
 $files=@{
 'tests/fixtures/ebay-local-schema.sql'='fixture.sql'
 'tests/fixtures/ebay-local-erasure-acceptance.sql'='acceptance.sql'
 'supabase/migrations/20261116153000_ebay_deletion_receipt_integrity_lock.sql'='receipt-integrity.sql'
 'supabase/migrations/20261116165000_ebay_atomic_tombstone_admission.sql'='atomic-lock.sql'
 'supabase/migrations/20261116181000_ebay_erasure_work_journal.sql'='work-journal.sql'
 'scripts/test-ebay-tombstone-race.sh'='test-ebay-tombstone-race.sh'
 'scripts/test-ebay-reverse-lock-witness.sh'='test-ebay-reverse-lock-witness.sh'
 'scripts/ebay-local-container-tests.sh'='run-tests.sh'
 }
 & docker exec -u postgres $container mkdir -p /tmp/avuqo
 if($LASTEXITCODE -ne 0){throw 'Unable to prepare container test directory.'}
 foreach($entry in $files.GetEnumerator()){
  $source=Join-Path $repo ($entry.Key -replace '/', [IO.Path]::DirectorySeparatorChar)
  if(-not(Test-Path $source)){throw "Missing repository file $($entry.Key)"}
  & docker cp $source "$($container):/tmp/avuqo/$($entry.Value)"
  if($LASTEXITCODE -ne 0){throw "Unable to copy $($entry.Key)"}
 }
 & docker exec -u postgres $container bash /tmp/avuqo/run-tests.sh
 if($LASTEXITCODE -ne 0){throw 'Local PostgreSQL acceptance tests failed; not a release pass.'}
 Write-Host 'PASS: isolated local PostgreSQL acceptance tests completed; production untouched.'
} finally {
 if($started){ & docker rm -f $container | Out-Null }
}
