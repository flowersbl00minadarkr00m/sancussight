[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9._-]{1,160}$')][string]$ReleaseRunId,
  [Parameter(Mandatory)][ValidateSet('sancussight', 'sdd-exec')][string]$TargetId,
  [Parameter(Mandatory)][string]$WorkspacePath,
  [Parameter(Mandatory)][string]$WorkerRemitPath,
  [Parameter(Mandatory)][string]$OutputRoot,
  [ValidateSet('haiku', 'sonnet', 'opus')][string]$Model = 'haiku',
  [ValidatePattern('^[A-Za-z0-9._-]{1,80}$')][string]$AttemptId = 'attempt-1',
  [switch]$RetryApproved,
  [switch]$PlanOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$runnerVersion = 't16r2-v1'
$supportedPraxenVersion = '1.1.0'
$supportedManifestFormatVersion = 1
$supportedProfileVersion = 'praxen-draft-profile-v1'
$expectedProfileSha256 = '01eb87c32517c664bc607a076279094a4ab9ac2665f62afbe75ab86c69ddc7a0'
$expectedSkeletonSha256 = '2e9e5be48dc559dda798992494f03e2ea0db029ba708e9ca042f03a33b6073df'
$contractVersion = 'praxen-v2'
$configurationHash = '800c2ba8b0985f2d88ff2f788d2678bcde3faa1cc7b3a32eaf5ba4f416408aaf'

function Get-FullPath([string]$Path) {
  return [IO.Path]::GetFullPath($Path)
}

function Write-JsonFile([string]$Path, [object]$Value) {
  $parent = Split-Path $Path -Parent
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  $text = ($Value | ConvertTo-Json -Depth 40) + "`n"
  [IO.File]::WriteAllText($Path, $text, [Text.UTF8Encoding]::new($false))
}

function Test-Sha256([string]$Value) {
  return $Value -match '^[a-f0-9]{64}$'
}

function Assert-SupportedDraftProfile([object]$Profile, [string]$ProfileHash, [string]$SkeletonHash) {
  if ($ProfileHash -ne $expectedProfileSha256) {
    throw "Repository Praxen draft profile hash changed; expected '$expectedProfileSha256', got '$ProfileHash'."
  }
  if ($SkeletonHash -ne $expectedSkeletonSha256) {
    throw "Repository Praxen draft skeleton hash changed; expected '$expectedSkeletonSha256', got '$SkeletonHash'."
  }
  if ($Profile.profileVersion -ne $supportedProfileVersion -or
      $Profile.praxenVersion -ne $supportedPraxenVersion -or
      [int]$Profile.manifestFormatVersion -ne $supportedManifestFormatVersion -or
      $Profile.skeletonFile -ne 'draft-skeleton-v1.md') {
    throw 'Unsupported Praxen draft profile, skeleton, plugin, or manifest-format pairing.'
  }
  $expectedTopLevel = @(
    'scan',
    'intro_band',
    'behavior_summary',
    'raise_posture',
    'remit_coverage',
    'findings',
    'positives',
    'log_files'
  )
  if ((@($Profile.authoredTopLevelOrder) -join ',') -ne ($expectedTopLevel -join ',')) {
    throw 'Praxen draft profile top-level structural signature is unsupported.'
  }
  if ($Profile.fieldContract.mode -ne 'guidance-only' -or
      $Profile.fieldContract.authority -ne 'pinned manifest_to_findings.py' -or
      $Profile.fieldContract.runnerValidation -ne 'none') {
    throw 'Praxen draft profile must leave field and schema validation to the pinned converter.'
  }
}

