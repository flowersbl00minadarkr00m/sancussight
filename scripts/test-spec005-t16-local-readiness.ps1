Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$readiness = Join-Path $PSScriptRoot 'verify-spec005-t16-local-readiness.ps1'
if (-not (Test-Path -LiteralPath $readiness -PathType Leaf)) {
  throw 'The T16 local-readiness script is missing.'
}

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

function Invoke-ExpectedFailure([scriptblock]$Action, [string]$ExpectedCode) {
  try {
    & $Action | Out-Null
    throw "Expected failure '$ExpectedCode' did not occur."
  }
  catch {
    if (-not $_.Exception.Message.Contains($ExpectedCode)) {
      throw "Expected failure '$ExpectedCode', got '$($_.Exception.Message)'."
    }
  }
}

function Copy-RequiredFixtureTree([string]$DestinationRoot) {
  $relativeFiles = @(
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
  foreach ($relativePath in $relativeFiles) {
    $source = Join-Path $projectRoot $relativePath
    $destination = Join-Path $DestinationRoot $relativePath
    $parent = Split-Path $destination -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination
  }
}

function Get-FreeLoopbackPort {
  $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 0)
  $listener.Start()
  try {
    return ([Net.IPEndPoint]$listener.LocalEndpoint).Port
  }
  finally {
    $listener.Stop()
  }
}

$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('sancussight-t16r3-readiness-' + [guid]::NewGuid().ToString('N'))
$fixtureProject = Join-Path $testRoot 'fixture-project'
$nonProjectWorkingDirectory = Join-Path $testRoot 'non-project-cwd'
$collectorData = Join-Path $testRoot 'collector-data'
$sancusSightRemit = Join-Path $testRoot 'sancussight-remit.md'
$sddExecRemit = Join-Path $testRoot 'sdd-exec-remit.md'
$fakeProviderCounter = Join-Path $testRoot 'provider-counter.txt'
$listeners = @()
$priorPath = $env:PATH

