#!/usr/bin/env node

import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { resolve, basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assertNoProhibitedKeys,
  type AssetProposal,
  type AuthorizedRootSummary,
  type CliRoute,
  type Diagnostic,
  type DiscoveryContext,
  type DiscoveryResult,
  type Platform,
} from './contracts.ts'
import { discoverProjectRegistry } from './adapters/project-registry.ts'
import { discoverAgentConfigs } from './adapters/agent-config.ts'
import { discoverAdapters, discoverControls, discoverEvidenceContracts, discoverEvaluations } from './adapters/governance.ts'
import { discoverMcps } from './adapters/mcp.ts'
import { discoverPlugins, discoverSkills } from './adapters/skills.ts'
import { discoverCommands, discoverLoops, discoverWorkflows } from './adapters/workflows.ts'
import { ReadOnlyFileSystem } from './fs/read-only.ts'
import { normalizeConfirmedRoot } from './fs/roots.ts'
import { mergeProposals } from './proposals/merge.ts'
import { computeRefreshDiff } from './refresh/diff.ts'
import { createReviewSession, type ReviewBundle } from './review/session.ts'
import { startReviewServer } from './review/server.ts'
import { assertPortableRegistrySafe } from './output/portable.ts'
import {
  assertRegistryImportable,
  serializeConfirmedProposals,
  type LocalRegistry,
  type RefreshSidecar,
} from './output/local.ts'
import { writeAtomicSet } from './output/atomic.ts'

export const CLI_VERSION = '0.1.0'
export const CLI_COMMANDS = ['compile', 'refresh', 'validate', 'help', 'version'] as const
export type CliCommand = typeof CLI_COMMANDS[number]

export const CLI_EXIT_CODES = {
  ok: 0,
  usage: 2,
  reviewCancelled: 4,
  validationFailure: 5,
  partialDiscovery: 6,
} as const

export interface ParsedCli {
  route: CliRoute
}

export interface CliIo {
  stdout: (message: string) => void
  stderr: (message: string) => void
}

export interface CliResult {
  exitCode: number
  route?: CliRoute
}

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CliUsageError'
  }
}

const COMMAND_SET = new Set<string>(CLI_COMMANDS)
const VALUE_OPTIONS = new Set(['--root', '--local-out', '--portable-out'])
const UNSAFE_OPTIONS = new Set(['--exec', '--execute', '--command', '--args', '--arguments', '--passthrough', '--shell', '--run', '--mcp-call'])

export function usage(): string {
  return [
    'SancusSight Local Registry Compiler',
    '',
    'Usage:',
    '  npx sancussight-registry <compile|refresh|validate> [options]',
    '',
    'Commands:',
    '  compile     Discover bounded local metadata and open review',
    '  refresh     Review changes against an existing local registry',
    '  validate    Validate local and portable compiler outputs',
    '  help        Show this help',
    '  version     Show the compiler version',
    '',
    'Options:',
    '  --root <path>          Add a confirmed metadata root (repeatable)',
    '  --local-out <path>     Set the exact local registry output',
    '  --portable-out <path>  Set the sanitized portable export output',
    '  --no-open              Print the review URL without launching a browser',
    '  --help, -h             Show this help',
    '  --version, -v          Show the compiler version',
    '',
    'Read-only boundary: the compiler never executes discovered commands,',
    'launches upstream tools, calls MCP servers, or accepts argument passthrough.',
  ].join('\n')
}

function optionValue(argv: string[], index: number, option: string): [string, number] {
  const candidate = argv[index + 1]
  if (!candidate || candidate.startsWith('-')) throw new CliUsageError(`${option} requires a value`)
  return [candidate, index + 1]
}

function baseRoute(command: CliCommand): CliRoute {
  return { command, roots: [], noOpen: false }
}

