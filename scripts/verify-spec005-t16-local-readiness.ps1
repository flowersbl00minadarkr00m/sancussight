[CmdletBinding()]
param(
  [string]$ProjectRoot,
  [string]$SancusSightWorkerRemitPath,
  [string]$SddExecWorkerRemitPath,
  [ValidatePattern('^[a-fA-F0-9]{64}$')]
  [string]$ExpectedSancusSightWorkerRemitSha256,
  [ValidatePattern('^[a-fA-F0-9]{64}$')]
  [string]$ExpectedSddExecWorkerRemitSha256,
  [string]$CanonicalCollectorDataDirectory,
  [string]$LegacyCollectorDataDirectory,
  [ValidateRange(1, 65535)]
  [int]$CollectorPort = 43117,
  [ValidateRange(1, 65535)]
  [int]$OtlpPort = 43120,
  [ValidateRange(1, 65535)]
  [int]$AIMapPort = 11434,
  [ValidateSet('Listening', 'Available')]
  [string]$CollectorPortState = 'Listening',
  [ValidateSet('Listening', 'Available')]
  [string]$OtlpPortState = 'Available',
  [ValidateSet('Listening', 'Available')]
  [string]$AIMapPortState = 'Listening',
  [switch]$FixtureMode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
  if ([string]::IsNullOrWhiteSpace($PSCommandPath)) {
    throw 'READINESS_SCRIPT_PATH_UNAVAILABLE'
  }
  $scriptDirectory = [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($PSCommandPath))
  $ProjectRoot = [IO.Path]::GetDirectoryName($scriptDirectory)
}

