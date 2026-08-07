[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId, [bool]$PreserveEvidence = $true)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
Invoke-SancusSightOperation -Action 'rollback' -SourceId $SourceId -PreserveEvidence $PreserveEvidence