export function parseCliArgs(argv: string[]): ParsedCli {
  if (argv.length === 0) return { route: baseRoute('help') }
  const [commandToken, ...rest] = argv
  if (!commandToken || commandToken.startsWith('-')) {
    if (commandToken === '--help' || commandToken === '-h') return { route: baseRoute('help') }
    if (commandToken === '--version' || commandToken === '-v') return { route: baseRoute('version') }
    throw new CliUsageError(`Unknown command: ${commandToken ?? ''}`.trim())
  }
  if (!COMMAND_SET.has(commandToken)) throw new CliUsageError(`Unknown command: ${commandToken}`)
  const route = baseRoute(commandToken as CliCommand)
  let showHelp = false
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token) continue
    if (UNSAFE_OPTIONS.has(token) || [...UNSAFE_OPTIONS].some(option => token.startsWith(`${option}=`))) {
      throw new CliUsageError(`Unsupported unsafe option: ${token.split('=')[0]}`)
    }
    if (token === '--help' || token === '-h') { showHelp = true; continue }
    if (token === '--version' || token === '-v') { route.command = 'version'; continue }
    if (token === '--no-open') { route.noOpen = true; continue }
    if (VALUE_OPTIONS.has(token)) {
      const [value, nextIndex] = optionValue(rest, index, token)
      if (token === '--root') route.roots.push(value)
      if (token === '--local-out') route.localOut = value
      if (token === '--portable-out') route.portableOut = value
      index = nextIndex
      continue
    }
    if (token.includes('=')) {
      const option = token.slice(0, token.indexOf('='))
      if (UNSAFE_OPTIONS.has(option)) throw new CliUsageError(`Unsupported unsafe option: ${option}`)
    }
    throw new CliUsageError(`Unknown option: ${token}`)
  }
  if (showHelp) route.command = 'help'
  return { route }
}

function platform(): Platform {
  if (process.platform === 'win32') return 'windows'
  if (process.platform === 'darwin') return 'macos'
  if (process.platform === 'linux') return 'linux'
  return 'unknown'
}

function now(): string { return new Date().toISOString() }
function wait(milliseconds: number): Promise<void> { return new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds)) }

function outputDefaults(): { local: string; portable: string } {
  const appData = process.env.LOCALAPPDATA ?? join(process.env.USERPROFILE ?? process.cwd(), 'AppData', 'Local')
  const directory = join(appData, 'SancusSight')
  return { local: join(directory, 'registry.json'), portable: join(directory, 'registry-portable.json') }
}

function outputPaths(route: CliRoute): { local: string; portable: string } {
  const defaults = outputDefaults()
  return { local: resolve(route.localOut ?? defaults.local), portable: resolve(route.portableOut ?? defaults.portable) }
}

function hasManifest(fileSystem: ReadOnlyFileSystem, relativePath: string): boolean {
  try { fileSystem.readMetadata(relativePath); return true } catch { return false }
}

interface DiscoveryAggregate {
  roots: AuthorizedRootSummary[]
  proposals: AssetProposal[]
  skipped: ReviewBundle['skipped']
  diagnostics: Diagnostic[]
}

