import { createHash } from 'node:crypto'
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build, loadConfigFromFile, type Plugin } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const ADVERSARIAL_INPUT = 'output/feature012-adversarial-tailwind-candidate.html'

const EXPECTED_BUILD_INPUTS = [
  'index.html',
  'package-lock.json',
  'package.json',
  'public/favicon.svg',
  'public/sancussight-workspace.webp',
  'public/spec/evidence-packet-interoperability-v1.schema.json',
  'src/App.tsx',
  'src/components/ActivityLog.tsx',
  'src/components/AssetVersionHistory.tsx',
  'src/components/BrandLockup.tsx',
  'src/components/CheckCatalog.tsx',
  'src/components/ClaimLineageInspector.tsx',
  'src/components/ConflictPanel.tsx',
  'src/components/ConnectionNotice.tsx',
  'src/components/Definitions.tsx',
  'src/components/EvidenceDetail.tsx',
  'src/components/EvidenceLedger.tsx',
  'src/components/EvidencePacketExport.tsx',
  'src/components/EvidenceSources.tsx',
  'src/components/ExitTest.tsx',
  'src/components/Header.tsx',
  'src/components/LandingGateway.tsx',
  'src/components/Overview.tsx',
  'src/components/Queue.tsx',
  'src/components/Registry.tsx',
  'src/components/ReleaseEvidence.tsx',
  'src/components/ReleaseProgressPanel.tsx',
  'src/components/ShareCard.tsx',
  'src/components/Shared.tsx',
  'src/components/SourceStatus.tsx',
  'src/components/SourceWriteStrip.tsx',
  'src/components/StandardsInteroperability.tsx',
  'src/components/WorkspaceNavigation.tsx',
  'src/components/governance/ActivityLedger.tsx',
  'src/components/governance/ControlLedger.tsx',
  'src/components/governance/DecisionLedger.tsx',
  'src/components/governance/GovernanceDetail.tsx',
  'src/components/governance/GovernanceTabs.tsx',
  'src/components/governance/GovernanceWorkspace.tsx',
  'src/components/governance/InventoryLedger.tsx',
  'src/components/governance/LineageInspector.tsx',
  'src/components/governance/OutcomeLedger.tsx',
  'src/components/governance/RecommendationDetail.tsx',
  'src/components/governance/types.ts',
  'src/domain/governance/canonicalize.ts',
  'src/domain/governance/controls.ts',
  'src/domain/governance/export.ts',
  'src/domain/governance/lineage.ts',
  'src/domain/governance/manual.ts',
  'src/domain/governance/model.ts',
  'src/domain/governance/project.ts',
  'src/index.css',
  'src/lib/activity.ts',
  'src/lib/asset-catalog.ts',
  'src/lib/asset-versions.ts',
  'src/lib/check-catalog.ts',
  'src/lib/check-history-store.ts',
  'src/lib/claim-lineage.ts',
  'src/lib/collector-client.ts',
  'src/lib/connection-store.ts',
  'src/lib/evidence-catalog.ts',
  'src/lib/evidence-packet.ts',
  'src/lib/evidence-snapshot-store.ts',
  'src/lib/evidence.ts',
  'src/lib/file-connector.ts',
  'src/lib/findings.ts',
  'src/lib/governance-client.ts',
  'src/lib/governance-snapshot-store.ts',
  'src/lib/in-toto-statement.ts',
  'src/lib/interoperability-store.ts',
  'src/lib/openlineage-import.ts',
  'src/lib/registry.ts',
  'src/lib/release-evidence-selection.ts',
  'src/lib/release-gate.ts',
  'src/lib/release-progress.ts',
  'src/lib/release-run-descriptor.ts',
  'src/lib/route.ts',
  'src/lib/session.ts',
  'src/lib/source-controller.ts',
  'src/lib/source-state.ts',
  'src/lib/standards-profiles.ts',
  'src/lib/storage.ts',
  'src/lib/telemetry-alignment.ts',
  'src/lib/use-collector.ts',
  'src/lib/use-governance.ts',
  'src/main.tsx',
  'src/types.ts',
  'tsconfig.app.json',
  'tsconfig.collector.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
] as const

function projectPath(file: string, root = ROOT): string {
  return resolve(root, file)
}

function normalizeProjectPath(file: string, root = ROOT): string | undefined {
  const normalized = relative(root, file).split(sep).join('/')
  if (normalized === '' || normalized.startsWith('../') || isAbsolute(normalized)) return undefined
  return normalized
}

async function walkFiles(
  directory: string,
  excludeTests = false,
  root = ROOT,
): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excludeTests && entry.isDirectory() && entry.name === '__tests__') continue
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkFiles(absolute, excludeTests, root))
    } else if (entry.isFile()) {
      const normalized = normalizeProjectPath(absolute, root)
      if (normalized) files.push(normalized)
    }
  }
  return files
}

export async function discoverViteConfigDependencies(root = ROOT): Promise<string[]> {
  const configPath = projectPath('vite.config.ts', root)
  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    configPath,
    root,
    'silent',
  )
  if (!loaded) throw new Error('Vite config could not be loaded for dependency discovery')

  return [...new Set(loaded.dependencies
    .map(file => normalizeProjectPath(file, root))
    .filter((file): file is string => file !== undefined && !file.startsWith('node_modules/')))]
    .sort()
}

