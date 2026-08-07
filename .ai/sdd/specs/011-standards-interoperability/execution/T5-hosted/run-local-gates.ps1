$ErrorActionPreference = 'Continue'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..\..\..\..')).Path
$logPath = Join-Path $PSScriptRoot 'local-gates.log'
[System.IO.File]::WriteAllText($logPath, '', [System.Text.UTF8Encoding]::new($false))

function Invoke-Gate {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ExactCommand,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  $startedAt = [DateTimeOffset]::UtcNow.ToString('o')
  "COMMAND: $ExactCommand`nSTARTED: $startedAt" |
    Out-File -LiteralPath $logPath -Encoding utf8 -Append
  & $Action 2>&1 |
    Tee-Object -FilePath $logPath -Append
  $exitCode = $LASTEXITCODE
  $finishedAt = [DateTimeOffset]::UtcNow.ToString('o')
  "EXIT_CODE: $exitCode`nFINISHED: $finishedAt`n" |
    Out-File -LiteralPath $logPath -Encoding utf8 -Append
  if ($exitCode -ne 0) {
    throw "Required gate failed: $ExactCommand (exit $exitCode)"
  }
}

Push-Location $projectRoot
try {
  Invoke-Gate 'npm run test:feature011' { & npm.cmd run test:feature011 }
  Invoke-Gate 'npm run test:feature010' { & npm.cmd run test:feature010 }
  Invoke-Gate 'npm run test:feature009' { & npm.cmd run test:feature009 }
  Invoke-Gate 'npm run test:feature008' { & npm.cmd run test:feature008 }
  Invoke-Gate 'npm run test:collector' { & npm.cmd run test:collector }
  Invoke-Gate 'npm run test:registry-compiler' { & npm.cmd run test:registry-compiler }
  Invoke-Gate 'npm run verify:core' { & npm.cmd run verify:core }
  Invoke-Gate 'npm run build' { & npm.cmd run build }
  Invoke-Gate 'git diff --check' { & git diff --check }
} finally {
  Pop-Location
}

Write-Output 'LOCAL GATE SEQUENCE PASS'
