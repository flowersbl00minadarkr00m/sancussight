[CmdletBinding()]
param(
  [ValidateSet('claude', 'codex', 'pi')]
  [string[]]$Provider = @('claude', 'codex', 'pi'),
  [string]$ProjectRoot,
  [ValidatePattern('^[A-Za-z0-9._-]{1,160}$')]
  [string]$RuntimeTargetId = 'sancussight-local-runtimes',
  [ValidateRange(1, 300)]
  [int]$TimeoutSeconds = 60,
  [ValidateRange(256, 1048576)]
  [int]$MaxStreamBytes = 8192,
  [switch]$PlanOnly,
  [switch]$FixtureMode,
  [string[]]$FixtureCommandDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
  if ([string]::IsNullOrWhiteSpace($PSCommandPath)) {
    throw 'PRETOKEN_SCRIPT_PATH_UNAVAILABLE'
  }
  $scriptDirectory = [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($PSCommandPath))
  $ProjectRoot = [IO.Path]::GetDirectoryName($scriptDirectory)
}
$canonicalProjectRoot = [IO.Path]::GetFullPath($ProjectRoot)
if (-not (Test-Path -LiteralPath $canonicalProjectRoot -PathType Container)) {
  throw 'PRETOKEN_PROJECT_ROOT_MISSING'
}
if ($FixtureMode -and (-not $FixtureCommandDirectory -or $FixtureCommandDirectory.Count -eq 0)) {
  throw 'PRETOKEN_FIXTURE_DIRECTORY_REQUIRED'
}
if (-not $FixtureMode -and $FixtureCommandDirectory) {
  throw 'PRETOKEN_FIXTURE_DIRECTORY_FORBIDDEN'
}

$providerContracts = @{
  claude = [ordered]@{
    extension = '.exe'
    commandType = 'Application'
    hostMode = 'Command'
    marker = 'CLAUDE_ACCESS_OK'
    arguments = @(
      '--print',
      '--no-session-persistence',
      '--model',
      'haiku',
      '--effort',
      'low',
      '--tools',
      '',
      '--permission-mode',
      'plan',
      '--disable-slash-commands',
      '--output-format',
      'text',
      'Reply exactly CLAUDE_ACCESS_OK.'
    )
  }
  codex = [ordered]@{
    extension = '.exe'
    commandType = 'Application'
    hostMode = 'Command'
    marker = 'CODEX_ACCESS_OK'
    arguments = @(
      'exec',
      '--ephemeral',
      '--sandbox',
      'read-only',
      '--skip-git-repo-check',
      '--color',
      'never',
      'Reply exactly CODEX_ACCESS_OK. Do not inspect files or use tools.'
    )
  }
  pi = [ordered]@{
    extension = '.ps1'
    commandType = 'ExternalScript'
    hostMode = 'File'
    marker = 'PI_ACCESS_OK'
    arguments = @(
      '--print',
      '--no-session',
      '--no-tools',
      '--no-extensions',
      '--no-skills',
      '--no-prompt-templates',
      '--no-context-files',
      '--no-approve',
      '--thinking',
      'off',
      'Respond with only the exact token PI_ACCESS_OK and nothing else'
    )
  }
}

function ConvertTo-SingleQuotedPowerShellLiteral([string]$Value) {
  return "'" + $Value.Replace("'", "''") + "'"
}