function Assert-DraftStructure([string]$Text, [object]$Profile) {
  if ($Text.Contains("`t")) {
    throw 'The Step 9.9 draft contains a forbidden tab.'
  }
  foreach ($patternName in @('slot', 'sentinel', 'fence', 'structuralComment')) {
    $pattern = [string]$Profile.forbiddenDraftPatterns.$patternName
    if (-not $pattern) {
      throw "Praxen draft profile is missing forbidden-pattern rule '$patternName'."
    }
    if ([regex]::IsMatch($Text, $pattern)) {
      throw "The Step 9.9 draft contains a forbidden $patternName pattern."
    }
  }

  $staticByParent = @{}
  foreach ($entry in @($Profile.staticSubsections)) {
    $staticByParent[[string]$entry.parent] = @($entry.order)
  }
  $dynamicByParent = @{}
  foreach ($entry in @($Profile.dynamicHeadings)) {
    $dynamicByParent[[string]$entry.parent] = $entry
  }

  $topLevelOrder = @($Profile.authoredTopLevelOrder)
  $topLevelIndex = -1
  $staticIndexes = @{}
  $seenDynamicHeadings = @{}
  $currentTopLevel = $null
  $currentSubsection = $null
  $lines = $Text -split "`r?`n"

  for ($lineIndex = 1; $lineIndex -lt $lines.Count; $lineIndex++) {
    $line = $lines[$lineIndex]
    $heading = [regex]::Match($line, '^(#{2,4}) ([^\r\n]+?)\s*$')
    if (-not $heading.Success) {
      if ($line -match '^\s*#{2,}') {
        throw "Line $($lineIndex + 1) contains a malformed structural heading."
      }
      continue
    }

    $level = $heading.Groups[1].Value.Length
    $name = $heading.Groups[2].Value
    if ($level -eq 2) {
      $topLevelIndex++
      if ($topLevelIndex -ge $topLevelOrder.Count -or $name -ne $topLevelOrder[$topLevelIndex]) {
        $expected = if ($topLevelIndex -lt $topLevelOrder.Count) { $topLevelOrder[$topLevelIndex] } else { '<none>' }
        throw "Line $($lineIndex + 1) has unsupported top-level heading '## $name'; expected '## $expected'."
      }
      $currentTopLevel = $name
      $currentSubsection = $null
      if ($staticByParent.ContainsKey($currentTopLevel)) {
        $staticIndexes[$currentTopLevel] = -1
      }
      continue
    }

    if (-not $currentTopLevel) {
      throw "Line $($lineIndex + 1) contains a heading without a top-level parent."
    }

    if ($level -eq 3) {
      $dynamicParent = $currentTopLevel
      if ($dynamicByParent.ContainsKey($dynamicParent)) {
        $dynamic = $dynamicByParent[$dynamicParent]
        if ([int]$dynamic.level -ne 3 -or -not [regex]::IsMatch($name, [string]$dynamic.pattern)) {
          throw "Line $($lineIndex + 1) has an unsupported dynamic heading under '## $currentTopLevel'."
        }
        $dynamicKey = "$dynamicParent|$name"
        if ($seenDynamicHeadings.ContainsKey($dynamicKey)) {
          throw "Line $($lineIndex + 1) duplicates dynamic heading '$name' under '$dynamicParent'."
        }
        $seenDynamicHeadings[$dynamicKey] = $true
        $currentSubsection = $name
        continue
      }

      if (-not $staticByParent.ContainsKey($currentTopLevel)) {
        throw "Line $($lineIndex + 1) has an unknown subsection under '## $currentTopLevel'."
      }
      $staticIndexes[$currentTopLevel] = [int]$staticIndexes[$currentTopLevel] + 1
      $expectedSubsections = @($staticByParent[$currentTopLevel])
      $subsectionIndex = [int]$staticIndexes[$currentTopLevel]
      if ($subsectionIndex -ge $expectedSubsections.Count -or $name -ne $expectedSubsections[$subsectionIndex]) {
        $expected = if ($subsectionIndex -lt $expectedSubsections.Count) { $expectedSubsections[$subsectionIndex] } else { '<none>' }
        throw "Line $($lineIndex + 1) has unsupported subsection '### $name' under '## $currentTopLevel'; expected '### $expected'."
      }
      $currentSubsection = $name
      continue
    }

    $dynamicParent = "$currentTopLevel/$currentSubsection"
    if (-not $dynamicByParent.ContainsKey($dynamicParent)) {
      throw "Line $($lineIndex + 1) has an unsupported level-four heading under '$dynamicParent'."
    }
    $dynamic = $dynamicByParent[$dynamicParent]
    if ([int]$dynamic.level -ne 4 -or -not [regex]::IsMatch($name, [string]$dynamic.pattern)) {
      throw "Line $($lineIndex + 1) has a malformed dynamic heading under '$dynamicParent'."
    }
    $dynamicKey = "$dynamicParent|$name"
    if ($seenDynamicHeadings.ContainsKey($dynamicKey)) {
      throw "Line $($lineIndex + 1) duplicates dynamic heading '$name' under '$dynamicParent'."
    }
    $seenDynamicHeadings[$dynamicKey] = $true
  }

  if ($topLevelIndex -ne ($topLevelOrder.Count - 1)) {
    throw 'The Step 9.9 draft is missing one or more required top-level headings.'
  }
  foreach ($parent in $staticByParent.Keys) {
    $expectedCount = @($staticByParent[$parent]).Count
    $actualCount = if ($staticIndexes.ContainsKey($parent)) { [int]$staticIndexes[$parent] + 1 } else { 0 }
    if ($actualCount -ne $expectedCount) {
      throw "The Step 9.9 draft is missing one or more required subsections under '## $parent'."
    }
  }
}

