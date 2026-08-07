[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$runner = Join-Path $PSScriptRoot 'run-spec005-praxen-behavior-verifier.ps1'
$pipelockRunner = Join-Path $PSScriptRoot 'run-spec005-pipelock-exercise.ps1'
$workspace = (Resolve-Path -LiteralPath $projectRoot).Path
$workerRemit = Join-Path $projectRoot 'WORKER_REMIT.md'
$profile = Join-Path $projectRoot 'operations\praxen\draft-profile-v1.json'
$skeleton = Join-Path $projectRoot 'operations\praxen\draft-skeleton-v1.md'
$planOutputRoot = Join-Path $env:TEMP "sancussight-haiku-plan-$([guid]::NewGuid().ToString('N'))"

foreach ($required in @($workerRemit, $profile, $skeleton)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
    throw "Regression fixture is missing a checked-in input: $required"
  }
}

$planLines = & $runner `
  -ReleaseRunId 'haiku-plan-regression' `
  -TargetId 'sancussight' `
  -WorkspacePath $workspace `
  -WorkerRemitPath $workerRemit `
  -OutputRoot $planOutputRoot `
  -PlanOnly
if ($LASTEXITCODE -ne 0) { throw "Praxen runner plan-only validation failed with exit code $LASTEXITCODE." }
$plan = ($planLines -join "`n") | ConvertFrom-Json

if ($plan.model -ne 'haiku') { throw "Praxen runner default model regressed to '$($plan.model)'; expected 'haiku'." }
if ($plan.runnerVersion -ne 't16r2-v1') { throw "Praxen runner version is '$($plan.runnerVersion)'; expected 't16r2-v1'." }
if ($plan.schemaVersion -ne 3) { throw "Praxen runner plan schema is '$($plan.schemaVersion)'; expected '3'." }
if ($plan.draftProfile.profileVersion -ne 'praxen-draft-profile-v1') { throw 'Praxen runner plan has the wrong draft profile version.' }
if ($plan.draftProfile.praxenVersion -ne '1.1.0') { throw 'Praxen runner plan has the wrong Praxen/profile pairing.' }
if ($plan.draftProfile.manifestFormatVersion -ne 1) { throw 'Praxen runner plan has the wrong manifest-format pairing.' }
$profileHash = (Get-FileHash -LiteralPath $profile -Algorithm SHA256).Hash.ToLowerInvariant()
$skeletonHash = (Get-FileHash -LiteralPath $skeleton -Algorithm SHA256).Hash.ToLowerInvariant()
if ($plan.draftProfile.profileSha256 -ne $profileHash) { throw 'Praxen runner plan profile hash does not match the repository profile.' }
if ($plan.draftProfile.skeletonSha256 -ne $skeletonHash) { throw 'Praxen runner plan skeleton hash does not match the repository skeleton.' }
if ($plan.startup.settingSources -ne 'project') { throw 'Praxen runner must isolate project settings for the default plan.' }
if ($plan.startup.sessionPersistence -ne 'disabled') { throw 'Praxen runner must disable session persistence.' }
if ($plan.startup.modelOutput -ne 'staging-step-9.9-draft-only') { throw 'Praxen runner must restrict model output to the Step 9.9 staging draft.' }
if (@($plan.startup.availableTools) -join ',' -ne 'Read,Grep,Glob,Bash,Write') { throw 'Praxen runner tool allowlist changed unexpectedly.' }
if (@($plan.startup.deniedTools) -join ',' -ne 'Task,Agent') { throw 'Praxen runner must deny worker-dispatch tools.' }
foreach ($role in @('staging', 'guidanceSkeleton', 'finalDraft', 'converter', 'canonical', 'rendered', 'operational', 'result')) {
  if (-not $plan.paths.$role) { throw "Praxen runner plan is missing isolated '$role' output." }
}
$argumentText = @($plan.arguments) -join " `n"
foreach ($required in @('--model', 'haiku', '--plugin-dir', '--no-session-persistence', '--tools', 'Read,Grep,Glob,Bash,Write', '--disallowed-tools')) {
  if (-not $argumentText.Contains($required)) { throw "Praxen runner invocation is missing '$required'." }
}
foreach ($requiredPromptText in @(
  '# Praxen draft manifest',
  'first byte and first line',
  'no BOM, leading whitespace, leading prose, or Markdown fence',
  '## scan -> ## intro_band -> ## behavior_summary -> ## raise_posture -> ## remit_coverage -> ## findings -> ## positives -> ## log_files',
  'matching /^R-\d+$/',
  'matching /^PRAX-\d{4}-\d{2}-\d{2}-\d{3}',
  'Leave no unreplaced slot, TBD/TODO/PLACEHOLDER sentinel, tab, Markdown fence'
)) {
  if (-not $argumentText.Contains($requiredPromptText)) {
    throw "Praxen runner prompt is missing the staging output contract '$requiredPromptText'."
  }
}
if ($argumentText.Contains('--bare')) { throw 'Praxen runner must not use --bare because it disables OAuth/keychain authentication.' }
if (Test-Path -LiteralPath $planOutputRoot) { throw 'Plan-only regression unexpectedly created an evidence directory.' }