function discoverFromRoots(rootPaths: string[], runId: string, observedAt: string): DiscoveryAggregate {
  const roots: AuthorizedRootSummary[] = []
  const proposals: AssetProposal[] = []
  const skipped: ReviewBundle['skipped'] = []
  const diagnostics: Diagnostic[] = []
  const fixedAdapters: Array<{ path: string; run: (context: DiscoveryContext, path: string) => DiscoveryResult }> = [
    { path: 'inventories/skills.json', run: discoverSkills },
    { path: 'inventories/plugins.json', run: discoverPlugins },
    { path: 'inventories/commands.json', run: discoverCommands },
    { path: 'inventories/loops.json', run: discoverLoops },
    { path: 'inventories/workflows.json', run: discoverWorkflows },
    { path: 'inventories/mcps.json', run: discoverMcps },
    { path: 'inventories/agent-configs.json', run: discoverAgentConfigs },
    { path: 'inventories/controls.json', run: discoverControls },
    { path: 'inventories/evaluations.json', run: discoverEvaluations },
    { path: 'inventories/evidence-contracts.json', run: discoverEvidenceContracts },
    { path: 'inventories/adapters.json', run: discoverAdapters },
  ]
  rootPaths.forEach((inputPath, index) => {
    const root = normalizeConfirmedRoot(`root-${index + 1}`, resolve(inputPath), { platform: platform(), portableAlias: `root:root-${index + 1}` })
    const fileSystem = new ReadOnlyFileSystem(root)
    const rootSummary: AuthorizedRootSummary = { rootId: root.rootId, sourceType: 'project-registry', platform: root.platform, portableAlias: root.portableAlias, status: 'inspected', itemCount: root.maxEntryCount }
    roots.push(rootSummary)
    const context: DiscoveryContext = { runId, now: observedAt, platform: root.platform, root: rootSummary, fileSystem }
    if (hasManifest(fileSystem, 'registry.json') && hasManifest(fileSystem, 'local-roots.json')) {
      const result = discoverProjectRegistry(context)
      proposals.push(...result.proposals); skipped.push(...result.skipped); diagnostics.push(...result.diagnostics)
    } else {
      diagnostics.push({ code: 'PROJECT_REGISTRY_NOT_SELECTED', severity: 'info', message: 'No canonical project registry manifests were selected in this root.', sourceType: 'project-registry' })
    }
    for (const adapter of fixedAdapters) {
      if (!hasManifest(fileSystem, adapter.path)) continue
      const result = adapter.run(context, adapter.path)
      proposals.push(...result.proposals); skipped.push(...result.skipped); diagnostics.push(...result.diagnostics)
    }
  })
  return { roots, proposals, skipped, diagnostics }
}

function readJsonAtPath(path: string): unknown {
  const absolute = resolve(path)
  const root = normalizeConfirmedRoot('read-output', dirname(absolute), { platform: platform(), portableAlias: 'root:output' })
  return new ReadOnlyFileSystem(root).readAllowlistedManifest(basename(absolute))
}

function launchReview(url: string): void {
  if (process.platform !== 'win32') return
  const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true })
  child.unref()
}

function writeOutputs(outputs: ReturnType<typeof serializeConfirmedProposals>, paths: { local: string; portable: string }): string[] {
  const sidecar = `${paths.local}.sidecar.json`
  const skipped = `${paths.local}.skipped.json`
  const summary = `${paths.local}.summary.json`
  const entries = [
    { path: paths.local, value: outputs.local },
    { path: paths.portable, value: outputs.portable },
    { path: sidecar, value: outputs.sidecar },
    { path: skipped, value: outputs.skippedReport },
    { path: summary, value: outputs.summary },
  ]
  writeAtomicSet(entries, {
    validate: (value, path) => {
      if (path === paths.local) assertRegistryImportable(value)
      else if (path === paths.portable) assertPortableRegistrySafe(value as LocalRegistry)
      else assertNoProhibitedKeys(value)
    },
  })
  return entries.map(entry => entry.path)
}