if ($AttemptId -ne 'attempt-1' -and -not $RetryApproved) {
  throw 'A non-initial Praxen attempt requires explicit -RetryApproved operator authorization.'
}

$workspace = (Resolve-Path -LiteralPath $WorkspacePath -ErrorAction Stop).Path
if (-not (Test-Path -LiteralPath $workspace -PathType Container)) {
  throw "Praxen workspace is not a directory: $workspace"
}
$workerRemit = (Resolve-Path -LiteralPath $WorkerRemitPath -ErrorAction Stop).Path
if (-not (Test-Path -LiteralPath $workerRemit -PathType Leaf)) {
  throw "Worker Remit is not a file: $workerRemit"
}

$claudeCommands = @(Get-Command claude -CommandType Application -All -ErrorAction SilentlyContinue)
if ($claudeCommands.Count -eq 0) { throw 'Claude Code executable was not found on PATH.' }
$claudePath = $claudeCommands[0].Source
$pythonCommands = @(Get-Command python -CommandType Application -All -ErrorAction SilentlyContinue)
if ($pythonCommands.Count -eq 0) { throw 'Python executable was not found on PATH.' }
$pythonPath = $pythonCommands[0].Source

$praxenPluginDir = Join-Path $env:USERPROFILE ".claude\plugins\cache\open-agent-ai-security\praxen\$supportedPraxenVersion"
$pluginManifest = Join-Path $praxenPluginDir '.claude-plugin\plugin.json'
$behaviorSkillDir = Join-Path $praxenPluginDir 'skills\behavior-verifier'
$behaviorSkill = Join-Path $behaviorSkillDir 'SKILL.md'
$converterScript = Join-Path $behaviorSkillDir 'manifest_to_findings.py'
$rendererScript = Join-Path $behaviorSkillDir 'render.py'
$reportTemplate = Join-Path $behaviorSkillDir 'report_template.html'
foreach ($required in @($pluginManifest, $behaviorSkill, $converterScript, $rendererScript, $reportTemplate)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
    throw "Pinned Praxen plugin input is unavailable: $required"
  }
}
$plugin = Get-Content -LiteralPath $pluginManifest -Raw | ConvertFrom-Json
if ($plugin.version -ne $supportedPraxenVersion) {
  throw "Pinned Praxen plugin version is '$($plugin.version)'; expected '$supportedPraxenVersion'."
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$profilePath = Join-Path $projectRoot 'operations\praxen\draft-profile-v1.json'
$skeletonPath = Join-Path $projectRoot 'operations\praxen\draft-skeleton-v1.md'
foreach ($required in @($profilePath, $skeletonPath)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
    throw "Repository Praxen draft-profile input is unavailable: $required"
  }
}
try {
  $draftProfile = Get-Content -LiteralPath $profilePath -Raw | ConvertFrom-Json
}
catch {
  throw "Repository Praxen draft profile is malformed JSON: $($_.Exception.Message)"
}
$profileHash = (Get-FileHash -LiteralPath $profilePath -Algorithm SHA256).Hash.ToLowerInvariant()
$skeletonHash = (Get-FileHash -LiteralPath $skeletonPath -Algorithm SHA256).Hash.ToLowerInvariant()
Assert-SupportedDraftProfile -Profile $draftProfile -ProfileHash $profileHash -SkeletonHash $skeletonHash

