param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('capture-source', 'compare-source', 'capture-static', 'compare-static')]
  [string]$Mode,

  [Parameter(Mandatory = $true)]
  [string]$ManifestPath,

  [string]$StaticRoot
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..\..\..\..')).Path

function Get-FileEntry {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$BasePath
  )

  $resolved = (Resolve-Path -LiteralPath $Path).Path
  $normalizedBase = $BasePath.TrimEnd('\', '/')
  $basePrefix = "$normalizedBase\"
  if (-not $resolved.StartsWith($basePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Manifest path escapes the expected base: $resolved"
  }
  $relative = $resolved.Substring($basePrefix.Length).Replace('\', '/')
  $item = Get-Item -LiteralPath $resolved
  [ordered]@{
    path = $relative
    bytes = $item.Length
    sha256 = (Get-FileHash -LiteralPath $resolved -Algorithm SHA256).Hash.ToLowerInvariant()
  }
}

function Get-SourceManifest {
  $topLevel = @(
    'index.html',
    'package.json',
    'tsconfig.json',
    'tsconfig.collector.json',
    'vite.config.ts',
    '.vercel/project.json'
  )
  $roots = @(
    'collector',
    'contracts',
    'controls',
    'operations',
    'packages',
    'public',
    'scripts',
    'src'
  )

  $paths = [System.Collections.Generic.List[string]]::new()
  foreach ($relative in $topLevel) {
    $candidate = Join-Path $projectRoot $relative
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      $paths.Add((Resolve-Path -LiteralPath $candidate).Path)
    }
  }
  foreach ($relative in $roots) {
    $candidate = Join-Path $projectRoot $relative
    if (Test-Path -LiteralPath $candidate -PathType Container) {
      Get-ChildItem -LiteralPath $candidate -File -Recurse |
        ForEach-Object { $paths.Add($_.FullName) }
    }
  }

  $entries = $paths |
    Sort-Object -Unique |
    ForEach-Object { Get-FileEntry -Path $_ -BasePath $projectRoot } |
    Sort-Object path

  [ordered]@{
    schemaVersion = 1
    kind = 'reviewed-source-config'
    files = @($entries)
  }
}

function Get-StaticManifest {
  if (-not $StaticRoot) {
    throw 'StaticRoot is required for static manifest operations.'
  }
  $resolvedRoot = (Resolve-Path -LiteralPath $StaticRoot).Path
  $entries = Get-ChildItem -LiteralPath $resolvedRoot -File -Recurse |
    ForEach-Object { Get-FileEntry -Path $_.FullName -BasePath $resolvedRoot } |
    Sort-Object path

  [ordered]@{
    schemaVersion = 1
    kind = 'static-output'
    files = @($entries)
  }
}

function ConvertTo-CanonicalJson {
  param([Parameter(Mandatory = $true)]$Value)
  ($Value | ConvertTo-Json -Depth 20 -Compress) + "`n"
}

function Capture-Manifest {
  param([Parameter(Mandatory = $true)]$Value)
  $targetDirectory = Split-Path -Parent $ManifestPath
  if ($targetDirectory) {
    New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
  }
  [System.IO.File]::WriteAllText(
    [System.IO.Path]::GetFullPath($ManifestPath),
    (ConvertTo-CanonicalJson $Value),
    [System.Text.UTF8Encoding]::new($false)
  )
}

function Compare-Manifest {
  param([Parameter(Mandatory = $true)]$Value)
  $expected = [System.IO.File]::ReadAllText(
    [System.IO.Path]::GetFullPath($ManifestPath),
    [System.Text.UTF8Encoding]::new($false)
  )
  $actual = ConvertTo-CanonicalJson $Value
  if ($actual -cne $expected) {
    throw "Manifest drift detected against $ManifestPath"
  }
}

switch ($Mode) {
  'capture-source' { Capture-Manifest (Get-SourceManifest) }
  'compare-source' { Compare-Manifest (Get-SourceManifest) }
  'capture-static' { Capture-Manifest (Get-StaticManifest) }
  'compare-static' { Compare-Manifest (Get-StaticManifest) }
}

Write-Output "$Mode PASS: $ManifestPath"
