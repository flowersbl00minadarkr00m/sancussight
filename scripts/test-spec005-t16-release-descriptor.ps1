[CmdletBinding()]
param(
  [switch]$RunIsolatedMatrix
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [IO.Path]::GetDirectoryName($PSScriptRoot)
$creatorPath = Join-Path $PSScriptRoot 'new-spec005-t16-release-descriptor.ps1'
$matrixPath = Join-Path $PSScriptRoot 'run-spec005-t10-failure-matrix.ts'
$legacyManifestPath = Join-Path $projectRoot 'operations\manifests\release-run.example.json'
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('sancussight-t16r4-descriptor-fixture-' + [Guid]::NewGuid().ToString('N'))
$runId = 'fixture-t16r4-descriptor'
$startedAt = '2026-07-23T20:00:00.000Z'

function Assert-True {
  param([bool]$Condition, [string]$Message)
  if (-not $Condition) { throw $Message }
}

function Assert-Equal {
  param($Actual, $Expected, [string]$Message)
  if ($Actual -cne $Expected) { throw "$Message Actual=[$Actual] Expected=[$Expected]" }
}

function Assert-Throws {
  param([scriptblock]$Action, [string]$Pattern, [string]$Message)
  $threw = $false
  try {
    & $Action | Out-Null
  } catch {
    $threw = $true
    if ($_.Exception.Message -notmatch $Pattern) {
      throw "$Message Unexpected error: $($_.Exception.Message)"
    }
  }
  if (-not $threw) { throw "$Message Expected an error matching [$Pattern]." }
}

function Invoke-NodeCapture {
  param([string]$ScriptPath, [string]$Name)
  $stdoutPath = Join-Path $fixtureRoot "$Name.stdout.txt"
  $stderrPath = Join-Path $fixtureRoot "$Name.stderr.txt"
  $nodePath = (Get-Command node -CommandType Application | Select-Object -First 1).Source
  $process = Start-Process `
    -FilePath $nodePath `
    -ArgumentList @($ScriptPath) `
    -WorkingDirectory $projectRoot `
    -NoNewWindow `
    -Wait `
    -PassThru `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath
  [pscustomobject]@{
    ExitCode = $process.ExitCode
    Output = ((Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue) + (Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue))
  }
}

try {
  [IO.Directory]::CreateDirectory($fixtureRoot) | Out-Null
  $created = & $creatorPath `
    -ReleaseRunId $runId `
    -StartedAt $startedAt `
    -LocalAppDataRoot $fixtureRoot `
    -IsolatedFixtureLabel 'fixture-descriptor-suite'

  $expectedPath = Join-Path $fixtureRoot "SancusSight\operations\runs\$runId\release-run.json"
  Assert-Equal ([IO.Path]::GetFullPath($created.descriptorPath)) ([IO.Path]::GetFullPath($expectedPath)) 'Creator did not use the canonical descriptor path.'
  Assert-Equal $created.isolatedFixtureLabel 'fixture-descriptor-suite' 'Fixture label was not retained in the non-descriptor result.'
  Assert-True (Test-Path -LiteralPath $expectedPath -PathType Leaf) 'Creator did not write release-run.json.'

  $bytes = [IO.File]::ReadAllBytes($expectedPath)
  Assert-True ($bytes.Length -gt 3) 'Descriptor was unexpectedly empty.'
  Assert-True (-not ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)) 'Descriptor contains a UTF-8 BOM.'
  $descriptor = ConvertFrom-Json -InputObject ([Text.Encoding]::UTF8.GetString($bytes))
  $fieldNames = @($descriptor.PSObject.Properties.Name)
  Assert-Equal ($fieldNames -join ',') 'schemaVersion,releaseRunId,startedAt,runtimeTargetId,purpose' 'Descriptor fields or order drifted.'
  Assert-Equal $descriptor.schemaVersion 1 'Schema version drifted.'
  Assert-Equal $descriptor.releaseRunId $runId 'Run identity drifted.'
  Assert-Equal $descriptor.startedAt $startedAt 'Start time drifted.'
  Assert-Equal $descriptor.runtimeTargetId 'sancussight-local-runtimes' 'Runtime target drifted.'
  Assert-Equal $descriptor.purpose 'a002-t16' 'Purpose drifted.'

  $beforeHash = (Get-FileHash -LiteralPath $expectedPath -Algorithm SHA256).Hash
  Assert-Throws {
    & $creatorPath -ReleaseRunId $runId -StartedAt $startedAt -LocalAppDataRoot $fixtureRoot -IsolatedFixtureLabel 'fixture-rewrite'
  } 'RELEASE_DESCRIPTOR_ALREADY_EXISTS' 'Creator did not refuse an existing descriptor.'
  Assert-Equal (Get-FileHash -LiteralPath $expectedPath -Algorithm SHA256).Hash $beforeHash 'Existing descriptor changed after rewrite refusal.'

  $wrongRoot = Join-Path $fixtureRoot 'SancusSight\operations\runs\different-run'
  Assert-Throws {
    & $creatorPath -ReleaseRunId 'fixture-root-mismatch' -StartedAt $startedAt -LocalAppDataRoot $fixtureRoot -RunRoot $wrongRoot -IsolatedFixtureLabel 'fixture-root'
  } 'RELEASE_DESCRIPTOR_RUN_ROOT_MISMATCH' 'Creator accepted a run-root/run-ID mismatch.'
  Assert-True (-not (Test-Path -LiteralPath (Join-Path $wrongRoot 'release-run.json'))) 'Root mismatch wrote a descriptor.'

  Assert-Throws {
    & $creatorPath -ReleaseRunId 'fixture-time-offset' -StartedAt '2026-07-23T20:00:00.000+00:00' -LocalAppDataRoot $fixtureRoot -IsolatedFixtureLabel 'fixture-time'
  } 'RELEASE_DESCRIPTOR_STARTED_AT_INVALID' 'Creator accepted a non-canonical UTC timestamp.'
  Assert-Throws {
    & $creatorPath -ReleaseRunId '..\escape' -StartedAt $startedAt -LocalAppDataRoot $fixtureRoot -IsolatedFixtureLabel 'fixture-run'
  } 'ValidatePattern|ReleaseRunId' 'Creator accepted an unsafe run ID.'
  Assert-Throws {
    & $creatorPath -ReleaseRunId 'fixture-target' -StartedAt $startedAt -RuntimeTargetId 'wrong-target' -LocalAppDataRoot $fixtureRoot -IsolatedFixtureLabel 'fixture-target'
  } 'ValidateSet|RuntimeTargetId' 'Creator accepted an unapproved runtime target.'

  $priorLocalAppData = $env:LOCALAPPDATA
  $priorDescriptorPath = $env:SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR
  $priorRunId = $env:SANCUSSIGHT_RELEASE_RUN_ID
  $priorTargetId = $env:SANCUSSIGHT_RUNTIME_TARGET_ID
  try {
    $env:LOCALAPPDATA = $fixtureRoot
    $env:SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR = $legacyManifestPath
    $env:SANCUSSIGHT_RELEASE_RUN_ID = $null
    $env:SANCUSSIGHT_RUNTIME_TARGET_ID = $null
    $legacyResult = Invoke-NodeCapture -ScriptPath $matrixPath -Name 'legacy-manifest'
    Assert-True ($legacyResult.ExitCode -ne 0) 'Failure matrix accepted a legacy release manifest as the immutable descriptor.'
    Assert-True ($legacyResult.Output -match 'RELEASE_DESCRIPTOR_(FIELDS_INVALID|PATH_MISMATCH)') 'Legacy manifest refusal did not report a strict descriptor rejection.'

    $env:SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR = $expectedPath
    $env:SANCUSSIGHT_RELEASE_RUN_ID = 'stale-environment-run'
    $env:SANCUSSIGHT_RUNTIME_TARGET_ID = 'sancussight-local-runtimes'
    $conflictResult = Invoke-NodeCapture -ScriptPath $matrixPath -Name 'environment-conflict'
    Assert-True ($conflictResult.ExitCode -ne 0) 'Failure matrix accepted a conflicting environment run ID.'
    Assert-True ($conflictResult.Output -match 'RELEASE_DESCRIPTOR_ENV_RUN_MISMATCH') 'Run conflict did not fail at the descriptor boundary.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($expectedPath)) 'failure-matrix.json'))) 'A conflicting environment emitted a matrix result.'

    if ($RunIsolatedMatrix) {
      $matrixRunId = 'fixture-t16r4-matrix-' + [DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmss')
      $matrixDescriptor = & $creatorPath `
        -ReleaseRunId $matrixRunId `
        -LocalAppDataRoot $fixtureRoot `
        -IsolatedFixtureLabel 'fixture-matrix-suite'
      $env:SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR = $matrixDescriptor.descriptorPath
      $env:SANCUSSIGHT_RELEASE_RUN_ID = $matrixDescriptor.releaseRunId
      $env:SANCUSSIGHT_RUNTIME_TARGET_ID = $matrixDescriptor.runtimeTargetId
      & npm.cmd run verify:t10-matrix
      $matrixReportPath = Join-Path ([IO.Path]::GetDirectoryName($matrixDescriptor.descriptorPath)) 'failure-matrix.json'
      $matrixReport = ConvertFrom-Json -InputObject (Get-Content -LiteralPath $matrixReportPath -Raw)
      if ($LASTEXITCODE -ne 0) {
        $failedCases = @($matrixReport.cases | Where-Object { $_.status -eq 'failed' } | ForEach-Object { "$($_.case):$($_.proof -join '|')" })
        throw "Isolated npm run verify:t10-matrix failed with exit $LASTEXITCODE. $($failedCases -join '; ')"
      }
      Assert-Equal $matrixReport.releaseRunId $matrixDescriptor.releaseRunId 'Isolated matrix report used the wrong release identity.'
      Assert-Equal $matrixReport.startedAt $matrixDescriptor.startedAt 'Isolated matrix substituted its observation/import time for descriptor start.'
      Assert-Equal $matrixReport.runtimeTargetId $matrixDescriptor.runtimeTargetId 'Isolated matrix substituted another runtime target.'
      Assert-Equal $matrixReport.summary.passed 15 'Isolated matrix did not pass all fifteen cases.'
      Assert-Equal $matrixReport.summary.failed 0 'Isolated matrix reported a failure.'
      Write-Output 'ISOLATED_MATRIX_PASS label=fixture-matrix-suite passed=15 failed=0'
    }
  } finally {
    $env:LOCALAPPDATA = $priorLocalAppData
    $env:SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR = $priorDescriptorPath
    $env:SANCUSSIGHT_RELEASE_RUN_ID = $priorRunId
    $env:SANCUSSIGHT_RUNTIME_TARGET_ID = $priorTargetId
  }

  $matrixText = Get-Content -LiteralPath $matrixPath -Raw
  Assert-True ($matrixText -match 'bindReleaseRunDescriptor\(\)') 'Failure matrix is not bound to the immutable descriptor.'
  Assert-True ($matrixText -match 'startedAt:\s*releaseDescriptor\.startedAt') 'Failure matrix can still substitute observation time for descriptor start.'
  Assert-True ($matrixText -match 'targetId:\s*releaseDescriptor\.runtimeTargetId') 'Failure matrix can still substitute another runtime target.'
  Assert-True ($matrixText -notmatch 'const runId = process\.env\.SANCUSSIGHT_RELEASE_RUN_ID') 'Legacy environment run identity still owns the matrix.'

  foreach ($path in @($creatorPath, $PSCommandPath)) {
    $tokens = $null
    $errors = $null
    [Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors) | Out-Null
    Assert-Equal @($errors).Count 0 "Windows PowerShell 5.1 parse failed for $path."
  }

  Write-Output 'T16R4 immutable descriptor creator, path, BOM, strict-field, rewrite, mismatch, environment, legacy-manifest, matrix-binding, and PowerShell parse fixtures passed.'
} finally {
  if (Test-Path -LiteralPath $fixtureRoot) {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
  }
}
