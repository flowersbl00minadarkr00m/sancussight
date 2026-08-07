[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidatePattern('^[A-Za-z0-9._-]{1,160}$')]
  [string]$ReleaseRunId,

  [string]$StartedAt,

  [ValidateSet('sancussight-local-runtimes')]
  [string]$RuntimeTargetId = 'sancussight-local-runtimes',

  [ValidateSet('a002-t16')]
  [string]$Purpose = 'a002-t16',

  [string]$LocalAppDataRoot,

  [string]$RunRoot,

  [ValidatePattern('^fixture-[A-Za-z0-9._-]{1,80}$')]
  [string]$IsolatedFixtureLabel
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($LocalAppDataRoot)) {
  $LocalAppDataRoot = $env:LOCALAPPDATA
}
if ([string]::IsNullOrWhiteSpace($LocalAppDataRoot)) {
  throw 'RELEASE_DESCRIPTOR_LOCALAPPDATA_REQUIRED'
}
if ($IsolatedFixtureLabel -and -not $PSBoundParameters.ContainsKey('LocalAppDataRoot')) {
  throw 'RELEASE_DESCRIPTOR_FIXTURE_ROOT_REQUIRED'
}

$canonicalStartedAt = $null
if ([string]::IsNullOrWhiteSpace($StartedAt)) {
  $canonicalStartedAt = [DateTimeOffset]::UtcNow.ToString(
    "yyyy-MM-dd'T'HH:mm:ss.fff'Z'",
    [Globalization.CultureInfo]::InvariantCulture
  )
} else {
  $parsedStartedAt = [DateTimeOffset]::MinValue
  $parsed = [DateTimeOffset]::TryParseExact(
    $StartedAt,
    "yyyy-MM-dd'T'HH:mm:ss.fff'Z'",
    [Globalization.CultureInfo]::InvariantCulture,
    [Globalization.DateTimeStyles]::AssumeUniversal,
    [ref]$parsedStartedAt
  )
  if (-not $parsed -or $parsedStartedAt.Offset -ne [TimeSpan]::Zero -or $parsedStartedAt.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'") -cne $StartedAt) {
    throw 'RELEASE_DESCRIPTOR_STARTED_AT_INVALID'
  }
  $canonicalStartedAt = $StartedAt
}

$operationsRunsRoot = [IO.Path]::GetFullPath((Join-Path $LocalAppDataRoot 'SancusSight\operations\runs'))
$expectedRunRoot = [IO.Path]::GetFullPath((Join-Path $operationsRunsRoot $ReleaseRunId))
if ([string]::IsNullOrWhiteSpace($RunRoot)) {
  $RunRoot = $expectedRunRoot
} else {
  $RunRoot = [IO.Path]::GetFullPath($RunRoot)
  if (-not [string]::Equals($RunRoot.TrimEnd('\'), $expectedRunRoot.TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'RELEASE_DESCRIPTOR_RUN_ROOT_MISMATCH'
  }
}

$descriptorPath = Join-Path $RunRoot 'release-run.json'
if (Test-Path -LiteralPath $descriptorPath) {
  throw 'RELEASE_DESCRIPTOR_ALREADY_EXISTS'
}

[IO.Directory]::CreateDirectory($RunRoot) | Out-Null
$descriptor = [ordered]@{
  schemaVersion = 1
  releaseRunId = $ReleaseRunId
  startedAt = $canonicalStartedAt
  runtimeTargetId = $RuntimeTargetId
  purpose = $Purpose
}
$json = (($descriptor | ConvertTo-Json -Depth 3) -replace "`r`n", "`n") + "`n"
$encoding = New-Object Text.UTF8Encoding($false, $true)
$stream = $null
$writer = $null
try {
  $stream = New-Object IO.FileStream(
    $descriptorPath,
    [IO.FileMode]::CreateNew,
    [IO.FileAccess]::Write,
    [IO.FileShare]::None
  )
  $writer = New-Object IO.StreamWriter($stream, $encoding)
  $writer.NewLine = "`n"
  $writer.Write($json)
  $writer.Flush()
  $stream.Flush($true)
} finally {
  if ($writer) { $writer.Dispose() }
  elseif ($stream) { $stream.Dispose() }
}

[pscustomobject]@{
  schemaVersion = 1
  releaseRunId = $ReleaseRunId
  startedAt = $canonicalStartedAt
  runtimeTargetId = $RuntimeTargetId
  purpose = $Purpose
  descriptorPath = $descriptorPath
  isolatedFixtureLabel = if ($IsolatedFixtureLabel) { $IsolatedFixtureLabel } else { $null }
}
