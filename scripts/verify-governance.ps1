Set-StrictMode -Version Latest
$projectRoot = Split-Path $PSScriptRoot -Parent
$files = @(
  (Join-Path $projectRoot 'collector\server.ts'),
  (Join-Path $projectRoot 'collector\governance-service.ts'),
  (Join-Path $projectRoot 'collector\governance-store.ts'),
  (Join-Path $projectRoot 'src\domain\governance\export.ts'),
  (Join-Path $projectRoot 'src\lib\governance-client.ts'),
  (Join-Path $projectRoot 'src\lib\use-governance.ts')
)
$forbidden = @('child_process', 'spawn(', 'execFile', 'fork(', 'Start-Process', 'Invoke-Expression', 'Invoke-Command', 'System.Diagnostics.Process')
foreach ($path in $files) {
  $text = Get-Content -LiteralPath $path -Raw
  foreach ($token in $forbidden) {
    if ($text.Contains($token)) { throw "Forbidden process capability '$token' found in $path." }
  }
}
$server = Get-Content -LiteralPath (Join-Path $projectRoot 'collector\server.ts') -Raw
foreach ($route in @('/api/v1/governance/events', '/api/v1/governance/summary', '/api/v1/governance/inventory', 'lineageMatch', '/api/v1/governance/controls', '/api/v1/governance/decisions', '/api/v1/governance/bindings', '/api/v1/governance/export')) {
  if (-not $server.Contains($route)) { throw "Governance route boundary is missing $route." }
}
$client = Get-Content -LiteralPath (Join-Path $projectRoot 'src\lib\governance-client.ts') -Raw
if ($client -match 'https?://') { throw 'Governance client contains an external URL.' }
$export = Get-Content -LiteralPath (Join-Path $projectRoot 'src\domain\governance\export.ts') -Raw
foreach ($key in @('prompt', 'response', 'chainOfThought', 'privateKey', 'commandOutput', 'workspaceContent', 'toolArguments')) {
  if (-not $export.Contains($key)) { throw "Export privacy denylist is missing $key." }
}
Write-Output 'Governance route, process, external-request, and export privacy scans passed.'