$outputBase = Get-FullPath $OutputRoot
$runRoot = Join-Path $outputBase $ReleaseRunId
$targetBase = Join-Path $runRoot $TargetId
$targetRoot = Join-Path $targetBase $AttemptId
$stagingRoot = Join-Path $targetRoot 'staging'
$converterRoot = Join-Path $targetRoot 'converter'
$canonicalRoot = Join-Path $targetRoot 'canonical'
$renderedRoot = Join-Path $targetRoot 'rendered'
$operationalRoot = Join-Path $targetRoot 'operational'
$resultPath = Join-Path $targetRoot 'result.json'
$guidanceSkeletonPath = Join-Path $stagingRoot 'draft-skeleton-v1.guidance.md'
$draftPath = Join-Path $stagingRoot "$TargetId-step-9.9-draft.md"
$converterOutputPath = Join-Path $converterRoot "$TargetId-findings.json"
$canonicalPath = Join-Path $canonicalRoot "$TargetId-findings.json"
$htmlPath = Join-Path $renderedRoot "$TargetId-analysis.html"
$textPath = Join-Path $renderedRoot "$TargetId-analysis.txt"
$operationalPath = Join-Path $operationalRoot "$TargetId-operational.json"
$remitHash = (Get-FileHash -LiteralPath $workerRemit -Algorithm SHA256).Hash.ToLowerInvariant()
$converterHash = (Get-FileHash -LiteralPath $converterScript -Algorithm SHA256).Hash.ToLowerInvariant()
$rendererHash = (Get-FileHash -LiteralPath $rendererScript -Algorithm SHA256).Hash.ToLowerInvariant()

$topLevelPrompt = @($draftProfile.authoredTopLevelOrder | ForEach-Object { "## $_" }) -join ' -> '
$dynamicPrompt = @($draftProfile.dynamicHeadings | ForEach-Object {
  "level $($_.level) under '$($_.parent)' matching /$($_.pattern)/"
}) -join '; '
$prompt = @"
Run the installed /praxen:behavior-verifier skill for the approved target '$TargetId'.

Analyze only live observations from '$workspace' against the Worker Remit at '$workerRemit'.
Use the immutable runner-staged guidance skeleton at '$guidanceSkeletonPath' as the only structural
source. It is paired to repository profile '$profilePath' (SHA-256 $profileHash), repository skeleton
'$skeletonPath' (SHA-256 $skeletonHash), Praxen $supportedPraxenVersion, and manifest format
$supportedManifestFormatVersion. Write exactly one final parser-grade Step 9.9 draft to '$draftPath'
by replacing every skeleton slot with final values or the declared variable blocks. Do not modify,
copy, rename, or submit the guidance skeleton as the final draft.

The exact authored top-level order is: $topLevelPrompt. Do not add, delete, rename, duplicate, or
reorder structural headings. The only dynamic headings allowed are: $dynamicPrompt. Do not author
footer or stat_counts. Leave no unreplaced slot, TBD/TODO/PLACEHOLDER sentinel, tab, Markdown fence,
or structural comment. The final draft's first byte and first line must be exactly
'# Praxen draft manifest', with exact casing and spacing and no BOM, leading whitespace, leading prose, or Markdown fence before or around it. Do not write JSON, HTML, TXT, or any other
official-looking report. The runner alone invokes the pinned converter and renderer after this
session exits. Do not use historical, copied, synthetic, relabeled, or guessed evidence. Do not
invoke Task, Agent, subagents, or another worker. Keep the draft privacy-safe:
exclude prompts, responses, reasoning, credentials, private keys, raw tool payloads, and unrestricted
file content.
"@

$claudeArguments = @(
  '--print',
  '--no-session-persistence',
  '--model', $Model,
  '--setting-sources', 'project',
  '--plugin-dir', $praxenPluginDir,
  '--permission-mode', 'bypassPermissions',
  '--tools', 'Read,Grep,Glob,Bash,Write',
  '--allowed-tools', 'Read', 'Grep', 'Glob', 'Bash', 'Write',
  '--disallowed-tools', 'Task', 'Agent',
  '--add-dir', $workspace,
  '--add-dir', $stagingRoot,
  '--output-format', 'text',
  $prompt
)

$draftProfileEvidence = [ordered]@{
  profileVersion = $draftProfile.profileVersion
  profileRole = 'operations/praxen/draft-profile-v1.json'
  profileSha256 = $profileHash
  skeletonRole = 'operations/praxen/draft-skeleton-v1.md'
  skeletonSha256 = $skeletonHash
  praxenVersion = $supportedPraxenVersion
  manifestFormatVersion = $supportedManifestFormatVersion
}

