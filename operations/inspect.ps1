[CmdletBinding()]
param([ValidateSet('agent-beacon', 'runtime-telemetry', 'praxen', 'pipelock', 'rampart', 'aimap')][string]$SourceId)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
if ($SourceId) { Invoke-SancusSightOperation -Action 'inspect' -SourceId $SourceId } else { Invoke-SancusSightOperation -Action 'inspect' }
