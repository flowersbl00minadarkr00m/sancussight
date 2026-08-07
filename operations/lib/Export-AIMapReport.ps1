[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$AuthorizationPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$scan = Get-Content -LiteralPath $InputPath -Raw | ConvertFrom-Json
$authorization = Get-Content -LiteralPath $AuthorizationPath -Raw | ConvertFrom-Json
if ($scan.status -ne 'completed' -or $scan.authorizationId -ne $authorization.authorizationId -or $scan.runId -ne $authorization.releaseRunId) { throw 'AIMap scan is incomplete or does not match the authorization manifest.' }
if ($scan.target.host -ne $authorization.target.host -or [int]$scan.target.port -ne [int]$authorization.target.port -or $scan.target.protocol -ne $authorization.target.protocol) { throw 'AIMap target is outside the authorization manifest.' }
$prohibited = @('systemPrompt', 'toolSchemas', 'toolParameters', 'responseBody', 'curl', 'rawNuclei', 'geolocation', 'payload', 'exploitationOutput')
foreach ($field in $prohibited) { if ($null -ne $scan.PSObject.Properties[$field]) { throw "AIMap export contains a prohibited field: $field" } }

$findings = @()
foreach ($finding in @($scan.findings)) {
  $findings += [ordered]@{
    findingId = [string]$finding.findingId
    endpointId = [string]$finding.endpointId
    hostname = [string]$finding.hostname
    port = [int]$finding.port
    protocol = [string]$finding.protocol
    authStatus = [string]$finding.authStatus
    riskScore = if ($null -ne $finding.riskScore) { [double]$finding.riskScore } else { $null }
    riskFactors = if ($null -ne $finding.riskFactors) { @($finding.riskFactors | ForEach-Object { [string]$_ }) } else { $null }
    template = [string]$finding.template
    severity = [string]$finding.severity
    title = ([string]$finding.title).Substring(0, [Math]::Min(320, ([string]$finding.title).Length))
  }
}
if ($scan.operational.qualification -ne 'operational' -or $scan.operational.runId -ne $scan.runId -or $scan.operational.targetId -ne 'loopback-ollama-11434' -or $scan.operational.contractVersion -ne 'aimap-v1') { throw 'AIMap scan lacks matching operational qualification metadata.' }
$operational = [ordered]@{ qualification = 'operational'; sourceVersion = [string]$scan.operational.sourceVersion; runId = [string]$scan.operational.runId; targetId = [string]$scan.operational.targetId; contractVersion = 'aimap-v1' }
$output = [ordered]@{ schemaVersion = 1; sourceVersion = [string]$scan.sourceVersion; scanId = [string]$scan.scanId; authorizationId = [string]$scan.authorizationId; runId = [string]$scan.runId; status = 'completed'; target = $authorization.target; completedAt = [string]$scan.completedAt; operational = $operational; findings = $findings }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null
$json = $output | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($OutputPath, $json, (New-Object Text.UTF8Encoding($false)))