$plan = [ordered]@{
  schemaVersion = 3
  runnerVersion = $runnerVersion
  releaseRunId = $ReleaseRunId
  targetId = $TargetId
  attemptId = $AttemptId
  retryApproved = [bool]$RetryApproved
  model = $Model
  workspace = $workspace
  workerRemit = $workerRemit
  workerRemitSha256 = $remitHash
  draftProfile = $draftProfileEvidence
  outputRoot = $targetRoot
  paths = [ordered]@{
    staging = $stagingRoot
    guidanceSkeleton = $guidanceSkeletonPath
    finalDraft = $draftPath
    converter = $converterRoot
    canonical = $canonicalRoot
    rendered = $renderedRoot
    operational = $operationalRoot
    result = $resultPath
  }
  pinned = [ordered]@{
    claudePath = $claudePath
    pythonPath = $pythonPath
    praxenPluginVersion = $plugin.version
    converterScript = $converterScript
    converterSha256 = $converterHash
    rendererScript = $rendererScript
    rendererSha256 = $rendererHash
    reportTemplate = $reportTemplate
  }
  startup = [ordered]@{
    settingSources = 'project'
    pluginDir = $praxenPluginDir
    sessionPersistence = 'disabled'
    availableTools = @('Read', 'Grep', 'Glob', 'Bash', 'Write')
    deniedTools = @('Task', 'Agent')
    modelOutput = 'staging-step-9.9-draft-only'
  }
  arguments = $claudeArguments
}

if ($PlanOnly) {
  $plan | ConvertTo-Json -Depth 10
  exit 0
}

if (Test-Path -LiteralPath $targetRoot) {
  throw "Refusing to reuse an existing Praxen target attempt directory: $targetRoot"
}

