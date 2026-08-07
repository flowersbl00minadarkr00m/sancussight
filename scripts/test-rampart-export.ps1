Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$fixture = Join-Path $projectRoot 'operations\rampart-tests\fixtures\official-report.json'
$output = Join-Path ([System.IO.Path]::GetTempPath()) "sancussight-rampart-export-$([guid]::NewGuid().ToString('N')).json"
try {
  & (Join-Path $projectRoot 'operations\lib\Export-RampartReport.ps1') `
    -InputPath $fixture `
    -OutputPath $output `
    -SourceVersion '0.1.0' `
    -RunId 'spec005-rampart-export-test' `
    -TargetId 'collector-local' `
    -SuiteVersion 'spec005-t9-v1' `
    -EvaluatorVersion 'deterministic-v1' `
    -ConfigurationHash ('a' * 64)
  $text = Get-Content -LiteralPath $output -Raw
  $bytes = [IO.File]::ReadAllBytes($output)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf) { throw 'Sanitized RAMPART JSON must be UTF-8 without a BOM.' }
  $report = $text | ConvertFrom-Json
  if ($report.results.Count -ne 4) { throw 'Official RAMPART results were not projected completely.' }
  $statuses = @($report.results | ForEach-Object { $_.status } | Sort-Object -Unique)
  if (($statuses -join ',') -ne 'error,safe,undetermined,unsafe') { throw 'All four RAMPART status classes must be preserved.' }
  if ($report.operational.qualification -ne 'operational' -or $report.operational.configurationHash -ne ('a' * 64)) { throw 'RAMPART operational provenance is missing.' }
  foreach ($token in @('private prompt', 'private response', 'private-tool', 'arguments', 'turns')) {
    if ($text.Contains($token)) { throw "Sanitized RAMPART export retained prohibited token: $token" }
  }
  Write-Output 'Official RAMPART JSON sink sanitizer checks passed.'
} finally {
  Remove-Item -LiteralPath $output -Force -ErrorAction SilentlyContinue
}