function Test-PathInside([string]$Path, [string]$Parent) {
  $fullPath = [IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
  $fullParent = [IO.Path]::GetFullPath($Parent).TrimEnd('\', '/')
  return $fullPath.Equals($fullParent, [StringComparison]::OrdinalIgnoreCase) -or
    $fullPath.StartsWith($fullParent + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
}

function Assert-RequiredLeaf([string]$Path, [string]$Code) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "$Code pathRole=$([IO.Path]::GetFileName($Path))"
  }
  if ((Get-Item -LiteralPath $Path).Length -le 0) {
    throw "$Code pathRole=$([IO.Path]::GetFileName($Path))"
  }
}

function Get-LoopbackPortState([int]$Port) {
  $listeners = @(
    [Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() |
      Where-Object { $_.Port -eq $Port }
  )
  if ($listeners.Count -eq 0) {
    return 'Available'
  }
  $nonLoopback = @($listeners | Where-Object {
    -not [Net.IPAddress]::IsLoopback($_.Address)
  })
  if ($nonLoopback.Count -gt 0) {
    return 'NonLoopback'
  }
  return 'Listening'
}

$canonicalProjectRoot = [IO.Path]::GetFullPath($ProjectRoot)
if (-not (Test-Path -LiteralPath $canonicalProjectRoot -PathType Container)) {
  throw 'READINESS_PROJECT_ROOT_MISSING'
}
if (-not $FixtureMode -and
    ($CollectorPort -ne 43117 -or $OtlpPort -ne 43120 -or $AIMapPort -ne 11434)) {
  throw 'READINESS_FIXED_PORT_MISMATCH'
}
if (@($CollectorPort, $OtlpPort, $AIMapPort | Sort-Object -Unique).Count -ne 3) {
  throw 'READINESS_PORT_CONFLICT'
}

$requiredRelativeFiles = @(
  'operations\manifests\producer-inventory.v1.json',
  'operations\manifests\release-run.example.json',
  'operations\telemetry\otlp-bridge.ts',
  'operations\telemetry\pi-extension.ts',
  'operations\praxen\draft-profile-v1.json',
  'operations\praxen\draft-skeleton-v1.md',
  'operations\rampart-tests\test_sancussight_collector.py',
  'operations\rampart-tests\test_pi_cli_workflow.py',
  'operations\aimap\run-authorized-ollama-fingerprint.py',
  'operations\aimap\ollama-fingerprint.yaml',
  'operations\lib\Export-RampartReport.ps1',
  'operations\lib\Export-AIMapReport.ps1',
  'collector\main.ts',
  'collector\server.ts',
  'scripts\invoke-spec005-t16-pretoken.ps1',
  'scripts\run-spec005-praxen-behavior-verifier.ps1',
  'scripts\run-spec005-t16-remediation.ps1',
  'scripts\run-spec005-pipelock-exercise.ps1',
  'scripts\run-spec005-t10-failure-matrix.ts',
  'scripts\build-spec005-t10-release-bundle.ts'
)
foreach ($relativePath in $requiredRelativeFiles) {
  Assert-RequiredLeaf -Path (Join-Path $canonicalProjectRoot $relativePath) -Code 'READINESS_REQUIRED_ENTRYPOINT_MISSING'
}

$inventoryPath = Join-Path $canonicalProjectRoot 'operations\manifests\producer-inventory.v1.json'
$inventory = Get-Content -LiteralPath $inventoryPath -Raw | ConvertFrom-Json
$expectedSourceIds = @('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')
if ($inventory.schemaVersion -ne 1 -or
    $inventory.contract -ne 'OperationalProducerInventoryV1' -or
    @($inventory.sources).Count -ne $expectedSourceIds.Count) {
  throw 'READINESS_INVENTORY_INVALID'
}
if ((@($inventory.sources.id | Sort-Object) -join ',') -ne (@($expectedSourceIds | Sort-Object) -join ',')) {
  throw 'READINESS_INVENTORY_SOURCE_MISMATCH'
}
if (@($inventory.sources | Where-Object {
  @($_.supportedVersions).Count -eq 0 -or [string]$_.officialUrl -notmatch '^https://'
}).Count -gt 0) {
  throw 'READINESS_INVENTORY_UNPINNED'
}

$releaseExamplePath = Join-Path $canonicalProjectRoot 'operations\manifests\release-run.example.json'
$releaseExample = Get-Content -LiteralPath $releaseExamplePath -Raw | ConvertFrom-Json
$requiredTargets = @($releaseExample.sources.praxen.requiredTargets)
if ($requiredTargets.Count -ne 2 -or
    ((@($requiredTargets.targetId | Sort-Object) -join ',') -ne 'sancussight,sdd-exec')) {
  throw 'READINESS_REMIT_CONFIGURATION_INVALID'
}

$operationRoot = if ($env:LOCALAPPDATA) {
  Join-Path $env:LOCALAPPDATA 'SancusSight\operations'
}
else {
  throw 'READINESS_LOCALAPPDATA_MISSING'
}
if (-not $SancusSightWorkerRemitPath) {
  $SancusSightWorkerRemitPath = Join-Path $operationRoot 'scopes\praxen\sancussight\WORKER_REMIT.md'
}
if (-not $SddExecWorkerRemitPath) {
  $SddExecWorkerRemitPath = Join-Path $operationRoot 'scopes\praxen\sdd-exec\WORKER_REMIT.md'
}
if (-not $ExpectedSancusSightWorkerRemitSha256) {
  $ExpectedSancusSightWorkerRemitSha256 = [string]($requiredTargets | Where-Object targetId -eq 'sancussight').workerRemitHash
}
if (-not $ExpectedSddExecWorkerRemitSha256) {
  $ExpectedSddExecWorkerRemitSha256 = [string]($requiredTargets | Where-Object targetId -eq 'sdd-exec').workerRemitHash
}

Assert-RequiredLeaf -Path $SancusSightWorkerRemitPath -Code 'READINESS_SANCUSSIGHT_REMIT_MISSING'
Assert-RequiredLeaf -Path $SddExecWorkerRemitPath -Code 'READINESS_SDD_EXEC_REMIT_MISSING'
$sancusSightRemitHash = (Get-FileHash -LiteralPath $SancusSightWorkerRemitPath -Algorithm SHA256).Hash.ToLowerInvariant()
$sddExecRemitHash = (Get-FileHash -LiteralPath $SddExecWorkerRemitPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($sancusSightRemitHash -ne $ExpectedSancusSightWorkerRemitSha256.ToLowerInvariant()) {
  throw 'READINESS_SANCUSSIGHT_REMIT_HASH_MISMATCH'
}
if ($sddExecRemitHash -ne $ExpectedSddExecWorkerRemitSha256.ToLowerInvariant()) {
  throw 'READINESS_SDD_EXEC_REMIT_HASH_MISMATCH'
}

if (-not $PSBoundParameters.ContainsKey('CanonicalCollectorDataDirectory')) {
  $CanonicalCollectorDataDirectory = $env:SANCUSSIGHT_DATA_DIR
}
if (-not $PSBoundParameters.ContainsKey('LegacyCollectorDataDirectory')) {
  $LegacyCollectorDataDirectory = $env:SANCUSSIGHT_COLLECTOR_DATA_DIR
}
$canonicalCollectorPath = if ($CanonicalCollectorDataDirectory) {
  [IO.Path]::GetFullPath($CanonicalCollectorDataDirectory)
}
else {
  $null
}
$legacyCollectorPath = if ($LegacyCollectorDataDirectory) {
  [IO.Path]::GetFullPath($LegacyCollectorDataDirectory)
}
else {
  $null
}
if ($canonicalCollectorPath -and $legacyCollectorPath -and
    -not $canonicalCollectorPath.Equals($legacyCollectorPath, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'READINESS_COLLECTOR_DATA_DIR_CONFLICT'
}
$selectedCollectorPath = if ($canonicalCollectorPath) {
  $canonicalCollectorPath
}
elseif ($legacyCollectorPath) {
  $legacyCollectorPath
}
elseif ($env:USERPROFILE) {
  [IO.Path]::GetFullPath((Join-Path $env:USERPROFILE '.sancussight\collector-data'))
}
else {
  throw 'READINESS_COLLECTOR_DATA_DIR_UNRESOLVED'
}
if (-not (Test-Path -LiteralPath $selectedCollectorPath -PathType Container)) {
  throw 'READINESS_COLLECTOR_DATA_DIR_MISSING'
}
if (Test-PathInside -Path $selectedCollectorPath -Parent $canonicalProjectRoot) {
  throw 'READINESS_COLLECTOR_DATA_DIR_INSIDE_PROJECT'
}

$bridgeText = Get-Content -LiteralPath (Join-Path $canonicalProjectRoot 'operations\telemetry\otlp-bridge.ts') -Raw
$collectorMainText = Get-Content -LiteralPath (Join-Path $canonicalProjectRoot 'collector\main.ts') -Raw
$collectorServerText = Get-Content -LiteralPath (Join-Path $canonicalProjectRoot 'collector\server.ts') -Raw
$aimapRunnerText = Get-Content -LiteralPath (Join-Path $canonicalProjectRoot 'operations\aimap\run-authorized-ollama-fingerprint.py') -Raw
if (-not $FixtureMode) {
  if (-not $bridgeText.Contains('const PORT = 43120') -or
      -not $bridgeText.Contains("server.listen(PORT, '127.0.0.1')")) {
    throw 'READINESS_OTLP_LOOPBACK_CONFIGURATION_MISMATCH'
  }
  if (-not $collectorMainText.Contains('SANCUSSIGHT_PORT ?? 43117') -or
      -not $collectorServerText.Contains("server.listen(listeningPort, '127.0.0.1'")) {
    throw 'READINESS_COLLECTOR_LOOPBACK_CONFIGURATION_MISMATCH'
  }
  if (-not $aimapRunnerText.Contains('"host": "127.0.0.1", "port": 11434')) {
    throw 'READINESS_AIMAP_LOOPBACK_CONFIGURATION_MISMATCH'
  }
}

$portChecks = @(
  [PSCustomObject]@{ role = 'collector'; port = $CollectorPort; expected = $CollectorPortState },
  [PSCustomObject]@{ role = 'otlp'; port = $OtlpPort; expected = $OtlpPortState },
  [PSCustomObject]@{ role = 'aimap'; port = $AIMapPort; expected = $AIMapPortState }
)
$portResults = @()
foreach ($check in $portChecks) {
  $actual = Get-LoopbackPortState -Port $check.port
  if ($actual -eq 'NonLoopback') {
    throw "READINESS_PORT_NOT_LOOPBACK role=$($check.role)"
  }
  if ($actual -ne $check.expected) {
    throw "READINESS_PORT_STATE_MISMATCH role=$($check.role) expected=$($check.expected) actual=$actual"
  }
  $portResults += [PSCustomObject]@{
    role = $check.role
    port = $check.port
    state = $actual
  }
}

[PSCustomObject]@{
  ready = $true
  providerInvocationAttempted = $false
  projectRootRole = 'canonical-project'
  checkedEntryPointCount = $requiredRelativeFiles.Count
  inventorySourceCount = @($inventory.sources).Count
  sancusSightWorkerRemitSha256 = $sancusSightRemitHash
  sddExecWorkerRemitSha256 = $sddExecRemitHash
  collectorDataDirectoryRole = 'collector-data'
  collectorDataDirectorySource = if ($canonicalCollectorPath) { 'canonical' } elseif ($legacyCollectorPath) { 'legacy' } else { 'default' }
  ports = $portResults
}