$startedAt = [DateTimeOffset]::UtcNow
$stage = 'initialize'
New-Item -ItemType Directory -Path $stagingRoot, $converterRoot, $canonicalRoot, $renderedRoot, $operationalRoot | Out-Null
[IO.File]::WriteAllBytes($guidanceSkeletonPath, [IO.File]::ReadAllBytes($skeletonPath))
(Get-Item -LiteralPath $guidanceSkeletonPath).IsReadOnly = $true
if ((Get-FileHash -LiteralPath $guidanceSkeletonPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $skeletonHash) {
  throw 'Runner-staged Praxen guidance skeleton hash does not match the repository-pinned skeleton.'
}

try {
  $stage = 'model-draft'
  $claudeVersionLines = & $claudePath --version
  if ($LASTEXITCODE -ne 0) { throw "Claude version probe failed with exit code $LASTEXITCODE." }
  $claudeVersion = ($claudeVersionLines -join ' ').Trim()
  if (-not $claudeVersion -or $claudeVersion.Length -gt 160) { throw 'Claude version output is missing or unbounded.' }

  $priorDraftEnvironment = $env:SANCUSSIGHT_PRAXEN_STAGING_DRAFT_PATH
  $priorRunEnvironment = $env:SANCUSSIGHT_PRAXEN_RELEASE_RUN_ID
  $priorTargetEnvironment = $env:SANCUSSIGHT_PRAXEN_TARGET_ID
  try {
    $env:SANCUSSIGHT_PRAXEN_STAGING_DRAFT_PATH = $draftPath
    $env:SANCUSSIGHT_PRAXEN_RELEASE_RUN_ID = $ReleaseRunId
    $env:SANCUSSIGHT_PRAXEN_TARGET_ID = $TargetId
    Push-Location $targetRoot
    try {
      & $claudePath @claudeArguments
      $claudeExitCode = $LASTEXITCODE
    }
    finally {
      Pop-Location
    }
  }
  finally {
    $env:SANCUSSIGHT_PRAXEN_STAGING_DRAFT_PATH = $priorDraftEnvironment
    $env:SANCUSSIGHT_PRAXEN_RELEASE_RUN_ID = $priorRunEnvironment
    $env:SANCUSSIGHT_PRAXEN_TARGET_ID = $priorTargetEnvironment
  }
  if ($claudeExitCode -ne 0) { throw "Claude draft producer failed with exit code $claudeExitCode." }

  $stage = 'staging-validation'
  $stagedFiles = @(Get-ChildItem -LiteralPath $stagingRoot -File)
  $allowedStagingPaths = @($guidanceSkeletonPath, $draftPath)
  $unexpectedStaging = @($stagedFiles | Where-Object { $_.FullName -notin $allowedStagingPaths })
  if ($unexpectedStaging.Count -gt 0) {
    throw 'Model-authored output outside the one final draft path is forbidden in staging.'
  }
  $drafts = @($stagedFiles | Where-Object { $_.FullName -eq $draftPath })
  $modelJson = @($stagedFiles | Where-Object { $_.Extension -ieq '.json' })
  if ($modelJson.Count -gt 0) { throw 'Model-authored JSON is forbidden in staging.' }
  if ($drafts.Count -ne 1 -or $drafts[0].FullName -ne $draftPath) {
    throw "Expected exactly one Step 9.9 draft at the runner-owned staging path; found $($drafts.Count)."
  }
  if ($drafts[0].LastWriteTimeUtc -lt $startedAt.UtcDateTime.AddSeconds(-1)) {
    throw 'The Step 9.9 draft is stale relative to this attempt.'
  }
  if ((Get-FileHash -LiteralPath $guidanceSkeletonPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $skeletonHash) {
    throw 'The runner-staged guidance skeleton changed during model authoring.'
  }
  $draftBytes = [IO.File]::ReadAllBytes($draftPath)
  $requiredHeaderBytes = [Text.Encoding]::UTF8.GetBytes('# Praxen draft manifest')
  $headerMatches = $draftBytes.Length -ge $requiredHeaderBytes.Length
  if ($headerMatches) {
    for ($index = 0; $index -lt $requiredHeaderBytes.Length; $index++) {
      if ($draftBytes[$index] -ne $requiredHeaderBytes[$index]) {
        $headerMatches = $false
        break
      }
    }
  }
  $firstLineEndsExactly = $draftBytes.Length -eq $requiredHeaderBytes.Length
  if (-not $firstLineEndsExactly -and $headerMatches) {
    $nextByte = $draftBytes[$requiredHeaderBytes.Length]
    $firstLineEndsExactly = $nextByte -eq 0x0A -or
      ($nextByte -eq 0x0D -and
       $draftBytes.Length -gt ($requiredHeaderBytes.Length + 1) -and
       $draftBytes[$requiredHeaderBytes.Length + 1] -eq 0x0A)
  }
  if (-not $headerMatches -or -not $firstLineEndsExactly) {
    throw "The Step 9.9 draft must start at byte 0 with the exact first line '# Praxen draft manifest' and no BOM, whitespace, leading prose, or Markdown fence."
  }

  $stage = 'staging-structure-validation'
  $draftText = [Text.UTF8Encoding]::new($false, $true).GetString($draftBytes)
  Assert-DraftStructure -Text $draftText -Profile $draftProfile

  $stage = 'converter'
  & $pythonPath $converterScript --manifest $draftPath --out $converterOutputPath
  $converterExitCode = $LASTEXITCODE
  if ($converterExitCode -ne 0) { throw "Pinned Praxen converter failed with exit code $converterExitCode." }
  if (-not (Test-Path -LiteralPath $converterOutputPath -PathType Leaf)) {
    throw 'Pinned Praxen converter produced no findings JSON.'
  }
  $canonicalText = Get-Content -LiteralPath $converterOutputPath -Raw
  try { $canonical = $canonicalText | ConvertFrom-Json } catch { throw 'Pinned converter output is malformed JSON.' }
  if ($canonical.schema_version -ne '2.0' -or
      $canonical.praxen_version -ne $supportedPraxenVersion -or
      $null -eq $canonical.scan -or
      -not $canonical.scan.scan_timestamp -or
      $canonical.scan.agent_slug -ne $TargetId -or
      $null -eq $canonical.findings -or
      $canonical.findings -isnot [array]) {
    throw 'Pinned converter output is missing required schema, version, target, scan, or findings fields.'
  }
  $observedAt = [DateTimeOffset]::MinValue
  if (-not [DateTimeOffset]::TryParse([string]$canonical.scan.scan_timestamp, [ref]$observedAt)) {
    throw 'Pinned converter output contains an invalid producer scan timestamp.'
  }
  if ($observedAt -lt $startedAt.AddSeconds(-1) -or $observedAt -gt [DateTimeOffset]::UtcNow.AddSeconds(5)) {
    throw 'Pinned converter output is stale or future-dated for this attempt.'
  }
  $canonicalHash = (Get-FileHash -LiteralPath $converterOutputPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if (-not (Test-Sha256 $canonicalHash)) { throw 'Canonical content hash is invalid.' }
  Copy-Item -LiteralPath $converterOutputPath -Destination $canonicalPath
  (Get-Item -LiteralPath $canonicalPath).IsReadOnly = $true

  $stage = 'renderer'
  & $pythonPath $rendererScript --findings $canonicalPath --template $reportTemplate --out-html $htmlPath --out-txt $textPath
  $rendererExitCode = $LASTEXITCODE
  if ($rendererExitCode -ne 0) { throw "Pinned Praxen renderer failed with exit code $rendererExitCode." }
  foreach ($rendered in @($htmlPath, $textPath)) {
    if (-not (Test-Path -LiteralPath $rendered -PathType Leaf) -or (Get-Item -LiteralPath $rendered).Length -eq 0) {
      throw "Pinned Praxen renderer did not create a non-empty official artifact: $rendered"
    }
    (Get-Item -LiteralPath $rendered).IsReadOnly = $true
  }

  $stage = 'binding'
  $operationalProjection = $canonicalText | ConvertFrom-Json
  $operationalProjection | Add-Member -NotePropertyName operational -NotePropertyValue ([ordered]@{
    qualification = 'operational'
    sourceVersion = $supportedPraxenVersion
    runId = $ReleaseRunId
    targetId = $TargetId
    contractVersion = $contractVersion
    configurationHash = $configurationHash
    workerRemitHash = $remitHash
  }) -Force
  $operationalProjection | Add-Member -NotePropertyName sancussight -NotePropertyValue ([ordered]@{
    runnerBinding = [ordered]@{
      bindingVersion = 1
      producer = 'sancussight-praxen-runner'
      releaseRunId = $ReleaseRunId
      targetId = $TargetId
      workerRemitHash = $remitHash
      sourceVersion = $supportedPraxenVersion
      contractVersion = $contractVersion
      canonicalArtifactContentHash = $canonicalHash
      producerObservedAt = [string]$canonical.scan.scan_timestamp
      claudeCliVersion = $claudeVersion
      selectedModel = $Model
      praxenPluginVersion = $plugin.version
      converterScriptHash = $converterHash
      rendererScriptHash = $rendererHash
      runnerVersion = $runnerVersion
      canonicalRoleName = "canonical/$TargetId-findings.json"
      sourceRoles = [ordered]@{
        draft = "staging/$TargetId-step-9.9-draft.md"
        canonical = "canonical/$TargetId-findings.json"
        renderedHtml = "rendered/$TargetId-analysis.html"
        renderedText = "rendered/$TargetId-analysis.txt"
      }
    }
  }) -Force
  Write-JsonFile -Path $operationalPath -Value $operationalProjection

  $stage = 'complete'
  $result = [ordered]@{
    schemaVersion = 1
    state = 'passed'
    producer = 'praxen'
    releaseRunId = $ReleaseRunId
    targetId = $TargetId
    attemptId = $AttemptId
    stage = $stage
    reason = 'runner-boundary-complete'
    operatorActionRequired = $false
    draftProfile = $draftProfileEvidence
    artifacts = [ordered]@{
      draft = "staging/$TargetId-step-9.9-draft.md"
      canonical = "canonical/$TargetId-findings.json"
      renderedHtml = "rendered/$TargetId-analysis.html"
      renderedText = "rendered/$TargetId-analysis.txt"
      operational = "operational/$TargetId-operational.json"
    }
  }
  Write-JsonFile -Path $resultPath -Value $result
  $result
}
catch {
  $failure = [ordered]@{
    schemaVersion = 1
    state = 'failed'
    producer = 'praxen'
    releaseRunId = $ReleaseRunId
    targetId = $TargetId
    attemptId = $AttemptId
    stage = $stage
    reason = [string]$_.Exception.Message
    operatorActionRequired = $true
    draftProfile = $draftProfileEvidence
  }
  Write-JsonFile -Path $resultPath -Value $failure
  throw
}
