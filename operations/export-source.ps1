[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId, [Parameter(Mandatory)][string]$InputPath)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
Invoke-SancusSightOperation -Action 'export-source' -SourceId $SourceId -InputPath $InputPath
