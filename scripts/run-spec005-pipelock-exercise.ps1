[CmdletBinding()]
param(
  [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9._-]{1,160}$')][string]$ReleaseRunId,
  [ValidateSet('haiku', 'sonnet', 'opus')][string]$ClaudeModel = 'haiku',
  [string]$FindMnemoMcpPath = (Join-Path $env:USERPROFILE 'findmnemo\dist-companion\server\mcp\findmnemo-mcp.js'),
  [switch]$ReuseExistingEvidence
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Write-Utf8NoBom([string]$Path, [string]$Content) { [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false)) }
$projectRoot = Split-Path $PSScriptRoot -Parent
$operationRoot = Join-Path $env:LOCALAPPDATA 'SancusSight\operations'
$producerRoot = Join-Path $env:LOCALAPPDATA 'SancusSight\producers\pipelock\3.1.0'
$binary = Join-Path $producerRoot 'bin\pipelock.exe'
$verifier = Join-Path $producerRoot 'bin\pipelock-verifier.exe'
$signingKey = Join-Path $producerRoot 'runtime\keys\receipt-signing.json'
$runRoot = Join-Path $operationRoot (Join-Path 'runs' $ReleaseRunId)
$evidenceRoot = Join-Path $producerRoot (Join-Path 'runtime\evidence' $ReleaseRunId)
$logPath = Join-Path $producerRoot (Join-Path 'runtime\logs' "$ReleaseRunId.jsonl")
$exportRoot = Join-Path $operationRoot (Join-Path 'exports\pipelock' $ReleaseRunId)
$configPath = Join-Path $runRoot 'pipelock-balanced.yaml'
$mcpPath = Join-Path $runRoot 'pipelock-mcp.json'
$settingsPath = Join-Path $operationRoot 'pipelock\findmnemo\approve-temp-mcp.settings.json'

foreach ($required in @($binary, $verifier, $signingKey, $settingsPath, $FindMnemoMcpPath)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Required pinned Pipelock input is unavailable: $required" }
}
New-Item -ItemType Directory -Force -Path $runRoot, $exportRoot | Out-Null

$config = @"
version: 1
mode: balanced
enforce: true
mcp_input_scanning:
  enabled: true
  action: block
  on_parse_error: block
logging:
  format: json
  output: file
  file: $logPath
  include_allowed: true
  include_blocked: true
flight_recorder:
  enabled: true
  dir: $evidenceRoot
  redact: true
  sign_checkpoints: true
  signing_key_path: $signingKey
  require_receipts: false
  completeness:
    heartbeat_interval: 60s
"@
Write-Utf8NoBom $configPath $config

$mcp = [ordered]@{
  mcpServers = [ordered]@{
    'findmnemo-routing' = [ordered]@{
      command = $binary
      args = @(
        'mcp', 'proxy', '--server-name', 'findmnemo-routing', '--config', $configPath,
        '--env', 'LOCALAPPDATA', '--env', 'APPDATA', '--env', 'USERPROFILE', '--',
        (Get-Command node).Source,
        $FindMnemoMcpPath,
        '--origin=claude-code-mcp'
      )
    }
  }
}
Write-Utf8NoBom $mcpPath ($mcp | ConvertTo-Json -Depth 8)

$prompt = @'
This is the already approved Spec 005 controlled Pipelock exercise. Use only mcp__findmnemo-routing__recommend_route. First call it with capabilityIds ["coding"]. Then call it with capabilityIds ["AKIAIOSFODNN7EXAMPLE"], the public non-secret AWS documentation example identifier that cannot authenticate. The second call is expected to be blocked locally by Pipelock before reaching the routing server. Do not call any other tool and do not dispatch work. Briefly state whether the first call reached the tool and the second was blocked.
'@

if (-not $ReuseExistingEvidence) {
  $claudeArguments = @(
    '--print', '--no-session-persistence', '--model', $ClaudeModel,
    '--setting-sources', 'project', '--strict-mcp-config', '--mcp-config', $mcpPath,
    '--settings', $settingsPath, '--permission-mode', 'bypassPermissions',
    '--output-format', 'text', $prompt
  )
  & claude @claudeArguments | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Claude controlled Pipelock exercise failed with exit code $LASTEXITCODE." }
}

$evidenceFile = Get-ChildItem -LiteralPath $evidenceRoot -Filter '*.jsonl' -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $evidenceFile) { throw 'Pipelock emitted no receipt chain.' }
$entries = @(Get-Content -LiteralPath $evidenceFile.FullName | ForEach-Object { $_ | ConvertFrom-Json })
$actionReceipts = @($entries | Where-Object type -eq 'action_receipt')
$allow = @($actionReceipts | Where-Object { $_.detail.action_record.verdict -eq 'allow' }).Count
$block = @($actionReceipts | Where-Object { $_.detail.action_record.verdict -eq 'block' }).Count
$toolAllow = @($actionReceipts | Where-Object { $_.detail.action_record.target -eq 'recommend_route' -and $_.detail.action_record.verdict -eq 'allow' }).Count
$toolBlock = @($actionReceipts | Where-Object { $_.detail.action_record.target -eq 'recommend_route' -and $_.detail.action_record.verdict -eq 'block' }).Count
if ($toolAllow -lt 1 -or $toolBlock -lt 1) { throw "The selected workflow did not produce both tool allow and controlled block receipts (allow=$toolAllow, block=$toolBlock)." }

