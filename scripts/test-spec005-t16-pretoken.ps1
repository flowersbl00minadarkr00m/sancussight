[CmdletBinding()]
param([switch]$ParseOnly)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$launcher = Join-Path $PSScriptRoot 'invoke-spec005-t16-pretoken.ps1'
if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
  throw 'The T16 pre-token launcher is missing.'
}

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

function Assert-Equal([object]$Actual, [object]$Expected, [string]$Message) {
  if ([string]$Actual -ne [string]$Expected) {
    throw "$Message Expected '$Expected', got '$Actual'."
  }
}

function Invoke-ExpectedFailure([scriptblock]$Action, [string]$ExpectedCode) {
  try {
    & $Action | Out-Null
    throw "Expected failure '$ExpectedCode' did not occur."
  }
  catch {
    if (-not $_.Exception.Message.Contains($ExpectedCode)) {
      throw "Expected failure '$ExpectedCode', got '$($_.Exception.Message)'."
    }
  }
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $parent = Split-Path $Path -Parent
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function Invoke-WindowsPowerShellParseSweep {
  $parseErrors = @()
  $parseTargets = @(
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'scripts') -Filter '*.ps1' -File
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'operations') -Filter '*.ps1' -Recurse -File
  )
  foreach ($file in $parseTargets) {
    $tokens = $null
    $errors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$errors)
    foreach ($error in @($errors)) {
      $parseErrors += "$($file.FullName):$($error.Extent.StartLineNumber):$($error.ErrorId)"
    }
  }
  Assert-True ($parseErrors.Count -eq 0) ('Windows PowerShell parse sweep failed: ' + ($parseErrors -join '; '))
  Write-Output "Windows PowerShell 5.1 parse sweep passed: $($parseTargets.Count) files, 0 errors."
}

