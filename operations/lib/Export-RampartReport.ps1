[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][ValidatePattern('^0\.1\.0$')][string]$SourceVersion,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._:-]{1,160}$')][string]$RunId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._:-]{1,160}$')][string]$TargetId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._:-]{1,80}$')][string]$SuiteVersion,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9._:-]{1,80}$')][string]$EvaluatorVersion,
  [ValidatePattern('^[a-f0-9]{64}$')][string]$ConfigurationHash
)
$ErrorActionPreference = 'Stop'

$raw = Get-Content -LiteralPath $InputPath -Raw | ConvertFrom-Json
$allowedTopLevel = @('total_runs', 'passed', 'failed', 'undetermined', 'errors', 'duration_seconds', 'population_summary', 'by_harm_category')
foreach ($property in $raw.PSObject.Properties.Name) {
  if ($property -notin $allowedTopLevel) { throw "Unsupported official RAMPART report field: $property" }
}
if ($null -eq $raw.by_harm_category -or [int]$raw.total_runs -lt 1) { throw 'Input is not an official RAMPART 0.1.0 JSON report.' }

function Get-StableResultId {
  param([string]$Value)
  $bytes = [Text.Encoding]::UTF8.GetBytes($Value)
  $algorithm = [Security.Cryptography.SHA256]::Create()
  try { $hash = $algorithm.ComputeHash($bytes) } finally { $algorithm.Dispose() }
  return 'rampart-' + (($hash | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 32)
}

$results = @()
foreach ($category in $raw.by_harm_category.PSObject.Properties) {
  $ordinal = 0
  foreach ($result in @($category.Value)) {
    $ordinal++
    $status = [string]$result.status
    if ($status -notin @('safe', 'unsafe', 'undetermined', 'error')) { throw "Unsupported RAMPART status: $status" }
    $scenarioId = [string]$result.metadata.scenarioId
    $observedAt = [string]$result.metadata.observedAt
    if ($scenarioId -notmatch '^[A-Za-z0-9._:-]{1,160}$' -or [string]::IsNullOrWhiteSpace($observedAt)) { throw 'RAMPART result is missing bounded scenario identity or observation time.' }
    $summary = [string]$result.summary
    $strategy = [string]$result.strategy
    $results += [ordered]@{
      resultId = Get-StableResultId "$RunId|$TargetId|$scenarioId|$status|$ordinal"
      scenarioId = $scenarioId
      status = $status
      safe = [bool]$result.safe
      summary = $summary.Substring(0, [Math]::Min(320, $summary.Length))
      harmCategory = ([string]$category.Name).Substring(0, [Math]::Min(80, ([string]$category.Name).Length))
      strategy = $strategy.Substring(0, [Math]::Min(160, $strategy.Length))
      durationMs = [Math]::Max(0, [double]$result.duration_seconds * 1000)
      observedAt = $observedAt
    }
  }
}
if ($results.Count -ne [int]$raw.total_runs) { throw 'RAMPART result count does not match the official report total.' }

$output = [ordered]@{
  schemaVersion = 1
  sourceVersion = $SourceVersion
  runId = $RunId
  targetId = $TargetId
  suiteVersion = $SuiteVersion
  evaluatorVersion = $EvaluatorVersion
  results = $results
  operational = [ordered]@{
    qualification = 'operational'
    sourceVersion = $SourceVersion
    runId = $RunId
    targetId = $TargetId
    contractVersion = 'rampart-v1'
  }
}
if ($ConfigurationHash) { $output.operational.configurationHash = $ConfigurationHash }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null
$json = $output | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($OutputPath, $json, (New-Object Text.UTF8Encoding($false)))
