Set-StrictMode -Version Latest
$projectRoot = Split-Path $PSScriptRoot -Parent
$operationFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'operations') -Filter '*.ps1' -Recurse -File)
$forbidden = @('Start-Process', 'Invoke-Expression', 'Invoke-Command', 'Start-Job', 'System.Diagnostics.Process', 'Remove-Item', 'Copy-Item', 'Move-Item')
foreach ($file in $operationFiles) {
  $text = Get-Content -LiteralPath $file.FullName -Raw
  foreach ($token in $forbidden) {
    if ($text.Contains($token)) { throw "Forbidden lifecycle capability '$token' found in $($file.Name)." }
  }
}
$helper = Get-Content -LiteralPath (Join-Path $projectRoot 'operations\lib\Invoke-SancusSightOperation.ps1') -Raw
foreach ($source in @('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')) {
  if (-not $helper.Contains("'$source'")) { throw "Source allowlist is missing $source." }
}
foreach ($action in @('preflight', 'install-user', 'inspect', 'export-source', 'run-release-gate', 'exercise-failures', 'rollback', 'uninstall-user')) {
  if (-not $helper.Contains("'$action'")) { throw "Action allowlist is missing $action." }
}
$inventoryPath = Join-Path $projectRoot 'operations\manifests\producer-inventory.v1.json'
$inventory = ConvertFrom-Json -InputObject (Get-Content -LiteralPath $inventoryPath -Raw)
if ($inventory.schemaVersion -ne 1 -or @($inventory.sources).Count -ne 6) { throw 'Producer inventory shape is invalid.' }
if (@($inventory.sources | Where-Object { [string]$_.officialUrl -notmatch '^https://' }).Count -gt 0) { throw 'Every producer inventory URL must be HTTPS.' }
if (@($inventory.sources | Where-Object { $null -eq $_.supportedVersions }).Count -gt 0) { throw 'Every producer inventory entry must declare a version list, even when empty.' }
$releaseExample = ConvertFrom-Json -InputObject (Get-Content -LiteralPath (Join-Path $projectRoot 'operations\manifests\release-run.example.json') -Raw)
$praxenTargets = @($releaseExample.sources.praxen.requiredTargets)
if ($praxenTargets.Count -ne 2 -or ((@($praxenTargets.targetId | Sort-Object) -join ',') -ne 'sancussight,sdd-exec')) { throw 'Release example must pair both approved Praxen targets.' }
if (@($praxenTargets | Where-Object { [string]$_.workerRemitHash -notmatch '^[a-f0-9]{64}$' }).Count -gt 0) { throw 'Every Praxen target must carry its paired Worker Remit hash.' }
$piExtension = Get-Content -LiteralPath (Join-Path $projectRoot 'operations\telemetry\pi-extension.ts') -Raw
foreach ($token in @('event.input', 'event.content', 'event.details', 'event.message', 'event.toolResults', 'getSessionFile')) {
  if ($piExtension.Contains($token)) { throw "Pi telemetry extension reads prohibited payload '$token'." }
}
$bridge = Get-Content -LiteralPath (Join-Path $projectRoot 'operations\telemetry\otlp-bridge.ts') -Raw
if (-not $bridge.Contains("server.listen(PORT, '127.0.0.1')")) { throw 'OTLP bridge must bind its fixed port to loopback only.' }
$collectorFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'collector') -Filter '*.ts' -Recurse -File)
foreach ($file in $collectorFiles) {
  $text = Get-Content -LiteralPath $file.FullName -Raw
  if ($text -match 'from [''"]node:(?:child_process|cluster|worker_threads)[''"]') { throw "Collector execution capability found in $($file.Name)." }
}
$claudeRunner = Get-Content -LiteralPath (Join-Path $projectRoot 'scripts\run-spec005-praxen-behavior-verifier.ps1') -Raw
$modelDeclaration = "[ValidateSet('haiku', 'sonnet', 'opus')][string]" + [char]36 + "Model = 'haiku'"
if (-not $claudeRunner.Contains($modelDeclaration)) { throw 'Praxen runner must default to Claude Haiku.' }
if (-not $claudeRunner.Contains(("{0}, {1}" -f "'--model'", ([char]36 + 'Model')))) { throw 'Praxen runner must pass the selected Claude model explicitly.' }
if (-not $claudeRunner.Contains("'--setting-sources', 'project'")) { throw 'Praxen runner must isolate project settings.' }
if (-not $claudeRunner.Contains("'--no-session-persistence'")) { throw 'Praxen runner must disable Claude session persistence.' }
if (-not $claudeRunner.Contains("'--disallowed-tools', 'Task', 'Agent'")) { throw 'Praxen runner must deny worker-dispatch tools.' }
Write-Output 'Fixed operational lifecycle allowlist, inventory, and process-safety checks passed.'
