[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
Invoke-SancusSightOperation -Action 'install-user' -SourceId $SourceId
