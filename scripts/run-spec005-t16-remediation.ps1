[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9._-]{1,160}$')][string]$ReleaseRunId,
  [Parameter(Mandatory)][string]$OutputRoot,
  [Parameter(Mandatory)][string]$SancusSightWorkspacePath,
  [Parameter(Mandatory)][string]$SancusSightWorkerRemitPath,
  [Parameter(Mandatory)][string]$SddExecWorkspacePath,
  [Parameter(Mandatory)][string]$SddExecWorkerRemitPath,
  [ValidateSet('haiku', 'sonnet', 'opus')][string]$Model = 'haiku',
  [ValidatePattern('^[A-Za-z0-9._-]{1,80}$')][string]$AttemptId = 'attempt-1',
  [switch]$RetryApproved,
  [ValidateSet('none', 'sancussight', 'sdd-exec')][string]$ApproveExceptionForTarget = 'none',
  [ValidateLength(0, 240)][string]$ExceptionReason = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$runner = Join-Path $PSScriptRoot 'run-spec005-praxen-behavior-verifier.ps1'
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) {
  throw "T16R Praxen runner is missing: $runner"
}
if ($ApproveExceptionForTarget -ne 'none' -and [string]::IsNullOrWhiteSpace($ExceptionReason)) {
  throw 'An approved exception requires a bounded non-empty -ExceptionReason.'
}

function Write-JsonFile([string]$Path, [object]$Value) {
  $parent = Split-Path $Path -Parent
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  $text = ($Value | ConvertTo-Json -Depth 30) + "`n"
  [IO.File]::WriteAllText($Path, $text, [Text.UTF8Encoding]::new($false))
}

$runRoot = Join-Path ([IO.Path]::GetFullPath($OutputRoot)) $ReleaseRunId
$orchestrationResultPath = Join-Path $runRoot 'result.json'
if (Test-Path -LiteralPath $orchestrationResultPath) {
  throw "Refusing to overwrite an existing T16R orchestration result: $orchestrationResultPath"
}
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null

$targets = @(
  [ordered]@{
    targetId = 'sancussight'
    workspace = $SancusSightWorkspacePath
    remit = $SancusSightWorkerRemitPath
  },
  [ordered]@{
    targetId = 'sdd-exec'
    workspace = $SddExecWorkspacePath
    remit = $SddExecWorkerRemitPath
  }
)

$targetResults = @()
foreach ($target in $targets) {
  try {
    $arguments = @{
      ReleaseRunId = $ReleaseRunId
      TargetId = $target.targetId
      WorkspacePath = $target.workspace
      WorkerRemitPath = $target.remit
      OutputRoot = $OutputRoot
      Model = $Model
      AttemptId = $AttemptId
    }
    if ($RetryApproved) { $arguments.RetryApproved = $true }
    $runnerOutput = & $runner @arguments
    $result = @($runnerOutput)[-1]
    if (-not $result -or $result.state -ne 'passed') {
      throw "Praxen runner returned no bounded passing result for '$($target.targetId)'."
    }
    $targetResults += $result
  }
  catch {
    $state = if ($ApproveExceptionForTarget -eq $target.targetId) { 'exception' } else { 'partial' }
    $reason = if ($state -eq 'exception') { $ExceptionReason } else { [string]$_.Exception.Message }
    $partial = [ordered]@{
      schemaVersion = 1
      state = $state
      producer = 'praxen'
      releaseRunId = $ReleaseRunId
      targetId = $target.targetId
      stage = 'producer'
      reason = $reason
      operatorActionRequired = $true
      releaseEligible = $false
      completedTargets = @($targetResults | ForEach-Object { $_.targetId })
      pausedBeforeTargets = @($targets | Where-Object { $_.targetId -ne $target.targetId -and $_.targetId -notin @($targetResults | ForEach-Object { $_.targetId }) } | ForEach-Object { $_.targetId })
      bundlePromotionAttempted = $false
    }
    Write-JsonFile -Path $orchestrationResultPath -Value $partial
    throw "T16R Praxen orchestration paused for operator direction: $($target.targetId): $reason"
  }
}

$passed = [ordered]@{
  schemaVersion = 1
  state = 'passed'
  producer = 'praxen'
  releaseRunId = $ReleaseRunId
  stage = 'complete'
  reason = 'both-runner-bound-targets-complete'
  operatorActionRequired = $false
  releaseEligible = $false
  completedTargets = @($targetResults | ForEach-Object { $_.targetId })
  bundlePromotionAttempted = $false
  note = 'T16R remediation verification only. A separate authorized T16 operational run is required.'
}
Write-JsonFile -Path $orchestrationResultPath -Value $passed
$passed
