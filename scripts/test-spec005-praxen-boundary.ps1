[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$runner = Join-Path $PSScriptRoot 'run-spec005-praxen-behavior-verifier.ps1'
$orchestrator = Join-Path $PSScriptRoot 'run-spec005-t16-remediation.ps1'
$builder = Join-Path $PSScriptRoot 'build-spec005-t10-release-bundle.ts'
$workerRemit = Join-Path $projectRoot 'WORKER_REMIT.md'
$pluginRoot = Join-Path $env:USERPROFILE '.claude\plugins\cache\open-agent-ai-security\praxen\1.1.0'
$skillRoot = Join-Path $pluginRoot 'skills\behavior-verifier'
$fixtureManifest = Join-Path $pluginRoot 'tests\fixtures\helperbot.manifest.md'
$converter = Join-Path $skillRoot 'manifest_to_findings.py'
$tempRoot = Join-Path $env:TEMP "sancussight-t16r-boundary-$([guid]::NewGuid().ToString('N'))"
$fakeBin = Join-Path $tempRoot 'fake-bin'
$outputRoot = Join-Path $tempRoot 'output'
$pythonLog = Join-Path $tempRoot 'python-invocations.log'
$originalPath = $env:PATH
$originalFixture = $env:SANCUSSIGHT_PRAXEN_TEST_MANIFEST
$originalMode = $env:SANCUSSIGHT_PRAXEN_TEST_MODE
$originalPythonLog = $env:SANCUSSIGHT_PRAXEN_TEST_PYTHON_LOG
$realPython = @(Get-Command python -CommandType Application -All -ErrorAction Stop)[0].Source

foreach ($required in @($runner, $orchestrator, $builder, $workerRemit, $fixtureManifest, $converter)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
    throw "T16R boundary regression input is missing: $required"
  }
}

function Write-Utf8([string]$Path, [string]$Text) {
  $parent = Split-Path $Path -Parent
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  [IO.File]::WriteAllText($Path, $Text, [Text.UTF8Encoding]::new($false))
}

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