export async function discoverDeclaredInputUniverse(root = ROOT): Promise<string[]> {
  const rootEntries = await readdir(root, { withFileTypes: true })
  const rootInputs = rootEntries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name => (
      name === 'index.html'
      || name === 'package.json'
      || name === 'package-lock.json'
      || /^tsconfig(?:\.[^.]+)?\.json$/.test(name)
      || /^(?:vite|tailwind|postcss)\.config\.[cm]?[jt]s$/.test(name)
      || /^\.env(?:\..+)?$/.test(name)
    ))

  return [...new Set([
    ...rootInputs,
    ...await discoverViteConfigDependencies(root),
    ...await walkFiles(projectPath('src', root), true, root),
    ...await walkFiles(projectPath('public', root), false, root),
  ])].sort()
}

export function assertExactInputs(
  actual: string[],
  expectedInputs: readonly string[] = EXPECTED_BUILD_INPUTS,
): void {
  const expected = [...expectedInputs].sort()
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)
  const missing = expected.filter(file => !actualSet.has(file))
  const extra = actual.filter(file => !expectedSet.has(file))
  if (missing.length > 0) {
    throw new Error(`missing declared build inputs:\n${missing.join('\n')}`)
  }
  if (extra.length > 0) {
    throw new Error(`undeclared build inputs:\n${extra.join('\n')}`)
  }
}

export async function hashDeclaredInputs(
  inputs: readonly string[],
  root = ROOT,
): Promise<Record<string, string>> {
  const hashes = await Promise.all(inputs.map(async file => [
    file,
    createHash('sha256').update(await readFile(projectPath(file, root))).digest('hex'),
  ] as const))
  return Object.fromEntries(hashes.sort(([left], [right]) => left.localeCompare(right)))
}

function hashInputManifest(hashes: Record<string, string>): string {
  const manifest = Object.entries(hashes)
    .map(([file, hash]) => `${file}\0${hash}\n`)
    .join('')
  return createHash('sha256').update(manifest).digest('hex')
}

function captureProjectInputs(observed: Set<string>): Plugin {
  function capture(id: string): void {
    if (id.startsWith('\0')) return
    const withoutQuery = id.split('?', 1)[0]
    const normalized = normalizeProjectPath(withoutQuery)
    if (normalized && !normalized.startsWith('node_modules/')) observed.add(normalized)
  }

  return {
    name: 'feature012-capture-project-inputs',
    enforce: 'pre',
    load(id) {
      capture(id)
      return null
    },
    transform(_code, id) {
      capture(id)
      return null
    },
    moduleParsed(info) {
      capture(info.id)
    },
  }
}

async function hashOutput(directory: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {}
  async function visit(current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name)
      if (entry.isDirectory()) {
        await visit(absolute)
      } else if (entry.isFile()) {
        const outputPath = relative(directory, absolute).split(sep).join('/')
        hashes[outputPath] = createHash('sha256').update(await readFile(absolute)).digest('hex')
      }
    }
  }
  await visit(directory)
  return Object.fromEntries(Object.entries(hashes).sort(([left], [right]) => left.localeCompare(right)))
}

function assertSameBundle(
  expected: Record<string, string>,
  actual: Record<string, string>,
  message: string,
): void {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`${message}\nexpected=${JSON.stringify(expected, null, 2)}\nactual=${JSON.stringify(actual, null, 2)}`)
  }
}

async function runBuild(outDir: string): Promise<{ hashes: Record<string, string>, observed: string[] }> {
  const observed = new Set<string>()
  await build({
    root: ROOT,
    configFile: projectPath('vite.config.ts'),
    logLevel: 'warn',
    plugins: [captureProjectInputs(observed)],
    build: {
      outDir,
      emptyOutDir: true,
    },
  })
  return { hashes: await hashOutput(outDir), observed: [...observed].sort() }
}

async function main(): Promise<void> {
  const actualInputs = await discoverDeclaredInputUniverse()
  assertExactInputs(actualInputs)
  const declaredInputHashes = await hashDeclaredInputs(actualInputs)

  const scratch = await mkdtemp(join(tmpdir(), 'sancussight-feature012-build-'))
  const adversarialPath = projectPath(ADVERSARIAL_INPUT)
  let adversarialCreated = false
  try {
    const baselineA = await runBuild(join(scratch, 'build-a'))
    const baselineB = await runBuild(join(scratch, 'build-b'))
    assertSameBundle(baselineA.hashes, baselineB.hashes, 'baseline builds are not byte-identical')

    const expectedSet = new Set<string>(EXPECTED_BUILD_INPUTS)
    const undeclaredObserved = baselineA.observed.filter(file => !expectedSet.has(file))
    if (undeclaredObserved.length > 0) {
      throw new Error(`bundle loaded undeclared build inputs:\n${undeclaredObserved.join('\n')}`)
    }

    await mkdir(dirname(adversarialPath), { recursive: true })
    await writeFile(adversarialPath, '<div class="resize">outside declared application boundary</div>\n', {
      encoding: 'utf8',
      flag: 'wx',
    })
    adversarialCreated = true
    const adversarial = await runBuild(join(scratch, 'build-c'))
    assertSameBundle(
      baselineA.hashes,
      adversarial.hashes,
      'outside-boundary candidate changed bundle bytes',
    )

    console.log(JSON.stringify({
      verdict: 'PASS',
      declaredBuildInputs: actualInputs.length,
      declaredBuildInputHash: hashInputManifest(declaredInputHashes),
      observedBundledInputs: baselineA.observed.length,
      outputFiles: Object.keys(baselineA.hashes).length,
      baselineBuildsByteIdentical: true,
      adversarialOutsideBoundaryIgnored: true,
      adversarialInput: ADVERSARIAL_INPUT,
    }, null, 2))
  } finally {
    if (adversarialCreated) await rm(adversarialPath)
    await rm(scratch, { recursive: true, force: true })
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main()
}