async function runCompileOrRefresh(route: CliRoute, io: CliIo): Promise<CliResult> {
  if (route.roots.length === 0) throw new CliUsageError('At least one --root path is required for compile or refresh')
  const runId = `registry-${randomUUID()}`
  const observedAt = now()
  const aggregate = discoverFromRoots(route.roots, runId, observedAt)
  const merged = mergeProposals(aggregate.proposals)
  const paths = outputPaths(route)
  let previousRegistry: LocalRegistry | undefined
  let previousSidecar: RefreshSidecar | undefined
  if (route.command === 'refresh') {
    try { const candidate = readJsonAtPath(paths.local); assertRegistryImportable(candidate); previousRegistry = candidate } catch { /* first refresh is treated as an empty baseline */ }
    try { const candidate = readJsonAtPath(`${paths.local}.sidecar.json`); if (candidate && typeof candidate === 'object') previousSidecar = candidate as RefreshSidecar } catch { /* first refresh is treated as an empty baseline */ }
  }
  const refreshDiff = route.command === 'refresh' ? computeRefreshDiff(previousSidecar, merged.proposals, merged.collisions) : undefined
  const bundle: ReviewBundle = {
    runId,
    roots: aggregate.roots,
    proposals: merged.proposals,
    skipped: aggregate.skipped,
    diagnostics: aggregate.diagnostics,
    collisions: merged.collisions,
    refreshDiff,
  }
  const session = createReviewSession(bundle)
  let outcome: { code: number; paths?: string[] } | undefined
  const server = await startReviewServer({
    session,
    onConfirm: decisions => {
      try {
        const outputs = serializeConfirmedProposals(merged.proposals, decisions, {
          runId,
          now: observedAt,
          previousRegistry,
          previousSidecar,
          skipped: aggregate.skipped,
          diagnostics: aggregate.diagnostics,
          collisions: merged.collisions,
          inspectedRoots: aggregate.roots.length,
          adapterCount: 1 + 11,
        })
        const hasDiscoveryErrors = aggregate.diagnostics.some(item => item.severity === 'error')
        outcome = {
          code: hasDiscoveryErrors ? CLI_EXIT_CODES.partialDiscovery : CLI_EXIT_CODES.ok,
          paths: writeOutputs(outputs, paths),
        }
      } catch (error) {
        outcome = { code: CLI_EXIT_CODES.validationFailure }
        throw error
      }
    },
    onCancel: () => { outcome = { code: CLI_EXIT_CODES.reviewCancelled } },
  })
  io.stdout(`Review URL: ${server.url}`)
  io.stdout(`Run ${runId}: ${merged.proposals.length} proposals, ${aggregate.skipped.length} skipped, ${aggregate.roots.length} roots.`)
  if (refreshDiff) io.stdout(`Refresh diff: +${refreshDiff.additions.length} ~${refreshDiff.modifications.length} -${refreshDiff.disappeared.length} collisions:${refreshDiff.duplicates.length}`)
  if (!route.noOpen) launchReview(server.url)
  while (session.isOpen() && !outcome) await wait(100)
  await server.close()
  if (!outcome) return { exitCode: CLI_EXIT_CODES.reviewCancelled, route }
  if (outcome.paths) outcome.paths.forEach(path => io.stdout(`Output: ${path}`))
  if (outcome.code === CLI_EXIT_CODES.reviewCancelled) io.stdout('Review cancelled. No outputs were replaced.')
  return { exitCode: outcome.code, route }
}

async function runValidate(route: CliRoute, io: CliIo): Promise<CliResult> {
  const paths = outputPaths(route)
  try {
    const local = readJsonAtPath(paths.local)
    assertRegistryImportable(local)
    if (route.portableOut || hasPortableOutput(paths.portable)) assertPortableRegistrySafe(readJsonAtPath(paths.portable) as LocalRegistry)
    io.stdout(`VALID: ${paths.local}`)
    return { exitCode: CLI_EXIT_CODES.ok, route }
  } catch {
    io.stderr('Validation failed: the requested registry output is missing or does not match the safe schema.')
    return { exitCode: CLI_EXIT_CODES.validationFailure, route }
  }
}

function hasPortableOutput(path: string): boolean {
  try { readJsonAtPath(path); return true } catch { return false }
}

export async function runCli(argv: string[], io: CliIo = { stdout: message => console.log(message), stderr: message => console.error(message) }): Promise<CliResult> {
  try {
    const parsed = parseCliArgs(argv)
    if (parsed.route.command === 'help') { io.stdout(usage()); return { exitCode: CLI_EXIT_CODES.ok, route: parsed.route } }
    if (parsed.route.command === 'version') { io.stdout(CLI_VERSION); return { exitCode: CLI_EXIT_CODES.ok, route: parsed.route } }
    if (parsed.route.command === 'validate') return await runValidate(parsed.route, io)
    return await runCompileOrRefresh(parsed.route, io)
  } catch (error) {
    const message = error instanceof CliUsageError ? error.message : 'The compiler could not complete this read-only operation.'
    io.stderr(`${message}\n\n${usage()}`)
    return { exitCode: error instanceof CliUsageError ? CLI_EXIT_CODES.usage : CLI_EXIT_CODES.validationFailure }
  }
}

function isMainModule(): boolean {
  const entry = process.argv[1]
  return Boolean(entry && (import.meta.url === pathToFileURL(entry).href || /[\\/]cli\.(?:ts|js)$/.test(entry)))
}

if (isMainModule()) {
  const result = await runCli(process.argv.slice(2))
  process.exitCode = result.exitCode
}