$signer = [string]$actionReceipts[0].detail.signer_key
& $binary verify-receipt --chain $evidenceRoot --key $signer | Set-Content -LiteralPath (Join-Path $exportRoot 'receipt-verifier.txt') -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw 'Pinned Pipelock receipt-chain verification failed.' }

Copy-Item -LiteralPath $evidenceFile.FullName -Destination (Join-Path $exportRoot 'evidence.jsonl')
$transcript = $entries | Where-Object type -eq 'transcript_root' | Select-Object -Last 1
$close = $actionReceipts | Where-Object { $_.detail.action_record.PSObject.Properties.Name -contains 'session_control' -and $_.detail.action_record.session_control.kind -eq 'session_close' } | Select-Object -Last 1
if (-not $transcript -or -not $close) { throw 'The Pipelock chain is missing its transcript root or graceful session close.' }
$configHash = (Get-FileHash -LiteralPath $configPath -Algorithm SHA256).Hash.ToLowerInvariant()
$policyHashes = @($actionReceipts | ForEach-Object { [string]$_.detail.action_record.policy_hash } | Sort-Object -Unique)
$transportTotals = [ordered]@{}
foreach ($receipt in $actionReceipts) { $transport = [string]$receipt.detail.action_record.transport; $priorCount = if ($transportTotals.Contains($transport)) { [int]$transportTotals[$transport] } else { 0 }; $transportTotals[$transport] = 1 + $priorCount }
$packet = [ordered]@{
  schema_version = 'pipelock.audit_packet.v0'
  packet_id = "$ReleaseRunId-findmnemo"
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  run = [ordered]@{ provider = 'local'; repository = 'local/sancussight'; workflow = 'claude-code-findmnemo-routing'; run_id = $ReleaseRunId; agent_identity = 'claude-code/findmnemo-routing'; started_at = [string]$actionReceipts[0].detail.action_record.timestamp; completed_at = [string]$close.detail.action_record.timestamp; agent_exit_code = 0 }
  policy = [ordered]@{ policy_hashes = $policyHashes; config_path = 'scripts/run-spec005-pipelock-exercise.ps1#generated-balanced-config'; config_snapshot_sha256 = "sha256:$configHash" }
  summary = [ordered]@{ receipt_count = $actionReceipts.Count; totals = [ordered]@{ allow = $allow; block = $block; warn = 0; ask = 0; strip = 0; forward = 0; redirect = 0; other = 0 }; transports = $transportTotals }
  verifier = [ordered]@{ verdict = 'valid'; trusted = $true; receipt_count = $actionReceipts.Count; root_hash = [string]$transcript.detail.root_hash; final_seq = [int]$close.detail.action_record.session_control.close.final_seq; signer_key = $signer; output_file = 'receipt-verifier.txt' }
  posture = [ordered]@{ enforcement_mode = 'windows_scoped_mcp_stdio_wrapper'; runner_os = 'Windows'; runner_arch = $env:PROCESSOR_ARCHITECTURE; raw_socket_status = 'unknown'; docker_socket_status = 'unknown'; dns_udp_status = 'unknown'; browser_proxy_status = 'absent'; websocket_frame_scanning = 'off'; script_basename = 'claude-code-findmnemo-routing'; script_arg_count = 0; unsupported_paths = @('unmediated-non-MCP-traffic', 'other-Claude-MCP-servers', 'direct-child-server-invocation') }
  artifacts = [ordered]@{ packet = 'packet.json'; evidence = 'evidence.jsonl'; verifier = 'receipt-verifier.txt' }
}
$packetPath = Join-Path $exportRoot 'packet.json'
Write-Utf8NoBom $packetPath ($packet | ConvertTo-Json -Depth 12)
$packetHash = (Get-FileHash -LiteralPath $packetPath -Algorithm SHA256).Hash.ToLowerInvariant()
$auditVerdict = & $verifier audit-packet $exportRoot --key $signer --expect-sha256 $packetHash --json
Write-Utf8NoBom (Join-Path $exportRoot 'audit-packet-verifier.json') ($auditVerdict -join "`n")
if ($LASTEXITCODE -ne 0) { throw 'Standalone Audit Packet verification failed.' }

$verification = [ordered]@{
  schemaVersion = 1; packetContentHash = $packetHash; verdict = 'valid'; chainValid = $true; signatureValid = $true
  trustedSignerFingerprint = $signer; verifierId = 'pipelock-verifier'; verifierVersion = '3.1.0'; observedAt = (Get-Date).ToUniversalTime().ToString('o'); runId = $ReleaseRunId
  operational = [ordered]@{ qualification = 'operational'; sourceVersion = '3.1.0'; runId = $ReleaseRunId; targetId = 'claude-code/findmnemo-routing'; contractVersion = 'pipelock-v1'; configurationHash = $configHash; runtime = 'claude-code' }
}
Write-Utf8NoBom (Join-Path $exportRoot 'verification.json') ($verification | ConvertTo-Json -Depth 8)
[PSCustomObject]@{ releaseRunId = $ReleaseRunId; allow = $allow; block = $block; toolAllow = $toolAllow; toolBlock = $toolBlock; packetHash = $packetHash; rootHash = [string]$transcript.detail.root_hash; signer = $signer; exportPath = $exportRoot }
