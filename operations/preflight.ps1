[CmdletBinding()]
param([ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId, [switch]$DryRun)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
if ($SourceId) { Invoke-SancusSightOperation -Action 'preflight' -SourceId $SourceId -DryRun:$DryRun } else { Invoke-SancusSightOperation -Action 'preflight' -DryRun:$DryRun }
