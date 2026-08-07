[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._:/-]{1,160}$')][string]$ReleaseRunId,
  [Parameter(Mandatory = $true)][ValidateSet('runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$ProducerId,
  [Parameter(Mandatory = $true)][ValidateSet('queued', 'running', 'waiting', 'completed', 'failed', 'cancelled')][string]$State,
  [Parameter(Mandatory = $true)][ValidateSet('preflight', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap', 'failure-recovery', 'bundling', 'finalizing')][string]$Stage,
  [Parameter(Mandatory = $true)][ValidateSet('starting', 'processing', 'waiting-for-producer', 'checkpointing', 'rendering', 'complete', 'failed', 'cancelled')][string]$MessageCode,
  [ValidatePattern('^[A-Za-z0-9._:/-]{1,160}$')][string]$TargetId = 'release-run',
  [string]$StartedAt = '',
  [int]$CompletedUnits = -1,
  [int]$TotalUnits = -1
)

Set-StrictMode -Version Latest
$progressDirectory = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'SancusSight\operations\progress'
$progressPath = Join-Path $progressDirectory 'current.json'
if (($CompletedUnits -lt 0) -xor ($TotalUnits -lt 0)) { throw 'CompletedUnits and TotalUnits must be supplied together.' }
if ($TotalUnits -eq 0 -or ($TotalUnits -gt 0 -and $CompletedUnits -gt $TotalUnits)) { throw 'Progress counts are outside the bounded range.' }

$now = (Get-Date).ToUniversalTime().ToString('o')
$startedAt = $now
$parsedStart = [DateTime]::MinValue
if ($StartedAt) {
  if (-not [DateTime]::TryParse($StartedAt, [ref]$parsedStart)) { throw 'StartedAt must be a valid timestamp.' }
  $startedAt = $parsedStart.ToUniversalTime().ToString('o')
}
if (Test-Path -LiteralPath $progressPath -PathType Leaf) {
  try {
    $existing = Get-Content -LiteralPath $progressPath -Raw | ConvertFrom-Json
    if ($existing.releaseRunId -eq $ReleaseRunId -and [DateTime]::TryParse($existing.startedAt, [ref]$parsedStart)) {
      $startedAt = ([DateTime]$parsedStart).ToUniversalTime().ToString('o')
    }
  } catch {
    # A malformed prior heartbeat is not reused; the next bounded update starts cleanly.
  }
}

$snapshot = [ordered]@{
  schemaVersion = 1
  contractVersion = 'release-progress-v1'
  releaseRunId = $ReleaseRunId
  producerId = $ProducerId
  targetId = $TargetId
  state = $State
  stage = $Stage
  startedAt = $startedAt
  updatedAt = $now
  messageCode = $MessageCode
}
if ($TotalUnits -gt 0) {
  $snapshot.completedUnits = $CompletedUnits
  $snapshot.totalUnits = $TotalUnits
}

New-Item -ItemType Directory -Path $progressDirectory -Force | Out-Null
$temporaryPath = Join-Path $progressDirectory ([IO.Path]::GetRandomFileName())
$encoding = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($temporaryPath, ($snapshot | ConvertTo-Json -Compress), $encoding)
if (Test-Path -LiteralPath $progressPath -PathType Leaf) {
  [IO.File]::Replace($temporaryPath, $progressPath, $null)
} else {
  [IO.File]::Move($temporaryPath, $progressPath)
}
Write-Output ("release-progress:{0}:{1}" -f $State, $ProducerId)
