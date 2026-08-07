[CmdletBinding()]
param([Parameter(Mandatory)][string]$InputPath)
. (Join-Path $PSScriptRoot 'lib\Invoke-SancusSightOperation.ps1')
Invoke-SancusSightOperation -Action 'run-release-gate' -InputPath $InputPath
