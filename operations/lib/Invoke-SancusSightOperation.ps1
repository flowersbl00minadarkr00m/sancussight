Set-StrictMode -Version Latest

$script:OperationRoot = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'SancusSight\operations'
$script:InventoryPath = Join-Path $PSScriptRoot '..\manifests\producer-inventory.v1.json'
$script:AllowedSources = @('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')
$script:AllowedFailureCases = @(
  'source-stopped', 'telemetry-bridge-stopped', 'pi-extension-disabled', 'malformed-runtime-event', 'privacy-setting-mismatch',
  'artifact-inaccessible', 'unsupported-format', 'invalid-pipelock-signature',
  'rampart-execution-error', 'aimap-out-of-scope', 'collector-restart', 'duplicate-replay',
  'artifact-rotation', 'source-upgrade-mismatch', 'successful-recovery'
)

function Read-JsonDocument {
  param([Parameter(Mandatory)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "The selected manifest or artifact does not exist."
  }
  try {
    return ConvertFrom-Json -InputObject (Get-Content -LiteralPath $Path -Raw)
  } catch {
    throw "The selected JSON document is invalid."
  }
}

function Read-ProducerInventory {
  $inventory = Read-JsonDocument -Path $script:InventoryPath
  if ($inventory.schemaVersion -ne 1 -or $inventory.contract -ne 'OperationalProducerInventoryV1') {
    throw 'Unsupported operational producer inventory contract.'
  }
  $sources = @($inventory.sources)
  if ($sources.Count -ne $script:AllowedSources.Count -or (@($sources.id | Sort-Object) -join ',') -ne (@($script:AllowedSources | Sort-Object) -join ',')) {
    throw 'Operational producer inventory must contain exactly the six approved source/provider IDs supporting five evidence categories.'
  }
  foreach ($source in $sources) {
    if ([string]::IsNullOrWhiteSpace([string]$source.id) -or [string]::IsNullOrWhiteSpace([string]$source.evidenceContract) -or [string]::IsNullOrWhiteSpace([string]$source.boundary)) {
      throw 'Operational producer inventory contains an incomplete source entry.'
    }
    if ([string]$source.officialUrl -notmatch '^https://') {
      throw "Source $($source.id) does not have an HTTPS official URL."
    }
    if ($null -eq $source.supportedVersions) {
      throw "Source $($source.id) has no pinned version list."
    }
  }
  return $inventory
}

function New-OperationRecord {
  param(
    [Parameter(Mandatory)][string]$Action,
    [string]$SourceId,
    [Parameter(Mandatory)][ValidateSet('passed', 'blocked', 'planned', 'failed')][string]$Result,
    [Parameter(Mandatory)][string]$Message,
    [string]$EvidenceLocation = '',
    [string[]]$Limits = @()
  )
  $runId = [Guid]::NewGuid().ToString('N')
  $runDirectory = Join-Path $script:OperationRoot (Join-Path 'runs' $runId)
  New-Item -ItemType Directory -Force -Path $runDirectory | Out-Null
  $record = [ordered]@{
    schemaVersion = 1
    runId = $runId
    action = $Action
    sourceId = if ($SourceId) { $SourceId } else { $null }
    operatorAction = "sancussight.operations.$Action"
    recordedAt = (Get-Date).ToUniversalTime().ToString('o')
    result = $Result
    message = $Message
    evidenceLocation = if ($EvidenceLocation) { $EvidenceLocation } else { $null }
    limits = @($Limits)
  }
  $recordPath = Join-Path $runDirectory 'run-record.v1.json'
  $record | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $recordPath -Encoding utf8
  $record
}

function Assert-SourceId {
  param([string]$SourceId)
  if ([string]::IsNullOrWhiteSpace($SourceId) -or $script:AllowedSources -notcontains $SourceId) {
    throw 'A source ID from the fixed source/provider allowlist is required.'
  }
}

function Invoke-SancusSightOperation {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][ValidateSet('preflight', 'install-user', 'inspect', 'export-source', 'run-release-gate', 'exercise-failures', 'rollback', 'uninstall-user')][string]$Action,
    [ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId,
    [string]$InputPath,
    [ValidateSet('source-stopped', 'telemetry-bridge-stopped', 'pi-extension-disabled', 'malformed-runtime-event', 'privacy-setting-mismatch', 'artifact-inaccessible', 'unsupported-format', 'invalid-pipelock-signature', 'rampart-execution-error', 'aimap-out-of-scope', 'collector-restart', 'duplicate-replay', 'artifact-rotation', 'source-upgrade-mismatch', 'successful-recovery')][string]$FailureCase,
    [bool]$PreserveEvidence = $true,
    [switch]$DryRun
  )

  $inventory = Read-ProducerInventory
  if ($SourceId) { Assert-SourceId -SourceId $SourceId }
  if ($Action -eq 'exercise-failures' -and [string]::IsNullOrWhiteSpace($FailureCase)) { throw 'A fixed failure case is required.' }
  if ($Action -in @('export-source', 'run-release-gate') -and [string]::IsNullOrWhiteSpace($InputPath)) { throw 'An explicit input path is required for this operation.' }

  $limits = @(
    'SancusSight does not install, supervise, execute, scan, or mutate upstream tools.',
    'No free-form executable, command line, argument tail, credential, or private key is accepted.',
    'Producer evidence is retained by default; removal of evidence is not an operation of this harness.'
  )

  switch ($Action) {
    'preflight' {
      $unpinned = @($inventory.sources | Where-Object { @($_.supportedVersions).Count -eq 0 } | ForEach-Object { $_.id })
      $message = if ($unpinned.Count) { "Preflight is blocked until pinned versions are recorded for: $($unpinned -join ', ')." } else { 'All six source/provider inventory entries supporting five evidence categories have pinned versions and fixed contracts.' }
      $result = if ($unpinned.Count) { 'blocked' } else { 'passed' }
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result $result -Message $message -Limits ($limits + 'Preflight performs local manifest validation only; it does not contact or launch a producer.')
    }
    'install-user' {
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'planned' -Message 'User-scoped installation is a fixed operator handoff and remains unexecuted until the selected source has a pinned version and approved artifact.' -Limits ($limits + 'This implementation records the boundary and does not download, install, or start an upstream producer.')
    }
    'inspect' {
      $runPath = Join-Path $script:OperationRoot 'runs'
      $recordCount = if (Test-Path -LiteralPath $runPath) { @(Get-ChildItem -LiteralPath $runPath -Filter 'run-record.v1.json' -Recurse -File).Count } else { 0 }
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'passed' -Message "Fixed operation inventory validated; $recordCount sanitized run record(s) are retained under the user-scoped operations directory." -EvidenceLocation $runPath -Limits $limits
    }
    'export-source' {
      if (-not (Test-Path -LiteralPath $InputPath -PathType Leaf)) { return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'blocked' -Message 'The selected source artifact is inaccessible; no prior evidence was removed.' -EvidenceLocation $InputPath -Limits $limits }
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'planned' -Message 'Source export handoff recorded. The fixed harness does not copy or normalize raw producer artifacts.' -EvidenceLocation $InputPath -Limits ($limits + 'Sanitization and schema validation must be performed by the source-specific SancusSight adapter.')
    }
    'run-release-gate' {
      $document = Read-JsonDocument -Path $InputPath
      if ($document.schemaVersion -ne 1 -or $document.releaseRunId -eq $null) { return New-OperationRecord -Action $Action -Result 'blocked' -Message 'The selected release manifest is unsupported or incomplete.' -EvidenceLocation $InputPath -Limits $limits }
      return New-OperationRecord -Action $Action -Result 'planned' -Message 'Release-gate input is structurally accepted for the SancusSight read-only gate; upstream execution and verification remain outside this harness.' -EvidenceLocation $InputPath -Limits $limits
    }
    'exercise-failures' {
      if ($script:AllowedFailureCases -notcontains $FailureCase) { throw 'The failure case is not in the fixed release matrix.' }
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'planned' -Message "Failure-matrix case '$FailureCase' is recorded for an operator-owned exercise." -Limits ($limits + 'This entry point never stops, corrupts, replaces, or mutates a producer; the exercise must be performed outside SancusSight.')
    }
    'rollback' {
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'planned' -Message "Rollback handoff recorded for $SourceId. Evidence preservation is $PreserveEvidence." -Limits ($limits + 'Rollback does not delete evidence and does not invoke a producer stop command.')
    }
    'uninstall-user' {
      return New-OperationRecord -Action $Action -SourceId $SourceId -Result 'planned' -Message "Removal handoff recorded for $SourceId. Evidence preservation is $PreserveEvidence." -Limits ($limits + 'Removal is explicit and user-scoped; this harness does not delete producer artifacts or retained evidence.')
    }
  }
}