try {
  New-Item -ItemType Directory -Force -Path $testRoot, $fixtureProject, $nonProjectWorkingDirectory, $collectorData | Out-Null
  Copy-RequiredFixtureTree -DestinationRoot $fixtureProject
  [IO.File]::WriteAllText($sancusSightRemit, '# Fixture SancusSight Worker Remit', [Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($sddExecRemit, '# Fixture sdd-exec Worker Remit', [Text.UTF8Encoding]::new($false))
  $sancusSightHash = (Get-FileHash -LiteralPath $sancusSightRemit -Algorithm SHA256).Hash.ToLowerInvariant()
  $sddExecHash = (Get-FileHash -LiteralPath $sddExecRemit -Algorithm SHA256).Hash.ToLowerInvariant()

  $collectorPort = Get-FreeLoopbackPort
  do { $otlpPort = Get-FreeLoopbackPort } while ($otlpPort -eq $collectorPort)
  do { $aimapPort = Get-FreeLoopbackPort } while ($aimapPort -in @($collectorPort, $otlpPort))
  foreach ($port in @($collectorPort, $aimapPort)) {
    $listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $port)
    $listener.Start()
    $listeners += $listener
  }

  $fakePath = Join-Path $testRoot 'fake-provider-path'
  New-Item -ItemType Directory -Force -Path $fakePath | Out-Null
  $providerScript = '@echo provider-invoked>>"' + $fakeProviderCounter + '"'
  [IO.File]::WriteAllText((Join-Path $fakePath 'claude.cmd'), $providerScript, [Text.Encoding]::ASCII)
  $env:PATH = $fakePath + [IO.Path]::PathSeparator + $priorPath

  $arguments = @{
    ProjectRoot = $fixtureProject
    SancusSightWorkerRemitPath = $sancusSightRemit
    SddExecWorkerRemitPath = $sddExecRemit
    ExpectedSancusSightWorkerRemitSha256 = $sancusSightHash
    ExpectedSddExecWorkerRemitSha256 = $sddExecHash
    CanonicalCollectorDataDirectory = $collectorData
    LegacyCollectorDataDirectory = $collectorData
    CollectorPort = $collectorPort
    OtlpPort = $otlpPort
    AIMapPort = $aimapPort
    CollectorPortState = 'Listening'
    OtlpPortState = 'Available'
    AIMapPortState = 'Listening'
    FixtureMode = $true
  }
  $result = & $readiness @arguments
  Assert-True $result.ready 'Positive local-readiness fixture did not pass.'
  Assert-True (-not $result.providerInvocationAttempted) 'Readiness reported provider activity.'
  Assert-True (-not (Test-Path -LiteralPath $fakeProviderCounter)) 'Readiness invoked a provider shim.'
  Assert-True ($result.checkedEntryPointCount -eq 20) 'Readiness checked-entrypoint count drifted.'
  Assert-True ($result.inventorySourceCount -eq 6) 'Readiness inventory count drifted.'
  Assert-True (@($result.ports | Where-Object state -eq 'Listening').Count -eq 2) 'Readiness listener states drifted.'

  $omittedRootArguments = @{} + $arguments
  [void]$omittedRootArguments.Remove('ProjectRoot')
  Push-Location -LiteralPath $nonProjectWorkingDirectory
  try {
    $omittedRootResult = & $readiness @omittedRootArguments
  }
  finally {
    Pop-Location
  }
  Assert-True $omittedRootResult.ready 'Omitted ProjectRoot did not select the canonical script-derived project root.'
  Assert-True (-not $omittedRootResult.providerInvocationAttempted) 'Omitted-root readiness reported provider activity.'
  Assert-True (-not (Test-Path -LiteralPath $fakeProviderCounter)) 'Omitted-root readiness invoked a provider shim.'
  Assert-True ($omittedRootResult.checkedEntryPointCount -eq 20) 'Omitted-root readiness did not inspect the canonical entrypoint set.'

  $missingPath = Join-Path $fixtureProject 'operations\aimap\ollama-fingerprint.yaml'
  Remove-Item -LiteralPath $missingPath
  Invoke-ExpectedFailure -ExpectedCode 'READINESS_REQUIRED_ENTRYPOINT_MISSING' -Action {
    & $readiness @arguments
  }
  Copy-Item -LiteralPath (Join-Path $projectRoot 'operations\aimap\ollama-fingerprint.yaml') -Destination $missingPath

  $wrongHashArguments = @{} + $arguments
  $wrongHashArguments.ExpectedSancusSightWorkerRemitSha256 = ('0' * 64)
  Invoke-ExpectedFailure -ExpectedCode 'READINESS_SANCUSSIGHT_REMIT_HASH_MISMATCH' -Action {
    & $readiness @wrongHashArguments
  }

  $conflictArguments = @{} + $arguments
  $conflictDirectory = Join-Path $testRoot 'collector-conflict'
  New-Item -ItemType Directory -Force -Path $conflictDirectory | Out-Null
  $conflictArguments.LegacyCollectorDataDirectory = $conflictDirectory
  Invoke-ExpectedFailure -ExpectedCode 'READINESS_COLLECTOR_DATA_DIR_CONFLICT' -Action {
    & $readiness @conflictArguments
  }

  $portConflictArguments = @{} + $arguments
  $portConflictArguments.OtlpPort = $collectorPort
  Invoke-ExpectedFailure -ExpectedCode 'READINESS_PORT_CONFLICT' -Action {
    & $readiness @portConflictArguments
  }

  $listeners[0].Stop()
  Invoke-ExpectedFailure -ExpectedCode 'READINESS_PORT_STATE_MISMATCH' -Action {
    & $readiness @arguments
  }

  Write-Output 'T16R3 local-readiness omitted-root/non-project-cwd, fixed-entrypoint, inventory, remit-hash, collector-root, loopback-port, missing-prerequisite, and no-provider checks passed.'
}
finally {
  foreach ($listener in $listeners) {
    try { $listener.Stop() } catch { }
  }
  $env:PATH = $priorPath
  if (Test-Path -LiteralPath $testRoot) {
    Remove-Item -LiteralPath $testRoot -Recurse -Force
  }
}