function Read-Json([string]$Path) {
  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Invoke-ExpectedFailure([scriptblock]$Action, [string]$ResultPath, [string]$ExpectedStage) {
  $failed = $false
  try { & $Action | Out-Null } catch { $failed = $true }
  Assert-True $failed 'Expected the T16R boundary fixture to fail closed.'
  Assert-True (Test-Path -LiteralPath $ResultPath -PathType Leaf) "Expected bounded failure result at $ResultPath"
  $result = Read-Json $ResultPath
  Assert-True ($result.state -eq 'failed') "Expected failed result, got '$($result.state)'."
  Assert-True ($result.stage -eq $ExpectedStage) "Expected failure stage '$ExpectedStage', got '$($result.stage)'."
  Assert-True ([bool]$result.operatorActionRequired) 'Expected failed result to require operator direction.'
}

function Assert-NoTransformOutput([string]$ResultPath) {
  $attemptRoot = Split-Path $ResultPath -Parent
  foreach ($role in @('converter', 'canonical', 'rendered', 'operational')) {
    $roleRoot = Join-Path $attemptRoot $role
    $roleFiles = @(
      if (Test-Path -LiteralPath $roleRoot -PathType Container) {
        Get-ChildItem -LiteralPath $roleRoot -File -Recurse
      }
    )
    Assert-True ($roleFiles.Count -eq 0) "Staging-validation failure produced forbidden $role output."
  }
}

function Reset-PythonInvocationLog {
  Write-Utf8 $pythonLog ''
}

function Get-PythonInvocationCount {
  if (-not (Test-Path -LiteralPath $pythonLog -PathType Leaf)) { return 0 }
  return @(
    Get-Content -LiteralPath $pythonLog |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  ).Count
}

function Assert-PythonInvocationCount([int]$Expected, [string]$Label) {
  $actual = Get-PythonInvocationCount
  Assert-True ($actual -eq $Expected) "$Label expected $Expected pinned Python invocation(s), got $actual."
}

New-Item -ItemType Directory -Force -Path $fakeBin, $outputRoot | Out-Null

$fakeClaudePowerShell = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$draft = $env:SANCUSSIGHT_PRAXEN_STAGING_DRAFT_PATH
$fixture = $env:SANCUSSIGHT_PRAXEN_TEST_MANIFEST
$mode = $env:SANCUSSIGHT_PRAXEN_TEST_MODE
$target = $env:SANCUSSIGHT_PRAXEN_TARGET_ID
if (-not $draft -or -not $fixture -or -not $target) { exit 3 }
if ($mode -eq 'missing' -or ($mode -eq 'partial-second' -and $target -eq 'sdd-exec')) { exit 0 }
$text = Get-Content -LiteralPath $fixture -Raw
$now = [DateTimeOffset]::UtcNow
$text = [regex]::Replace($text, '(?m)^- agent: .+$', "- agent: T16R Fixture $target")
$text = [regex]::Replace($text, '(?m)^- agent_slug: .+$', "- agent_slug: $target")
$text = [regex]::Replace($text, '(?m)^- scan_date: .+$', "- scan_date: $($now.ToString('yyyy-MM-dd'))")
$text = [regex]::Replace($text, '(?m)^- scan_timestamp: .+$', "- scan_timestamp: $($now.ToString('o'))")
New-Item -ItemType Directory -Force -Path (Split-Path $draft -Parent) | Out-Null
if ($mode -eq 'malformed') { $text = '# Praxen draft manifest' }
if ($mode -eq 'missing-header') {
  $text = [regex]::Replace($text, '\A# Praxen draft manifest(?:\r?\n)?', '')
}
if ($mode -eq 'leading-prose-fenced') {
  $fence = ([char]96).ToString() * 3
  $text = "Leading producer prose.`n${fence}markdown`n$text`n$fence"
}
if ($mode -eq 'unsupported-target-heading') {
  $text = [regex]::Replace(
    $text,
    '(?m)^## scan\r?$',
    "## Target`n- name: Unsupported structural drift`n`n## scan",
    1
  )
}
if ($mode -eq 'unknown-subsection') {
  $text = [regex]::Replace($text, '(?m)^## scan\r?$', "## scan`n### unexpected_subsection", 1)
}
if ($mode -eq 'duplicate-heading') {
  $text = [regex]::Replace($text, '(?m)^## log_files\r?$', "## positives`n(none)`n`n## log_files", 1)
}
if ($mode -eq 'missing-heading') {
  $text = [regex]::Replace($text, '(?m)^## positives\r?\n', '', 1)
}
if ($mode -eq 'reordered-heading') {
  $text = $text.Replace('## positives', '## __T16R2_SWAP__')
  $text = $text.Replace('## log_files', '## positives')
  $text = $text.Replace('## __T16R2_SWAP__', '## log_files')
}
if ($mode -eq 'unreplaced-slot') { $text += "`n{{UNREPLACED_SLOT}}`n" }
if ($mode -eq 'tbd-sentinel') { $text += "`nTBD`n" }
if ($mode -eq 'placeholder-sentinel') { $text += "`nPLACEHOLDER`n" }
if ($mode -eq 'tab') { $text = $text.Replace('HelperBot', "`tHelperBot") }
if ($mode -eq 'fence') {
  $fence = ([char]96).ToString() * 3
  $text += "`n${fence}text`nforbidden`n$fence`n"
}
if ($mode -eq 'structural-comment') { $text += "`n<!-- structural guidance -->`n" }
if ($mode -eq 'malformed-rule-heading') {
  $text = [regex]::Replace($text, '(?m)^#### R-\d+\r?$', '#### RULE-01', 1)
}
if ($mode -eq 'malformed-finding-heading') {
  $text = [regex]::Replace($text, '(?m)^### PRAX-[^\r\n]+\r?$', '### PRAX-BAD (High)', 1)
}
if ($mode -eq 'duplicate-dynamic-rule') {
  $text = [regex]::Replace($text, '(?m)^#### R-01\r?$', "#### R-01`n#### R-01", 1)
}
if ($mode -eq 'duplicate-dynamic-finding') {
  $text = [regex]::Replace(
    $text,
    '(?m)^(### PRAX-\d{4}-\d{2}-\d{2}-\d{3} \((?:Critical|High|Medium|Low|Informational)\))\r?$',
    "`$1`n`$1",
    1
  )
}
if ($mode -eq 'authored-footer') {
  $text += "`n## footer`n### severity_counts`n- critical: 0`n- high: 0`n- medium: 0`n- low: 0`n- info: 0`n"
}
if ($mode -eq 'authored-stat-counts') {
  $text = [regex]::Replace($text, '(?m)^## remit_coverage\r?$', "## remit_coverage`n### stat_counts", 1)
}
if ($mode -eq 'missing-field') {
  $text = [regex]::Replace($text, '(?m)^- artifact_count: .+\r?\n', '', 1)
}
if ($mode -eq 'unknown-field') {
  $text = [regex]::Replace($text, '(?m)^- manifest_format_version: 1\r?$', "- manifest_format_version: 1`n- unsupported_field: value", 1)
}
if ($mode -eq 'typed-error') {
  $text = [regex]::Replace($text, '(?m)^- artifact_count: .+$', '- artifact_count: not-an-integer', 1)
}
if ($mode -eq 'indentation-error') {
  $text = [regex]::Replace($text, '(?m)^- agent: .+$', '  - agent: wrongly-indented', 1)
}
[IO.File]::WriteAllText($draft, $text, [Text.UTF8Encoding]::new($false))
if ($mode -eq 'model-json') {
  [IO.File]::WriteAllText((Join-Path (Split-Path $draft -Parent) 'model-authored-findings.json'), '{"schema_version":"2.0","scan":{},"findings":[]}', [Text.UTF8Encoding]::new($false))
}
if ($mode -eq 'stale') { (Get-Item -LiteralPath $draft).LastWriteTimeUtc = [DateTime]::UtcNow.AddHours(-1) }
if ($mode -eq 'wrong-target') {
  $wrong = (Get-Content -LiteralPath $draft -Raw) -replace '(?m)^- agent_slug: .+$', '- agent_slug: wrong-target'
  [IO.File]::WriteAllText($draft, $wrong, [Text.UTF8Encoding]::new($false))
}
if ($mode -eq 'renderer-failure') {
  $attemptRoot = Split-Path (Split-Path $draft -Parent) -Parent
  New-Item -ItemType Directory -Force -Path (Join-Path $attemptRoot "rendered\$target-analysis.html") | Out-Null
}
exit 0
'@
Write-Utf8 (Join-Path $fakeBin 'fake-claude.ps1') $fakeClaudePowerShell
$fakeClaudeCmd = @'
@echo off
if "%~1"=="--version" (
  echo 2.1.214
  exit /b 0
)
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0fake-claude.ps1"
exit /b %ERRORLEVEL%
'@
Write-Utf8 (Join-Path $fakeBin 'claude.cmd') $fakeClaudeCmd
$fakePythonCmd = @"
@echo off
>> "%SANCUSSIGHT_PRAXEN_TEST_PYTHON_LOG%" echo invoked
"$realPython" %*
exit /b %ERRORLEVEL%
"@
Write-Utf8 (Join-Path $fakeBin 'python.cmd') $fakePythonCmd

try {
  $env:PATH = "$fakeBin;$originalPath"
  $env:SANCUSSIGHT_PRAXEN_TEST_MANIFEST = $fixtureManifest
  $env:SANCUSSIGHT_PRAXEN_TEST_PYTHON_LOG = $pythonLog

  $validRun = "t16r-fixture-valid-$([guid]::NewGuid().ToString('N'))"
  $env:SANCUSSIGHT_PRAXEN_TEST_MODE = 'valid'
  Reset-PythonInvocationLog
  $validOutput = & $runner -ReleaseRunId $validRun -TargetId sancussight -WorkspacePath $projectRoot -WorkerRemitPath $workerRemit -OutputRoot $outputRoot
  $valid = @($validOutput)[-1]
  Assert-True ($valid.state -eq 'passed') 'Valid runner-bound fixture did not pass.'
  $validAttempt = Join-Path $outputRoot "$validRun\sancussight\attempt-1"
  foreach ($role in @('staging', 'converter', 'canonical', 'rendered', 'operational')) {
    Assert-True (Test-Path -LiteralPath (Join-Path $validAttempt $role) -PathType Container) "Missing isolated $role directory."
  }
  $operational = Read-Json (Join-Path $validAttempt 'operational\sancussight-operational.json')
  Assert-True ($operational.sancussight.runnerBinding.producer -eq 'sancussight-praxen-runner') 'Runner binding marker is missing.'
  Assert-True ($operational.sancussight.runnerBinding.releaseRunId -eq $validRun) 'Runner binding run ID is wrong.'
  Assert-True ($operational.sancussight.runnerBinding.targetId -eq 'sancussight') 'Runner binding target is wrong.'
  Assert-True ($operational.sancussight.runnerBinding.canonicalArtifactContentHash -match '^[a-f0-9]{64}$') 'Runner binding canonical hash is invalid.'
  $validResult = Read-Json (Join-Path $validAttempt 'result.json')
  Assert-True ($validResult.draftProfile.profileVersion -eq 'praxen-draft-profile-v1') 'Passing result is missing the draft profile version.'
  Assert-True ($validResult.draftProfile.praxenVersion -eq '1.1.0') 'Passing result is missing the supported Praxen pairing.'
  Assert-True ($validResult.draftProfile.manifestFormatVersion -eq 1) 'Passing result is missing the manifest-format pairing.'
  $repositoryProfileHash = (Get-FileHash (Join-Path $projectRoot 'operations\praxen\draft-profile-v1.json') -Algorithm SHA256).Hash.ToLowerInvariant()
  $repositorySkeletonHash = (Get-FileHash (Join-Path $projectRoot 'operations\praxen\draft-skeleton-v1.md') -Algorithm SHA256).Hash.ToLowerInvariant()
  Assert-True ($validResult.draftProfile.profileSha256 -eq $repositoryProfileHash) 'Passing result profile hash does not match the repository profile.'
  Assert-True ($validResult.draftProfile.skeletonSha256 -eq $repositorySkeletonHash) 'Passing result skeleton hash does not match the repository skeleton.'
  $stagedSkeleton = Join-Path $validAttempt 'staging\draft-skeleton-v1.guidance.md'
  Assert-True (Test-Path -LiteralPath $stagedSkeleton -PathType Leaf) 'Runner did not stage the immutable guidance skeleton before model output.'
  Assert-True ((Get-FileHash $stagedSkeleton -Algorithm SHA256).Hash.ToLowerInvariant() -eq $repositorySkeletonHash) 'Staged guidance skeleton hash does not match the repository skeleton.'
  Assert-PythonInvocationCount 2 'Positive converter/renderer path'

  $repeatA = Join-Path $tempRoot 'deterministic-a.json'
  $repeatB = Join-Path $tempRoot 'deterministic-b.json'
  $draft = Join-Path $validAttempt 'staging\sancussight-step-9.9-draft.md'
  & python $converter --manifest $draft --out $repeatA | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'First deterministic converter replay failed.' }
  & python $converter --manifest $draft --out $repeatB | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Second deterministic converter replay failed.' }
  Assert-True ((Get-FileHash $repeatA -Algorithm SHA256).Hash -eq (Get-FileHash $repeatB -Algorithm SHA256).Hash) 'Pinned converter output is not byte-deterministic.'

  $reuseFailed = $false
  try {
    & $runner -ReleaseRunId $validRun -TargetId sancussight -WorkspacePath $projectRoot -WorkerRemitPath $workerRemit -OutputRoot $outputRoot | Out-Null
  } catch { $reuseFailed = $_.Exception.Message -match 'Refusing to reuse' }
  Assert-True $reuseFailed 'Runner did not refuse target-attempt directory reuse.'

  $structuralNegativeModes = @(
    @{ mode = 'unsupported-target-heading' },
    @{ mode = 'unknown-subsection' },
    @{ mode = 'duplicate-heading' },
    @{ mode = 'missing-heading' },
    @{ mode = 'reordered-heading' },
    @{ mode = 'unreplaced-slot' },
    @{ mode = 'tbd-sentinel' },
    @{ mode = 'placeholder-sentinel' },
    @{ mode = 'tab' },
    @{ mode = 'fence' },
    @{ mode = 'structural-comment' },
    @{ mode = 'malformed-rule-heading' },
    @{ mode = 'malformed-finding-heading' },
    @{ mode = 'duplicate-dynamic-rule' },
    @{ mode = 'duplicate-dynamic-finding' },
    @{ mode = 'authored-footer' },
    @{ mode = 'authored-stat-counts' }
  )
  foreach ($case in $structuralNegativeModes) {
    $runId = "t16r2-structural-$($case.mode)-$([guid]::NewGuid().ToString('N'))"
    $env:SANCUSSIGHT_PRAXEN_TEST_MODE = $case.mode
    Reset-PythonInvocationLog
    $resultPath = Join-Path $outputRoot "$runId\sancussight\attempt-1\result.json"
    Invoke-ExpectedFailure {
      & $runner -ReleaseRunId $runId -TargetId sancussight -WorkspacePath $projectRoot -WorkerRemitPath $workerRemit -OutputRoot $outputRoot
    } $resultPath 'staging-structure-validation'
    Assert-NoTransformOutput $resultPath
    Assert-PythonInvocationCount 0 "Structural fixture '$($case.mode)'"
  }

  $converterOwnedModes = @(
    @{ mode = 'missing-field' },
    @{ mode = 'unknown-field' },
    @{ mode = 'typed-error' },
    @{ mode = 'indentation-error' }
  )
  foreach ($case in $converterOwnedModes) {
    $runId = "t16r2-converter-owned-$($case.mode)-$([guid]::NewGuid().ToString('N'))"
    $env:SANCUSSIGHT_PRAXEN_TEST_MODE = $case.mode
    Reset-PythonInvocationLog
    $resultPath = Join-Path $outputRoot "$runId\sancussight\attempt-1\result.json"
    Invoke-ExpectedFailure {
      & $runner -ReleaseRunId $runId -TargetId sancussight -WorkspacePath $projectRoot -WorkerRemitPath $workerRemit -OutputRoot $outputRoot
    } $resultPath 'converter'
    Assert-NoTransformOutput $resultPath
    Assert-PythonInvocationCount 1 "Converter-owned fixture '$($case.mode)'"
  }

  $legacyNegativeModes = @(
    @{ mode = 'missing'; stage = 'staging-validation' },
    @{ mode = 'missing-header'; stage = 'staging-validation'; noTransformOutput = $true },
    @{ mode = 'leading-prose-fenced'; stage = 'staging-validation'; noTransformOutput = $true },
    @{ mode = 'model-json'; stage = 'staging-validation' },
    @{ mode = 'malformed'; stage = 'staging-structure-validation'; noTransformOutput = $true },
    @{ mode = 'stale'; stage = 'staging-validation' },
    @{ mode = 'wrong-target'; stage = 'converter' },
    @{ mode = 'renderer-failure'; stage = 'renderer' }
  )
  foreach ($case in $legacyNegativeModes) {
    $runId = "t16r-fixture-$($case.mode)-$([guid]::NewGuid().ToString('N'))"
    $env:SANCUSSIGHT_PRAXEN_TEST_MODE = $case.mode
    Reset-PythonInvocationLog
    $resultPath = Join-Path $outputRoot "$runId\sancussight\attempt-1\result.json"
    Invoke-ExpectedFailure {
      & $runner -ReleaseRunId $runId -TargetId sancussight -WorkspacePath $projectRoot -WorkerRemitPath $workerRemit -OutputRoot $outputRoot
    } $resultPath $case.stage
    if ($case.ContainsKey('noTransformOutput') -and $case.noTransformOutput) {
      Assert-NoTransformOutput $resultPath
    }
  }

  $structuralPartialRun = "t16r2-fixture-partial-$([guid]::NewGuid().ToString('N'))"
  $env:SANCUSSIGHT_PRAXEN_TEST_MODE = 'unsupported-target-heading'
  Reset-PythonInvocationLog
  $structuralPartialFailed = $false
  try {
    & $orchestrator `
      -ReleaseRunId $structuralPartialRun `
      -OutputRoot $outputRoot `
      -SancusSightWorkspacePath $projectRoot `
      -SancusSightWorkerRemitPath $workerRemit `
      -SddExecWorkspacePath $projectRoot `
      -SddExecWorkerRemitPath $workerRemit | Out-Null
  } catch { $structuralPartialFailed = $true }
  Assert-True $structuralPartialFailed 'A-004 structural producer failure unexpectedly exited cleanly.'
  $structuralPartial = Read-Json (Join-Path $outputRoot "$structuralPartialRun\result.json")
  Assert-True ($structuralPartial.state -eq 'partial') 'A-004 structural failure did not create an explicit partial result.'
  Assert-True ($structuralPartial.targetId -eq 'sancussight') 'A-004 partial result did not name the first failed target.'
  Assert-True (@($structuralPartial.completedTargets).Count -eq 0) 'A-004 partial result incorrectly completed a target.'
  Assert-True ('sdd-exec' -in @($structuralPartial.pausedBeforeTargets)) 'A-004 partial result did not pause before the second target.'
  Assert-True ([bool]$structuralPartial.operatorActionRequired) 'A-004 partial result did not require operator direction.'
  Assert-True (-not [bool]$structuralPartial.releaseEligible) 'A-004 partial result became release eligible.'
  Assert-True (-not [bool]$structuralPartial.bundlePromotionAttempted) 'A-004 partial result attempted bundle promotion.'
  Assert-PythonInvocationCount 0 'A-004 first-target partial wrapper'

  $partialRun = "t16r-fixture-partial-$([guid]::NewGuid().ToString('N'))"
  $env:SANCUSSIGHT_PRAXEN_TEST_MODE = 'partial-second'
  Reset-PythonInvocationLog
  $partialFailed = $false
  try {
    & $orchestrator `
      -ReleaseRunId $partialRun `
      -OutputRoot $outputRoot `
      -SancusSightWorkspacePath $projectRoot `
      -SancusSightWorkerRemitPath $workerRemit `
      -SddExecWorkspacePath $projectRoot `
      -SddExecWorkerRemitPath $workerRemit | Out-Null
  } catch { $partialFailed = $true }
  Assert-True $partialFailed 'Partial producer fixture unexpectedly exited cleanly.'
  $partial = Read-Json (Join-Path $outputRoot "$partialRun\result.json")
  Assert-True ($partial.state -eq 'partial') 'Producer failure did not create an explicit partial result.'
  Assert-True ($partial.targetId -eq 'sdd-exec') 'Partial result did not name the failed target.'
  Assert-True ([bool]$partial.operatorActionRequired) 'Partial result did not pause for operator direction.'
  Assert-True (-not [bool]$partial.releaseEligible) 'Partial result became release eligible.'
  Assert-True (-not [bool]$partial.bundlePromotionAttempted) 'Partial fixture attempted bundle promotion.'

  $builderRun = "t16r-partial-builder-$([guid]::NewGuid().ToString('N'))"
  $builderLocal = Join-Path $tempRoot 'builder-local'
  $builderCollector = Join-Path $tempRoot 'builder-collector'
  $builderRunRoot = Join-Path $builderLocal "SancusSight\operations\runs\$builderRun"
  New-Item -ItemType Directory -Force -Path $builderRunRoot, $builderCollector | Out-Null
  Write-Utf8 (Join-Path $builderRunRoot 'failure-matrix.json') (([ordered]@{
    releaseRunId = $builderRun
    observedAt = [DateTimeOffset]::UtcNow.ToString('o')
    state = 'partial'
    cases = @()
  } | ConvertTo-Json -Depth 10) + "`n")
  Write-Utf8 (Join-Path $builderCollector 'evidence.jsonl') ''
  $bundlePath = Join-Path $projectRoot "artifacts\qa\spec005\t10-release-$builderRun"
  Assert-True (-not (Test-Path -LiteralPath $bundlePath)) 'Unique partial-fixture bundle path unexpectedly exists before the check.'
  $priorLocalAppData = $env:LOCALAPPDATA
  $priorCollector = $env:SANCUSSIGHT_COLLECTOR_DATA_DIR
  $priorRunId = $env:SANCUSSIGHT_RELEASE_RUN_ID
  try {
    $env:LOCALAPPDATA = $builderLocal
    $env:SANCUSSIGHT_COLLECTOR_DATA_DIR = $builderCollector
    $env:SANCUSSIGHT_RELEASE_RUN_ID = $builderRun
    try {
      node $builder 2>$null
      $builderExit = $LASTEXITCODE
    }
    catch {
      $builderExit = 1
    }
  }
  finally {
    $env:LOCALAPPDATA = $priorLocalAppData
    $env:SANCUSSIGHT_COLLECTOR_DATA_DIR = $priorCollector
    $env:SANCUSSIGHT_RELEASE_RUN_ID = $priorRunId
  }
  Assert-True ($builderExit -ne 0) 'Release builder unexpectedly accepted a labelled partial fixture.'
  Assert-True (-not (Test-Path -LiteralPath $bundlePath)) 'Release builder wrote a bundle for a labelled partial fixture.'

  Write-Output 'Spec 005 T16R2 Praxen boundary regression passed: pinned profile/skeleton, all structural failures before Python, converter-owned field/schema failures, real converter/renderer, partial pause, and no bundle promotion.'
}
finally {
  $env:PATH = $originalPath
  $env:SANCUSSIGHT_PRAXEN_TEST_MANIFEST = $originalFixture
  $env:SANCUSSIGHT_PRAXEN_TEST_MODE = $originalMode
  $env:SANCUSSIGHT_PRAXEN_TEST_PYTHON_LOG = $originalPythonLog
  $resolvedTempRoot = [IO.Path]::GetFullPath($tempRoot)
  $resolvedSystemTemp = [IO.Path]::GetFullPath($env:TEMP)
  if ($resolvedTempRoot.StartsWith($resolvedSystemTemp, [StringComparison]::OrdinalIgnoreCase) -and
      $resolvedTempRoot -ne $resolvedSystemTemp -and
      (Test-Path -LiteralPath $resolvedTempRoot)) {
    Remove-Item -LiteralPath $resolvedTempRoot -Recurse -Force
  }
}
