export * from './contracts.ts'
export {
  CLI_COMMANDS,
  CLI_VERSION,
  CliUsageError,
  parseCliArgs,
  runCli,
  usage,
} from './cli.ts'
export type { CliCommand, CliIo, CliResult, ParsedCli } from './cli.ts'
export { ReadOnlyFileSystem, ReadOnlyLimitError, ManifestFormatError } from './fs/read-only.ts'
export {
  DEFAULT_MAX_ENTRY_COUNT,
  DEFAULT_MAX_FILE_BYTES,
  normalizeConfirmedRoot,
  resolveConfirmedPath,
  isPathWithinRoot,
  RootBoundaryError,
  RootConfigurationError,
} from './fs/roots.ts'
export { classifyMetadata, classifyReadFailure } from './privacy/classify.ts'
export { discoverProjectRegistry } from './adapters/project-registry.ts'
export { discoverFixedInventory } from './adapters/common.ts'
export { discoverSkills, discoverPlugins } from './adapters/skills.ts'
export { discoverAgentConfigs } from './adapters/agent-config.ts'
export { discoverMcps } from './adapters/mcp.ts'
export { discoverCommands, discoverLoops, discoverWorkflows } from './adapters/workflows.ts'
export { discoverAdapters, discoverControls, discoverEvaluations, discoverEvidenceContracts } from './adapters/governance.ts'
export { fallbackIdentityKey, identityFor } from './proposals/identity.ts'
export { mergeProposals } from './proposals/merge.ts'
export type { FixedAdapterConfig } from './adapters/common.ts'
export type { ProposalCollision, ProposalMergeResult } from './proposals/merge.ts'
export type { ProposalIdentity } from './proposals/identity.ts'
export { createReviewSession, ReviewSessionError } from './review/session.ts'
export { startReviewServer } from './review/server.ts'
export type { ReviewBundle, ReviewSession, ReviewSessionOptions } from './review/session.ts'
export type { ReviewServerOptions, StartedReviewServer } from './review/server.ts'
export {
  assertRegistryImportable,
  serializeConfirmedProposals,
} from './output/local.ts'
export type {
  LocalRegistry,
  RefreshSidecar,
  RunSummary,
  SerializedRegistryOutputs,
  SerializerOptions,
  SkippedReport,
} from './output/local.ts'
export { assertPortableRegistrySafe, serializePortableRegistry } from './output/portable.ts'
export { boundedDiagnostic, boundedSkipped, serializeRunSummary, serializeSkippedReport } from './output/diagnostics.ts'
export { writeAtomicJson, writeAtomicSet, AtomicWriteError } from './output/atomic.ts'
export type { AtomicFileSystem, AtomicWriteEntry, AtomicWriteOptions, AtomicWriteResult } from './output/atomic.ts'
export { computeRefreshDiff } from './refresh/diff.ts'