function New-FakeProviderSet([string]$Directory) {
  New-Item -ItemType Directory -Force -Path $Directory | Out-Null
  $source = @'
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;

public static class FakeProviderProgram {
  private static void AppendCounter() {
    var path = Environment.GetEnvironmentVariable("SANCUSSIGHT_PRETOKEN_FIXTURE_COUNTER");
    if (!String.IsNullOrEmpty(path)) File.AppendAllText(path, "1\n", new UTF8Encoding(false));
  }

  private static void WriteLog(string[] args, string stdin) {
    var path = Environment.GetEnvironmentVariable("SANCUSSIGHT_PRETOKEN_FIXTURE_LOG");
    if (String.IsNullOrEmpty(path)) return;
    var lines = new List<string> {
      "cwd=" + Environment.CurrentDirectory,
      "target=" + Environment.GetEnvironmentVariable("SANCUSSIGHT_RUNTIME_TARGET_ID"),
      "stdinLength=" + stdin.Length
    };
    for (var index = 0; index < args.Length; index++) lines.Add("arg" + index + "=" + args[index]);
    File.WriteAllLines(path, lines.ToArray(), new UTF8Encoding(false));
  }

  public static int Main(string[] args) {
    AppendCounter();
    var stdin = Console.In.ReadToEnd();
    WriteLog(args, stdin);
    var behavior = Environment.GetEnvironmentVariable("SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR") ?? "success";
    var marker = Environment.GetEnvironmentVariable("SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER") ?? "ACCESS_OK";
    if (behavior == "timeout") { Thread.Sleep(5000); return 0; }
    if (behavior == "auth") { Console.Out.Write("Authentication required"); return 0; }
    if (behavior == "auth-marker") { Console.Out.Write(marker); Console.Error.Write("Authorization required"); return 0; }
    if (behavior == "stdout-overflow") { Console.Out.Write(new String('X', 4096)); return 0; }
    if (behavior == "stderr-overflow") { Console.Error.Write(new String('E', 4096)); Console.Out.Write(marker); return 0; }
    if (behavior == "bom") { Console.OpenStandardOutput().Write(new byte[] { 0xEF, 0xBB, 0xBF }, 0, 3); Console.Out.Write(marker); return 0; }
    if (behavior == "punctuation") { Console.Out.Write(marker + "."); return 0; }
    if (behavior == "prose") { Console.Out.Write("Result: " + marker); return 0; }
    if (behavior == "fence") { Console.Out.Write("```" + marker + "```"); return 0; }
    if (behavior == "case") { Console.Out.Write(marker.ToLowerInvariant()); return 0; }
    if (behavior == "unicode-outer") { Console.Out.Write("\u00A0" + marker + "\u00A0"); return 0; }
    if (behavior == "exit") { Console.Out.Write(marker); return 7; }
    if (behavior == "cr") { Console.Out.Write("\r\t " + marker + " \r"); return 0; }
    if (behavior == "ascii-outer") { Console.Out.Write(" \t\n" + marker + "\n\t "); return 0; }
    Console.Out.Write(marker + "\r\n");
    return 0;
  }
}
'@
  $assembly = Join-Path $Directory 'fake-provider.exe'
  Add-Type -TypeDefinition $source -OutputAssembly $assembly -OutputType ConsoleApplication
  Copy-Item -LiteralPath $assembly -Destination (Join-Path $Directory 'claude.exe')
  Copy-Item -LiteralPath $assembly -Destination (Join-Path $Directory 'codex.exe')
  Remove-Item -LiteralPath $assembly

  $piScript = @'
$counter = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_COUNTER
if ($counter) { [IO.File]::AppendAllText($counter, "1`n", [Text.UTF8Encoding]::new($false)) }
$stdinText = ($input | Out-String)
$log = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_LOG
if ($log) {
  $lines = @(
    "cwd=$([Environment]::CurrentDirectory)",
    "target=$env:SANCUSSIGHT_RUNTIME_TARGET_ID",
    "stdinLength=$($stdinText.Length)"
  )
  for ($index = 0; $index -lt $args.Count; $index++) { $lines += "arg$index=$($args[$index])" }
  [IO.File]::WriteAllLines($log, $lines, [Text.UTF8Encoding]::new($false))
}
$behavior = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR
$marker = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER
if (-not $marker) { $marker = 'PI_ACCESS_OK' }
switch ($behavior) {
  'timeout' { Start-Sleep -Seconds 5; exit 0 }
  'auth' { [Console]::Out.Write('Authorization required'); exit 0 }
  'auth-marker' { [Console]::Out.Write($marker); [Console]::Error.Write('Authentication required'); exit 0 }
  'stdout-overflow' { [Console]::Out.Write(('X' * 4096)); exit 0 }
  'stderr-overflow' { [Console]::Error.Write(('E' * 4096)); [Console]::Out.Write($marker); exit 0 }
  'bom' {
    $bytes = [byte[]](0xEF, 0xBB, 0xBF)
    [Console]::OpenStandardOutput().Write($bytes, 0, $bytes.Length)
    [Console]::Out.Write($marker)
    exit 0
  }
  'punctuation' { [Console]::Out.Write($marker + '.'); exit 0 }
  'prose' { [Console]::Out.Write('Result: ' + $marker); exit 0 }
  'fence' { [Console]::Out.Write('```' + $marker + '```'); exit 0 }
  'case' { [Console]::Out.Write($marker.ToLowerInvariant()); exit 0 }
  'unicode-outer' { [Console]::Out.Write(([char]0x00A0) + $marker + ([char]0x00A0)); exit 0 }
  'exit' { [Console]::Out.Write($marker); exit 7 }
  'cr' { [Console]::Out.Write("`r`t $marker `r"); exit 0 }
  'ascii-outer' { [Console]::Out.Write(" `t`n$marker`n`t "); exit 0 }
  default { [Console]::Out.Write($marker + "`r`n"); exit 0 }
}
'@
  Write-Utf8NoBom -Path (Join-Path $Directory 'pi.ps1') -Content $piScript
}

if ($ParseOnly) {
  Invoke-WindowsPowerShellParseSweep
  return
}