$runnerText = Get-Content -LiteralPath $runner -Raw
foreach ($required in @(
  'manifest_to_findings.py',
  'render.py',
  'sancussight-praxen-runner',
  'canonicalArtifactContentHash',
  'workerRemitHash',
  'configurationHash',
  'existing Praxen target attempt directory',
  'Model-authored JSON is forbidden in staging',
  'staging-structure-validation',
  'expectedProfileSha256',
  'expectedSkeletonSha256',
  'Assert-DraftStructure'
)) {
  if (-not $runnerText.Contains($required)) { throw "Praxen runner is missing deterministic operational export binding '$required'." }
}

$pipelockText = Get-Content -LiteralPath $pipelockRunner -Raw
$modelDeclaration = "[ValidateSet('haiku', 'sonnet', 'opus')][string]" + [char]36 + "ClaudeModel = 'haiku'"
if (-not $pipelockText.Contains($modelDeclaration)) { throw 'Pipelock runner default Claude model regressed from Haiku.' }
if (-not $pipelockText.Contains(("{0}, {1}" -f "'--model'", ([char]36 + 'ClaudeModel')))) { throw 'Pipelock runner does not pass its model explicitly.' }
if (-not $pipelockText.Contains("'--setting-sources', 'project'")) { throw 'Pipelock runner does not isolate project settings.' }

$pairTestRoot = Join-Path $env:TEMP "sancussight-t16r2-pair-$([guid]::NewGuid().ToString('N'))"
try {
  $pairScripts = Join-Path $pairTestRoot 'scripts'
  $pairProfileRoot = Join-Path $pairTestRoot 'operations\praxen'
  New-Item -ItemType Directory -Force -Path $pairScripts, $pairProfileRoot | Out-Null
  $pairRunner = Join-Path $pairScripts 'run-spec005-praxen-behavior-verifier.ps1'
  Copy-Item -LiteralPath $runner -Destination $pairRunner
  Copy-Item -LiteralPath $profile -Destination (Join-Path $pairProfileRoot 'draft-profile-v1.json')
  $pairSkeleton = Join-Path $pairProfileRoot 'draft-skeleton-v1.md'
  Copy-Item -LiteralPath $skeleton -Destination $pairSkeleton
  [IO.File]::AppendAllText($pairSkeleton, "`n", [Text.UTF8Encoding]::new($false))
  $changedPairRejected = $false
  try {
    & $pairRunner `
      -ReleaseRunId 'haiku-changed-pair-regression' `
      -TargetId 'sancussight' `
      -WorkspacePath $workspace `
      -WorkerRemitPath $workerRemit `
      -OutputRoot (Join-Path $pairTestRoot 'changed-output') `
      -PlanOnly | Out-Null
  }
  catch {
    $changedPairRejected = $_.Exception.Message -match 'draft skeleton hash changed'
  }
  if (-not $changedPairRejected) { throw 'Praxen runner did not reject a changed repository skeleton before plan/model/converter promotion.' }

  Remove-Item -LiteralPath (Join-Path $pairProfileRoot 'draft-profile-v1.json') -Force
  $missingPairRejected = $false
  try {
    & $pairRunner `
      -ReleaseRunId 'haiku-missing-pair-regression' `
      -TargetId 'sancussight' `
      -WorkspacePath $workspace `
      -WorkerRemitPath $workerRemit `
      -OutputRoot (Join-Path $pairTestRoot 'missing-output') `
      -PlanOnly | Out-Null
  }
  catch {
    $missingPairRejected = $_.Exception.Message -match 'draft-profile input is unavailable'
  }
  if (-not $missingPairRejected) { throw 'Praxen runner did not reject a missing repository profile before plan/model/converter promotion.' }
}
finally {
  $resolvedPairRoot = [IO.Path]::GetFullPath($pairTestRoot)
  $resolvedSystemTemp = [IO.Path]::GetFullPath($env:TEMP)
  if ($resolvedPairRoot.StartsWith($resolvedSystemTemp, [StringComparison]::OrdinalIgnoreCase) -and
      $resolvedPairRoot -ne $resolvedSystemTemp -and
      (Test-Path -LiteralPath $resolvedPairRoot)) {
    Remove-Item -LiteralPath $resolvedPairRoot -Recurse -Force
  }
}

Write-Output 'Claude Haiku runner regression passed: pinned profile/skeleton plan, explicit model, isolated settings, no persistence, and no worker dispatch.'
