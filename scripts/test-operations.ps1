Set-StrictMode -Version Latest
$projectRoot = Split-Path $PSScriptRoot -Parent
. (Join-Path $projectRoot 'operations\lib\Invoke-SancusSightOperation.ps1')

$preflight = Invoke-SancusSightOperation -Action 'preflight' -DryRun
if ($preflight.result -ne 'passed') { throw 'Preflight must pass after every producer version is pinned.' }

$inventory = ConvertFrom-Json -InputObject (Get-Content -LiteralPath (Join-Path $projectRoot 'operations\manifests\producer-inventory.v1.json') -Raw)
$expectedPins = @{
  pipelock = '3.1.0'
  rampart = '0.1.0'
  aimap = '65c820cbdad3da449f49aedb70055ca5ed4fa0ce'
}
foreach ($entry in $expectedPins.GetEnumerator()) {
  $source = $inventory.sources | Where-Object { $_.id -eq $entry.Key }
  if (@($source.supportedVersions).Count -ne 1 -or $source.supportedVersions[0] -ne $entry.Value) {
    throw "Producer $($entry.Key) must remain pinned to $($entry.Value)."
  }
}
if (($inventory.sources | Where-Object { $_.id -eq 'aimap' }).officialUrl -ne 'https://github.com/BishopFox/aimap') {
  throw 'AIMap must resolve to the approved Bishop Fox upstream repository.'
}
$install = Invoke-SancusSightOperation -Action 'install-user' -SourceId 'agent-beacon'
if ($install.result -ne 'planned') { throw 'Install handoff did not remain planned.' }
$telemetryInstall = Invoke-SancusSightOperation -Action 'install-user' -SourceId 'runtime-telemetry'
if ($telemetryInstall.result -ne 'planned') { throw 'Runtime telemetry install handoff did not remain planned.' }
$telemetryFailure = Invoke-SancusSightOperation -Action 'exercise-failures' -SourceId 'runtime-telemetry' -FailureCase 'pi-extension-disabled'
if ($telemetryFailure.result -ne 'planned') { throw 'Runtime telemetry failure handoff did not remain planned.' }
$exercise = Invoke-SancusSightOperation -Action 'exercise-failures' -SourceId 'pipelock' -FailureCase 'invalid-pipelock-signature'
if ($exercise.result -ne 'planned') { throw 'Failure exercise did not remain planned.' }
$rollback = Invoke-SancusSightOperation -Action 'rollback' -SourceId 'pipelock'
if ($rollback.result -ne 'planned' -or $rollback.limits.Count -eq 0) { throw 'Rollback handoff did not preserve bounded limits.' }
$uninstall = Invoke-SancusSightOperation -Action 'uninstall-user' -SourceId 'pipelock'
if ($uninstall.result -ne 'planned') { throw 'Uninstall handoff did not remain planned.' }
$inspection = Invoke-SancusSightOperation -Action 'inspect'
if ($inspection.result -ne 'passed') { throw 'Inspection did not validate retained run records.' }
Write-Output 'Fixed lifecycle preflight, handoff, failure, rollback, removal, and inspection checks passed.'