$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('sancussight-t16r3-pretoken-' + [guid]::NewGuid().ToString('N'))
$fixtureDirectory = Join-Path $testRoot 'provider fixtures with spaces'
$nonProjectWorkingDirectory = Join-Path $testRoot 'non-project-cwd'
$counterPath = Join-Path $testRoot 'invocations.txt'
$logPath = Join-Path $testRoot 'provider-log.txt'
$priorBehavior = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR
$priorMarker = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER
$priorCounter = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_COUNTER
$priorLog = $env:SANCUSSIGHT_PRETOKEN_FIXTURE_LOG

try {
  New-Item -ItemType Directory -Force -Path $testRoot, $nonProjectWorkingDirectory | Out-Null
  New-FakeProviderSet -Directory $fixtureDirectory
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_COUNTER = $counterPath
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_LOG = $logPath

  $plans = @(& $launcher -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory -PlanOnly)
  Assert-Equal $plans.Count 3 'Plan-only must resolve all three providers.'
  Assert-True (-not (Test-Path -LiteralPath $counterPath)) 'Plan-only invoked a fake provider.'
  Assert-True (@($plans | Where-Object willInvoke).Count -eq 0) 'Plan-only reported an invocation.'
  $expectedVectors = @{
    claude = @('--print', '--no-session-persistence', '--model', 'haiku', '--effort', 'low', '--tools', '', '--permission-mode', 'plan', '--disable-slash-commands', '--output-format', 'text', 'Reply exactly CLAUDE_ACCESS_OK.')
    codex = @('exec', '--ephemeral', '--sandbox', 'read-only', '--skip-git-repo-check', '--color', 'never', 'Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools.')
    pi = @('--print', '--no-session', '--no-tools', '--no-extensions', '--no-skills', '--no-prompt-templates', '--no-context-files', '--no-approve', '--thinking', 'off', 'Respond with only the exact token PI_ACCESS_OK and nothing else')
  }
  foreach ($providerName in @('claude', 'codex', 'pi')) {
    $plan = @($plans | Where-Object provider -eq $providerName)[0]
    Assert-Equal (@($plan.fixedArguments) -join [char]31) (@($expectedVectors[$providerName]) -join [char]31) "$providerName fixed argument vector drifted."
    $expectedHostMode = if ($providerName -eq 'pi') { 'File' } else { 'Command' }
    Assert-Equal $plan.hostMode $expectedHostMode "$providerName PowerShell host mode drifted."
  }

  Push-Location -LiteralPath $nonProjectWorkingDirectory
  try {
    $omittedRootPlans = @(
      & $launcher -FixtureMode -FixtureCommandDirectory $fixtureDirectory -PlanOnly
    )
  }
  finally {
    Pop-Location
  }
  Assert-Equal $omittedRootPlans.Count 3 'Omitted-root plan must resolve all three providers.'
  Assert-True (-not (Test-Path -LiteralPath $counterPath)) 'Omitted-root plan invoked a fake provider.'
  foreach ($plan in $omittedRootPlans) {
    Assert-Equal $plan.childWorkingDirectory ([IO.Path]::GetFullPath($projectRoot)) 'Omitted ProjectRoot did not select the canonical script-derived project root.'
  }

  foreach ($providerName in @('claude', 'codex', 'pi')) {
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = 'success'
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = if ($providerName -eq 'claude') { 'CLAUDE_ACCESS_OK' } elseif ($providerName -eq 'codex') { 'CODEX_ACCESS_OK' } else { 'PI_ACCESS_OK' }
    $result = & $launcher -Provider $providerName -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory
    Assert-True $result.qualified "$providerName fake provider did not qualify."
    Assert-True $result.stdinClosed "$providerName did not report closed stdin."
    Assert-Equal $result.runtimeTargetId 'sancussight-local-runtimes' "$providerName runtime target drifted."
    Assert-Equal $result.childWorkingDirectory ([IO.Path]::GetFullPath($projectRoot)) "$providerName child cwd drifted."
    $log = @(Get-Content -LiteralPath $logPath)
    Assert-True ($log -contains 'stdinLength=0') "$providerName stdin was not closed."
    Assert-True ($log -contains ('cwd=' + [IO.Path]::GetFullPath($projectRoot))) "$providerName fake did not observe canonical cwd."
    Assert-True ($log -contains 'target=sancussight-local-runtimes') "$providerName fake did not observe the runtime target."
  }
  Assert-Equal @(Get-Content -LiteralPath $counterPath).Count 3 'Fixture invocation count drifted.'

  $successPropertyNames = @($result.PSObject.Properties.Name)
  foreach ($forbiddenProperty in @('stdout', 'stderr', 'body', 'prompt', 'response', 'arguments', 'resolvedPath')) {
    Assert-True ($successPropertyNames -notcontains $forbiddenProperty) "Result retained forbidden property '$forbiddenProperty'."
  }

  foreach ($acceptedBehavior in @('success', 'cr', 'ascii-outer')) {
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = $acceptedBehavior
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = 'CLAUDE_ACCESS_OK'
    $accepted = & $launcher -Provider claude -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory
    Assert-True $accepted.markerMatched "Marker behavior '$acceptedBehavior' should qualify."
  }

  foreach ($rejectedBehavior in @('punctuation', 'prose', 'fence', 'case', 'unicode-outer', 'bom', 'auth', 'auth-marker', 'exit')) {
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = $rejectedBehavior
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = 'CLAUDE_ACCESS_OK'
    Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_PROVIDER_REJECTED' -Action {
      & $launcher -Provider claude -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory
    }
  }

  foreach ($overflowBehavior in @('stdout-overflow', 'stderr-overflow')) {
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = $overflowBehavior
    $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = 'CODEX_ACCESS_OK'
    Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_PROVIDER_REJECTED' -Action {
      & $launcher -Provider codex -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory -MaxStreamBytes 256
    }
  }

  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = 'timeout'
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = 'PI_ACCESS_OK'
  $timeoutStopwatch = [Diagnostics.Stopwatch]::StartNew()
  Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_PROVIDER_REJECTED' -Action {
    & $launcher -Provider pi -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $fixtureDirectory -TimeoutSeconds 1
  }
  $timeoutStopwatch.Stop()
  Assert-True ($timeoutStopwatch.Elapsed.TotalSeconds -lt 4) 'Timeout did not terminate the exact fake-provider process tree promptly.'

  $ambiguousDirectory = Join-Path $testRoot 'ambiguous'
  New-Item -ItemType Directory -Force -Path $ambiguousDirectory | Out-Null
  Copy-Item -LiteralPath (Join-Path $fixtureDirectory 'codex.exe') -Destination (Join-Path $ambiguousDirectory 'codex.exe')
  Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_COMMAND_AMBIGUOUS' -Action {
    & $launcher -Provider codex -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory @($fixtureDirectory, $ambiguousDirectory) -PlanOnly
  }

  $unsupportedDirectory = Join-Path $testRoot 'unsupported'
  New-Item -ItemType Directory -Force -Path $unsupportedDirectory | Out-Null
  Write-Utf8NoBom -Path (Join-Path $unsupportedDirectory 'claude.cmd') -Content '@echo off'
  Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_COMMAND_TYPE_UNSUPPORTED' -Action {
    & $launcher -Provider claude -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $unsupportedDirectory -PlanOnly
  }

  $missingDirectory = Join-Path $testRoot 'missing'
  New-Item -ItemType Directory -Force -Path $missingDirectory | Out-Null
  Invoke-ExpectedFailure -ExpectedCode 'PRETOKEN_COMMAND_UNRESOLVED' -Action {
    & $launcher -Provider pi -ProjectRoot $projectRoot -FixtureMode -FixtureCommandDirectory $missingDirectory -PlanOnly
  }

  Invoke-WindowsPowerShellParseSweep | Out-Null

  Write-Output 'T16R3 pre-token fake-provider, omitted-root/non-project-cwd, privacy, timeout, bounds, marker, resolution, vector, stdin, and PowerShell parse checks passed.'
}
finally {
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_BEHAVIOR = $priorBehavior
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_MARKER = $priorMarker
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_COUNTER = $priorCounter
  $env:SANCUSSIGHT_PRETOKEN_FIXTURE_LOG = $priorLog
  if (Test-Path -LiteralPath $testRoot) {
    Remove-Item -LiteralPath $testRoot -Recurse -Force
  }
}