function ConvertTo-WindowsCommandLineArgument([string]$Value) {
  if ($Value.Length -gt 0 -and $Value -notmatch '[\s"]') {
    return $Value
  }

  $builder = New-Object Text.StringBuilder
  [void]$builder.Append('"')
  $backslashCount = 0
  foreach ($character in $Value.ToCharArray()) {
    if ($character -eq '\') {
      $backslashCount++
      continue
    }
    if ($character -eq '"') {
      [void]$builder.Append(('\' * (($backslashCount * 2) + 1)))
      [void]$builder.Append('"')
      $backslashCount = 0
      continue
    }
    if ($backslashCount -gt 0) {
      [void]$builder.Append(('\' * $backslashCount))
      $backslashCount = 0
    }
    [void]$builder.Append($character)
  }
  if ($backslashCount -gt 0) {
    [void]$builder.Append(('\' * ($backslashCount * 2)))
  }
  [void]$builder.Append('"')
  return $builder.ToString()
}

function Test-PathInside([string]$Path, [string]$Parent) {
  $fullPath = [IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
  $fullParent = [IO.Path]::GetFullPath($Parent).TrimEnd('\', '/')
  return $fullPath.Equals($fullParent, [StringComparison]::OrdinalIgnoreCase) -or
    $fullPath.StartsWith($fullParent + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
}

function Resolve-ProviderCommand([string]$ProviderName) {
  $contract = $providerContracts[$ProviderName]
  $records = @(Get-Command -Name $ProviderName -All -ErrorAction SilentlyContinue)
  if ($records.Count -eq 0) {
    throw "PRETOKEN_COMMAND_UNRESOLVED provider=$ProviderName"
  }

  $accepted = @($records | Where-Object {
    $_.CommandType.ToString() -eq $contract.commandType -and
    $_.Path -and
    [IO.Path]::GetExtension([string]$_.Path).Equals($contract.extension, [StringComparison]::OrdinalIgnoreCase)
  })
  if ($accepted.Count -eq 0) {
    throw "PRETOKEN_COMMAND_TYPE_UNSUPPORTED provider=$ProviderName"
  }
  if ($accepted.Count -ne 1) {
    throw "PRETOKEN_COMMAND_AMBIGUOUS provider=$ProviderName count=$($accepted.Count)"
  }

  $record = $accepted[0]
  $recordPath = [IO.Path]::GetFullPath([string]$record.Path)
  $recordSource = if ($record.Source) { [IO.Path]::GetFullPath([string]$record.Source) } else { $null }
  if (-not $recordSource -or
      -not $recordPath.Equals($recordSource, [StringComparison]::OrdinalIgnoreCase) -or
      -not (Test-Path -LiteralPath $recordPath -PathType Leaf)) {
    throw "PRETOKEN_COMMAND_RECORD_INVALID provider=$ProviderName"
  }

  if ($FixtureMode) {
    $insideFixtureDirectory = $false
    foreach ($directory in $FixtureCommandDirectory) {
      if (Test-PathInside -Path $recordPath -Parent $directory) {
        $insideFixtureDirectory = $true
        break
      }
    }
    if (-not $insideFixtureDirectory) {
      throw "PRETOKEN_FIXTURE_PATH_ESCAPE provider=$ProviderName"
    }
  }

  return [PSCustomObject]@{
    Provider = $ProviderName
    Path = $recordPath
    CommandType = $record.CommandType.ToString()
    Extension = [IO.Path]::GetExtension($recordPath).ToLowerInvariant()
    PathSha256 = (Get-FileHash -LiteralPath $recordPath -Algorithm SHA256).Hash.ToLowerInvariant()
  }
}

if (-not ('SancusSight.BoundedProcessRunner' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace SancusSight {
  public sealed class BoundedProcessFacts {
    public bool TimedOut { get; set; }
    public int ExitCode { get; set; }
    public long StdoutBytes { get; set; }
    public long StderrBytes { get; set; }
    public bool StdoutOverflow { get; set; }
    public bool StderrOverflow { get; set; }
    public bool EncodingValid { get; set; }
    public bool LeadingBom { get; set; }
    public bool AuthDetected { get; set; }
    public bool MarkerMatched { get; set; }
  }

  public static class BoundedProcessRunner {
    private sealed class Capture {
      public readonly MemoryStream Retained = new MemoryStream();
      public long Length;
      public bool Overflow;
    }

    private static void ReadBounded(Stream stream, int maximumBytes, Capture capture) {
      var buffer = new byte[1024];
      int read;
      while ((read = stream.Read(buffer, 0, buffer.Length)) > 0) {
        capture.Length += read;
        var remaining = maximumBytes - (int)capture.Retained.Length;
        if (remaining > 0) {
          capture.Retained.Write(buffer, 0, Math.Min(read, remaining));
        }
        if (capture.Length > maximumBytes) capture.Overflow = true;
      }
    }

    private static string Decode(Capture capture, UTF8Encoding encoding, ref bool valid) {
      try {
        return encoding.GetString(capture.Retained.ToArray());
      } catch (DecoderFallbackException) {
        valid = false;
        return String.Empty;
      }
    }

    private static void KillProcessTree(Process process) {
      try {
        var taskKillInfo = new ProcessStartInfo {
          FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "taskkill.exe"),
          Arguments = "/PID " + process.Id + " /T /F",
          UseShellExecute = false,
          RedirectStandardOutput = true,
          RedirectStandardError = true,
          CreateNoWindow = true
        };
        using (var taskKill = new Process { StartInfo = taskKillInfo }) {
          if (taskKill.Start()) {
            taskKill.StandardOutput.ReadToEndAsync();
            taskKill.StandardError.ReadToEndAsync();
            if (!taskKill.WaitForExit(5000)) {
              try { taskKill.Kill(); } catch { }
            }
          }
        }
      } catch { }
      if (!process.HasExited) {
        try { process.Kill(); } catch { }
      }
    }

    public static BoundedProcessFacts Run(
      string fileName,
      string arguments,
      string workingDirectory,
      string runtimeTargetId,
      int timeoutMilliseconds,
      int maximumStreamBytes,
      string expectedMarker
    ) {
      var startInfo = new ProcessStartInfo {
        FileName = fileName,
        Arguments = arguments,
        WorkingDirectory = workingDirectory,
        UseShellExecute = false,
        RedirectStandardInput = true,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true
      };
      startInfo.EnvironmentVariables["SANCUSSIGHT_RUNTIME_TARGET_ID"] = runtimeTargetId;

      using (var process = new Process { StartInfo = startInfo }) {
        if (!process.Start()) throw new InvalidOperationException("Process start returned false.");
        process.StandardInput.Close();

        var stdout = new Capture();
        var stderr = new Capture();
        var stdoutTask = Task.Factory.StartNew(
          () => ReadBounded(process.StandardOutput.BaseStream, maximumStreamBytes, stdout),
          TaskCreationOptions.LongRunning
        );
        var stderrTask = Task.Factory.StartNew(
          () => ReadBounded(process.StandardError.BaseStream, maximumStreamBytes, stderr),
          TaskCreationOptions.LongRunning
        );

        var timedOut = !process.WaitForExit(timeoutMilliseconds);
        if (timedOut) {
          KillProcessTree(process);
          process.WaitForExit();
        }
        Task.WaitAll(stdoutTask, stderrTask);

        var encoding = new UTF8Encoding(false, true);
        var encodingValid = true;
        var stdoutText = Decode(stdout, encoding, ref encodingValid);
        var stderrText = Decode(stderr, encoding, ref encodingValid);
        var stdoutBytes = stdout.Retained.ToArray();
        var leadingBom = stdoutBytes.Length >= 3 &&
          stdoutBytes[0] == 0xEF && stdoutBytes[1] == 0xBB && stdoutBytes[2] == 0xBF;
        var authDetected = Regex.IsMatch(
          stdoutText + "\n" + stderrText,
          @"\b(authentication|authorization|authenticate|login|log in|logged out|not logged in|sign in|credential|api[ -]?key|token required|unauthorized|forbidden|access denied|permission denied|session expired)\b",
          RegexOptions.IgnoreCase | RegexOptions.CultureInvariant
        );
        var normalized = stdoutText.Replace("\r\n", "\n").Replace("\r", "\n").Trim(' ', '\t', '\n');
        var markerMatched = !timedOut && !stdout.Overflow && !stderr.Overflow &&
          encodingValid && !leadingBom && String.Equals(normalized, expectedMarker, StringComparison.Ordinal);

        return new BoundedProcessFacts {
          TimedOut = timedOut,
          ExitCode = timedOut ? -1 : process.ExitCode,
          StdoutBytes = stdout.Length,
          StderrBytes = stderr.Length,
          StdoutOverflow = stdout.Overflow,
          StderrOverflow = stderr.Overflow,
          EncodingValid = encodingValid,
          LeadingBom = leadingBom,
          AuthDetected = authDetected,
          MarkerMatched = markerMatched
        };
      }
    }
  }
}
'@
}

$powerShellHost = Join-Path $PSHOME 'powershell.exe'
if (-not (Test-Path -LiteralPath $powerShellHost -PathType Leaf)) {
  $powerShellHostRecord = Get-Command powershell.exe -ErrorAction Stop
  $powerShellHost = [IO.Path]::GetFullPath([string]$powerShellHostRecord.Source)
}

$originalPath = $env:PATH
try {
  if ($FixtureMode) {
    $fixtureDirectories = @($FixtureCommandDirectory | ForEach-Object {
      $fullPath = [IO.Path]::GetFullPath($_)
      if (-not (Test-Path -LiteralPath $fullPath -PathType Container)) {
        throw 'PRETOKEN_FIXTURE_DIRECTORY_MISSING'
      }
      $fullPath
    })
    $env:PATH = (@($fixtureDirectories) + @(
      (Join-Path $env:SystemRoot 'System32'),
      $env:SystemRoot
    )) -join [IO.Path]::PathSeparator
    $FixtureCommandDirectory = $fixtureDirectories
  }

  $resolved = @()
  foreach ($providerName in $Provider) {
    $resolved += Resolve-ProviderCommand -ProviderName $providerName
  }

  if ($PlanOnly) {
    foreach ($command in $resolved) {
      $contract = $providerContracts[$command.Provider]
      [PSCustomObject]@{
        provider = $command.Provider
        planOnly = $true
        willInvoke = $false
        commandType = $command.CommandType
        commandExtension = $command.Extension
        commandPathSha256 = $command.PathSha256
        hostMode = $contract.hostMode
        fixedArguments = @($contract.arguments)
        fixedArgumentCount = @($contract.arguments).Count
        timeoutSeconds = $TimeoutSeconds
        maxStreamBytes = $MaxStreamBytes
        runtimeTargetId = $RuntimeTargetId
        childWorkingDirectory = $canonicalProjectRoot
      }
    }
    return
  }

  foreach ($command in $resolved) {
    $contract = $providerContracts[$command.Provider]
    if ($contract.hostMode -eq 'Command') {
      $commandParts = @(
        '&',
        (ConvertTo-SingleQuotedPowerShellLiteral -Value $command.Path)
      ) + @($contract.arguments | ForEach-Object {
        ConvertTo-SingleQuotedPowerShellLiteral -Value ([string]$_)
      })
      $hostArguments = @(
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        ($commandParts -join ' ')
      )
    }
    else {
      $hostArguments = @(
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        $command.Path
      ) + @($contract.arguments)
    }
    $hostCommandLine = @($hostArguments | ForEach-Object {
      ConvertTo-WindowsCommandLineArgument -Value ([string]$_)
    }) -join ' '

    try {
      $facts = [SancusSight.BoundedProcessRunner]::Run(
        $powerShellHost,
        $hostCommandLine,
        $canonicalProjectRoot,
        $RuntimeTargetId,
        ($TimeoutSeconds * 1000),
        $MaxStreamBytes,
        [string]$contract.marker
      )
    }
    catch {
      throw "PRETOKEN_LAUNCHER_ERROR provider=$($command.Provider)"
    }

    $qualified = -not $facts.TimedOut -and
      $facts.ExitCode -eq 0 -and
      -not $facts.StdoutOverflow -and
      -not $facts.StderrOverflow -and
      $facts.EncodingValid -and
      -not $facts.LeadingBom -and
      -not $facts.AuthDetected -and
      $facts.MarkerMatched
    $result = [PSCustomObject]@{
      provider = $command.Provider
      qualified = $qualified
      exitCode = $facts.ExitCode
      timedOut = $facts.TimedOut
      stdoutBytes = $facts.StdoutBytes
      stderrBytes = $facts.StderrBytes
      stdoutOverflow = $facts.StdoutOverflow
      stderrOverflow = $facts.StderrOverflow
      encodingValid = $facts.EncodingValid
      leadingBom = $facts.LeadingBom
      authDetected = $facts.AuthDetected
      markerMatched = $facts.MarkerMatched
      stdinClosed = $true
      commandType = $command.CommandType
      commandExtension = $command.Extension
      commandPathSha256 = $command.PathSha256
      hostMode = $contract.hostMode
      fixedArgumentCount = @($contract.arguments).Count
      runtimeTargetId = $RuntimeTargetId
      childWorkingDirectory = $canonicalProjectRoot
    }
    if (-not $qualified) {
      throw (
        'PRETOKEN_PROVIDER_REJECTED provider={0} exit={1} timeout={2} stdoutBytes={3} stderrBytes={4} ' +
        'stdoutOverflow={5} stderrOverflow={6} encodingValid={7} leadingBom={8} auth={9} marker={10}'
      ) -f @(
        $command.Provider,
        $facts.ExitCode,
        $facts.TimedOut,
        $facts.StdoutBytes,
        $facts.StderrBytes,
        $facts.StdoutOverflow,
        $facts.StderrOverflow,
        $facts.EncodingValid,
        $facts.LeadingBom,
        $facts.AuthDetected,
        $facts.MarkerMatched
      )
    }
    $result
  }
}
finally {
  $env:PATH = $originalPath
}
