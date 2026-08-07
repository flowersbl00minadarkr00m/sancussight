import type {
  EvidenceEnvelopeV1,
  EvidenceQualification,
  EvidenceRuntimeId,
  ReleaseEvidenceSourceId,
  EvidenceVerification,
  ReleaseEvidenceManifestV1,
  ReleaseFailureState,
  ReleaseGateResult,
  ReleaseSourceGateResult,
  ReleaseSourceGateState,
} from '../types.ts'
import {
  RELEASE_EVIDENCE_SOURCE_IDS,
  REQUIRED_RELEASE_FAILURE_CASES,
} from '../types.ts'

export const RELEASE_RUN_WINDOW_MS = 30 * 60 * 1000
/** @deprecated Use RELEASE_RUN_WINDOW_MS. */
export const RELEASE_FRESHNESS_WINDOW_MS = RELEASE_RUN_WINDOW_MS
/** @deprecated Use RELEASE_RUN_WINDOW_MS. */
export const RELEASE_ORCHESTRATION_WINDOW_MS = RELEASE_RUN_WINDOW_MS
export const APPROVED_RELEASE_RUNTIMES: readonly EvidenceRuntimeId[] = ['codex-cli', 'claude-code', 'pi']

export interface ReleaseManifestValidation {
  valid: boolean
  errors: string[]
}

/**
 * Legacy Spec 004 envelopes deliberately have no qualification. They remain
 * usable for compatibility views, but are never promoted to operational proof.
 */
export function evidenceQualification(envelope: EvidenceEnvelopeV1): EvidenceQualification {
  return envelope.operational?.qualification ?? 'manual'
}

export function isOperationalEvidence(envelope: EvidenceEnvelopeV1, releaseRunId?: string): boolean {
  return envelope.operational?.qualification === 'operational'
    && (!releaseRunId || envelope.operational.runId === releaseRunId)
}

export function releaseEvidenceRecords(
  manifest: ReleaseEvidenceManifestV1,
  evidence: readonly EvidenceEnvelopeV1[],
  source: ReleaseEvidenceSourceId,
): EvidenceEnvelopeV1[] {
  const byId = new Map(evidence.filter((item) => source === 'runtime-telemetry'
    ? item.source === 'runtime-telemetry' || item.source === 'agent-beacon'
    : item.source === source).map((item) => [item.id, item]))
  return (manifest.sources[source]?.evidenceIds ?? []).map((id) => byId.get(id)).filter((item): item is EvidenceEnvelopeV1 => !!item)
}

export function validateReleaseEvidenceManifest(value: unknown): ReleaseManifestValidation {
  const errors: string[] = []
  if (!value || typeof value !== 'object') return { valid: false, errors: ['manifest:not-an-object'] }
  const manifest = value as Partial<ReleaseEvidenceManifestV1>
  if (manifest.schemaVersion !== 1) errors.push('manifest:unsupported-schema')
  if (!safeToken(manifest.releaseRunId, 160)) errors.push('manifest:release-run-id')
  if (!isoDate(manifest.startedAt)) errors.push('manifest:started-at')
  if (manifest.completedAt !== undefined && !isoDate(manifest.completedAt)) errors.push('manifest:completed-at')
  if (!Array.isArray(manifest.runtimes) || !APPROVED_RELEASE_RUNTIMES.every((runtime) => manifest.runtimes?.includes(runtime))) {
    errors.push('manifest:approved-runtimes')
  }
  if (!manifest.sources || typeof manifest.sources !== 'object' || Array.isArray(manifest.sources)) {
    errors.push('manifest:sources')
  } else {
    const keys = Object.keys(manifest.sources)
    if (keys.some((key) => !isReleaseEvidenceSourceId(key)) || keys.length !== RELEASE_EVIDENCE_SOURCE_IDS.length) {
      errors.push('manifest:source-set')
    }
    for (const source of RELEASE_EVIDENCE_SOURCE_IDS) {
      const entry = (manifest.sources as Partial<Record<ReleaseEvidenceSourceId, unknown>>)[source]
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(`${source}:manifest-entry`)
        continue
      }
      const sourceEntry = entry as Partial<ReleaseEvidenceManifestV1['sources'][ReleaseEvidenceSourceId]>
      if (!safeToken(sourceEntry.version, 80)) errors.push(`${source}:version`)
      if (!safeToken(sourceEntry.targetId, 160)) errors.push(`${source}:target`)
      if (sourceEntry.targetIds !== undefined && (!validTokenSet(sourceEntry.targetIds, 160) || !sourceEntry.targetIds.includes(sourceEntry.targetId ?? ''))) errors.push(`${source}:targets`)
      if (!safeToken(sourceEntry.contractVersion, 80)) errors.push(`${source}:contract`)
      if (sourceEntry.workerRemitHash !== undefined && !/^[a-f0-9]{64}$/.test(sourceEntry.workerRemitHash)) errors.push(`${source}:worker-remit-hash`)
      if (sourceEntry.workerRemitHashes !== undefined && (!validHashSet(sourceEntry.workerRemitHashes) || (sourceEntry.workerRemitHash !== undefined && !sourceEntry.workerRemitHashes.includes(sourceEntry.workerRemitHash)))) errors.push(`${source}:worker-remit-hashes`)
      if (!Array.isArray(sourceEntry.evidenceIds) || sourceEntry.evidenceIds.length === 0 || sourceEntry.evidenceIds.some((id) => !safeToken(id, 160))) {
        errors.push(`${source}:evidence-ids`)
      }
      if (sourceEntry.latestObservedAt !== undefined && !isoDate(sourceEntry.latestObservedAt)) errors.push(`${source}:latest-observed-at`)
      if (!isVerification(sourceEntry.verification)) errors.push(`${source}:verification`)
      if (typeof sourceEntry.operational !== 'boolean') errors.push(`${source}:operational`)
      const requiredTargets = sourceEntry.requiredTargets
      if (requiredTargets !== undefined) {
        if (!Array.isArray(requiredTargets) || requiredTargets.length === 0) {
          errors.push(`${source}:required-targets`)
        } else {
          const targetIds = requiredTargets.map((target) => target?.targetId)
          if (targetIds.some((targetId) => !safeToken(targetId, 160)) || new Set(targetIds).size !== targetIds.length) {
            errors.push(`${source}:required-target-identities`)
          }
          for (const target of requiredTargets) {
            if (!target || typeof target !== 'object' || Array.isArray(target)) {
              errors.push(`${source}:required-target`)
              continue
            }
            if (!Array.isArray(target.evidenceIds) || target.evidenceIds.length === 0 || target.evidenceIds.some((id) => !safeToken(id, 160)) || new Set(target.evidenceIds).size !== target.evidenceIds.length) {
              errors.push(`${source}:required-target-evidence:${target.targetId ?? 'unknown'}`)
            }
            if (!isoDate(target.latestObservedAt)) errors.push(`${source}:required-target-observed-at:${target.targetId ?? 'unknown'}`)
            if (target.workerRemitHash !== undefined && !/^[a-f0-9]{64}$/.test(target.workerRemitHash)) errors.push(`${source}:required-target-remit:${target.targetId ?? 'unknown'}`)
          }
          const targetEvidenceIds = unique(requiredTargets.flatMap((target) => target?.evidenceIds ?? []))
          const targetRemitHashes = unique(requiredTargets.map((target) => target?.workerRemitHash).filter((hash): hash is string => !!hash))
          const targetLatestObservedAt = latest(requiredTargets.map((target) => target?.latestObservedAt).filter((date): date is string => !!date && isoDate(date)))
          if (!sameSet(sourceEntry.evidenceIds, targetEvidenceIds)) errors.push(`${source}:required-target-evidence-summary`)
          const validTargetIds = targetIds.filter((targetId): targetId is string => typeof targetId === 'string')
          if (requiredTargets.length > 1 && !sameSet(sourceEntry.targetIds, validTargetIds)) errors.push(`${source}:required-target-id-summary`)
          if (requiredTargets.length === 1 && sourceEntry.targetIds !== undefined && !sameSet(sourceEntry.targetIds, validTargetIds)) errors.push(`${source}:required-target-id-summary`)
          if (sourceEntry.targetId !== undefined && !targetIds.includes(sourceEntry.targetId)) errors.push(`${source}:required-target-primary-summary`)
          if (targetRemitHashes.length > 1 && !sameSet(sourceEntry.workerRemitHashes, targetRemitHashes)) errors.push(`${source}:required-target-remit-summary`)
          if (targetRemitHashes.length <= 1 && sourceEntry.workerRemitHashes !== undefined && !sameSet(sourceEntry.workerRemitHashes, targetRemitHashes)) errors.push(`${source}:required-target-remit-summary`)
          if (sourceEntry.workerRemitHash !== undefined && !targetRemitHashes.includes(sourceEntry.workerRemitHash)) errors.push(`${source}:required-target-primary-remit-summary`)
          if (sourceEntry.latestObservedAt !== targetLatestObservedAt) errors.push(`${source}:required-target-observed-summary`)
        }
      } else if ((sourceEntry.targetIds?.length ?? 0) > 1 || (sourceEntry.workerRemitHashes?.length ?? 0) > 1) {
        errors.push(`${source}:ambiguous-legacy-multi-target`)
      }
    }
  }
  if (!manifest.failureCases || typeof manifest.failureCases !== 'object' || Array.isArray(manifest.failureCases)) {
    errors.push('manifest:failure-cases')
  } else {
    for (const failureCase of REQUIRED_RELEASE_FAILURE_CASES) {
      if (!isFailureState((manifest.failureCases as Record<string, unknown>)[failureCase])) errors.push(`failure:${failureCase}`)
    }
  }
  if (!['not-run', 'in-progress', 'blocked', 'passed', 'expired'].includes(String(manifest.status))) errors.push('manifest:status')
  if (!Array.isArray(manifest.untestedBoundaries) || manifest.untestedBoundaries.some((item) => !safeToken(item, 240))) errors.push('manifest:untested-boundaries')
  return { valid: errors.length === 0, errors }
}

export function calculateReleaseGate(
  manifest: ReleaseEvidenceManifestV1,
  evidence: readonly EvidenceEnvelopeV1[],
  now: string,
): ReleaseGateResult {
  const evaluatedAt = isoDate(now) ? now : new Date().toISOString()
  const validation = validateReleaseEvidenceManifest(manifest)
  const sources = {} as Record<ReleaseEvidenceSourceId, ReleaseSourceGateResult>
  const blockers = validation.errors.map((error) => `manifest:${error}`)
  const freshnessBlockers: string[] = []

  const runStartedMs = Date.parse(manifest.startedAt)
  const evaluatedMs = Date.parse(evaluatedAt)
  if (!Number.isNaN(runStartedMs) && !Number.isNaN(evaluatedMs)) {
    if (evaluatedMs < runStartedMs) blockers.push('manifest:evaluation-before-run')
    if (evaluatedMs - runStartedMs > RELEASE_RUN_WINDOW_MS) blockers.push('manifest:orchestration-window-exceeded')
    if (manifest.completedAt) {
      const completedMs = Date.parse(manifest.completedAt)
      if (completedMs < runStartedMs) blockers.push('manifest:completed-before-run')
      if (completedMs > evaluatedMs) blockers.push('manifest:completed-after-evaluation')
      if (completedMs - runStartedMs > RELEASE_RUN_WINDOW_MS) blockers.push('manifest:orchestration-window-exceeded')
    }
  }

  for (const source of RELEASE_EVIDENCE_SOURCE_IDS) {
    const entry = manifest.sources?.[source]
    const referenced = entry?.evidenceIds ?? []
    const records = releaseEvidenceRecords(manifest, evidence, source)
    const operationalRecords = records.filter((item) => item.operational?.qualification === 'operational')
    const runtimeCoverage = uniqueRuntimes(operationalRecords)
    const sourceBlockers: string[] = []
    let state: ReleaseSourceGateState = 'current'
    let operational = true
    let fresh = true
    let verification: EvidenceVerification = entry?.verification ?? 'unavailable'
    const latestObservedAt = latest(records.map((item) => item.observedAt))

    if (!entry || !referenced.length || !records.length) {
      state = 'missing'
      operational = false
      fresh = false
      sourceBlockers.push(`${source}:missing-evidence`)
    } else if (records.length !== referenced.length) {
      state = 'missing'
      operational = false
      fresh = false
      sourceBlockers.push(`${source}:referenced-evidence-not-accepted`)
    }
    if (entry && !entry.operational) {
      state = 'non-operational'
      operational = false
      sourceBlockers.push(`${source}:manifest-not-operational`)
    }
    if (records.some((item) => !item.operational || item.operational.qualification !== 'operational')) {
      state = 'non-operational'
      operational = false
      sourceBlockers.push(`${source}:evidence-not-operational`)
    }
    if (operationalRecords.some((item) => item.operational?.runId !== manifest.releaseRunId)) {
      state = 'wrong-run'
      operational = false
      sourceBlockers.push(`${source}:run-mismatch`)
    }
    const approvedTargetIds = entry?.requiredTargets?.map((target) => target.targetId)
      ?? (entry?.targetIds?.length ? entry.targetIds : entry ? [entry.targetId] : [])
    if (entry && operationalRecords.some((item) => !approvedTargetIds.includes(item.operational?.targetId ?? ''))) {
      state = 'wrong-target'
      operational = false
      sourceBlockers.push(`${source}:target-mismatch`)
    }
    if (entry && operationalRecords.some((item) => item.operational?.sourceVersion !== entry.version)) {
      state = 'wrong-version'
      operational = false
      sourceBlockers.push(`${source}:version-mismatch`)
    }
    if (entry && operationalRecords.some((item) => item.operational?.contractVersion !== entry.contractVersion)) {
      state = 'incompatible'
      operational = false
      sourceBlockers.push(`${source}:contract-mismatch`)
    }
    const approvedWorkerRemitHashes = entry?.requiredTargets?.map((target) => target.workerRemitHash).filter((hash): hash is string => !!hash)
      ?? (entry?.workerRemitHashes?.length
      ? entry.workerRemitHashes
      : entry?.workerRemitHash ? [entry.workerRemitHash] : [])
    if (approvedWorkerRemitHashes.length && operationalRecords.some((item) => !approvedWorkerRemitHashes.includes(item.operational?.workerRemitHash ?? ''))) {
      state = 'incompatible'
      operational = false
      sourceBlockers.push(`${source}:worker-remit-mismatch`)
    }
    const observedVerification = records.map((item) => item.provenance.verification)
    if (entry && observedVerification.some((item) => item !== entry.verification)) {
      state = 'incompatible'
      operational = false
      sourceBlockers.push(`${source}:verification-mismatch`)
    }
    verification = observedVerification.find((item) => item === 'failed' || item === 'unavailable') ?? observedVerification[0] ?? verification
    if (verification === 'failed' || verification === 'unavailable' || (source === 'pipelock' && observedVerification.some((item) => item !== 'verified'))) {
      state = 'untrusted'
      operational = false
      sourceBlockers.push(`${source}:untrusted-verification`)
    }
    if (source === 'rampart' && records.some((item) => item.outcome !== 'pass')) {
      state = 'failed'
      operational = false
      sourceBlockers.push('rampart:non-passing-result')
    }
    for (const record of records) {
      const temporal = temporalFailure(record.observedAt, manifest.startedAt, evaluatedAt)
      if (!temporal) continue
      state = temporal.state
      fresh = false
      const blocker = `${source}:${temporal.code}`
      sourceBlockers.push(blocker)
      if (temporal.state === 'stale') freshnessBlockers.push(blocker)
    }
    if (!latestObservedAt) fresh = false
    if (entry?.latestObservedAt && latestObservedAt && entry.latestObservedAt !== latestObservedAt) {
      sourceBlockers.push(`${source}:latest-observed-mismatch`)
    }
    const targets = entry?.requiredTargets?.map((requiredTarget) => {
      const targetRecords = records.filter((record) => requiredTarget.evidenceIds.includes(record.id))
      const targetBlockers: string[] = []
      let targetState: ReleaseSourceGateState = 'current'
      let targetFresh = true
      if (!targetRecords.length) {
        targetState = 'missing'
        targetFresh = false
        targetBlockers.push(`${source}:target-missing:${requiredTarget.targetId}`)
      } else if (targetRecords.length !== requiredTarget.evidenceIds.length) {
        targetState = 'missing'
        targetFresh = false
        targetBlockers.push(`${source}:target-evidence-not-accepted:${requiredTarget.targetId}`)
      }
      for (const record of targetRecords) {
        if (record.operational?.qualification !== 'operational') {
          targetState = 'non-operational'
          targetBlockers.push(`${source}:target-non-operational:${requiredTarget.targetId}`)
        } else if (record.operational.runId !== manifest.releaseRunId) {
          targetState = 'wrong-run'
          targetBlockers.push(`${source}:target-wrong-run:${requiredTarget.targetId}`)
        } else if (record.operational.targetId !== requiredTarget.targetId) {
          targetState = 'wrong-target'
          targetBlockers.push(`${source}:target-identity-mismatch:${requiredTarget.targetId}`)
        } else if (record.operational.sourceVersion !== entry.version) {
          targetState = 'wrong-version'
          targetBlockers.push(`${source}:target-version-mismatch:${requiredTarget.targetId}`)
        } else if (record.operational.contractVersion !== entry.contractVersion) {
          targetState = 'incompatible'
          targetBlockers.push(`${source}:target-contract-mismatch:${requiredTarget.targetId}`)
        }
        if (requiredTarget.workerRemitHash && record.operational?.workerRemitHash !== requiredTarget.workerRemitHash) {
          targetState = 'incompatible'
          targetBlockers.push(`${source}:target-worker-remit-mismatch:${requiredTarget.targetId}`)
        }
        if (record.provenance.verification !== entry.verification) {
          targetState = 'incompatible'
          targetBlockers.push(`${source}:target-verification-mismatch:${requiredTarget.targetId}`)
        }
        if (record.provenance.verification === 'failed' || record.provenance.verification === 'unavailable' || (source === 'pipelock' && record.provenance.verification !== 'verified')) {
          targetState = 'untrusted'
          targetBlockers.push(`${source}:target-untrusted-verification:${requiredTarget.targetId}`)
        }
        const temporal = temporalFailure(record.observedAt, manifest.startedAt, evaluatedAt)
        if (temporal) {
          targetState = temporal.state
          targetFresh = false
          const blocker = `${source}:target-${temporal.code}:${requiredTarget.targetId}`
          targetBlockers.push(blocker)
          if (temporal.state === 'stale') freshnessBlockers.push(blocker)
        }
      }
      const targetLatestObservedAt = latest(targetRecords.map((record) => record.observedAt))
      if (targetLatestObservedAt !== requiredTarget.latestObservedAt) {
        targetState = 'incompatible'
        targetBlockers.push(`${source}:target-latest-observed-mismatch:${requiredTarget.targetId}`)
      }
      sourceBlockers.push(...targetBlockers)
      if (targetBlockers.length) {
        state = targetState
        operational = false
        if (!targetFresh) fresh = false
      }
      return {
        targetId: requiredTarget.targetId,
        state: targetState,
        fresh: targetFresh,
        evidenceIds: targetRecords.map((record) => record.id),
        latestObservedAt: targetLatestObservedAt,
        blockers: [...new Set(targetBlockers)],
      }
    })
    if (sourceBlockers.length) blockers.push(...sourceBlockers)
    sources[source] = {
      source, state, operational, fresh, verification,
      evidenceIds: records.map((item) => item.id), latestObservedAt, runtimeCoverage,
      blockers: [...new Set(sourceBlockers)],
      ...(targets ? { targets } : {}),
    }
  }

  const runtimeTelemetryRuntimes = sources['runtime-telemetry']?.runtimeCoverage ?? []
  for (const runtime of manifest.runtimes ?? []) {
    if (!runtimeTelemetryRuntimes.includes(runtime)) {
      blockers.push(`runtime-telemetry:runtime-missing:${runtime}`)
      continue
    }
    const runtimeRecords = evidence.filter((item) =>
      (item.source === 'runtime-telemetry' || item.source === 'agent-beacon')
      && manifest.sources['runtime-telemetry'].evidenceIds.includes(item.id)
      && item.operational?.qualification === 'operational'
      && item.operational.runtime === runtime,
    )
    const runtimeTemporalFailures = runtimeRecords.map((item) => temporalFailure(item.observedAt, manifest.startedAt, evaluatedAt)).filter((failure): failure is TemporalFailure => !!failure)
    if (runtimeTemporalFailures.length) {
      for (const failure of runtimeTemporalFailures) {
        const runtimeCode = failure.code === 'stale-evidence'
          ? 'stale'
          : failure.code === 'pre-run-evidence'
            ? 'pre-run'
            : failure.code === 'future-evidence'
              ? 'future'
              : failure.code
        const blocker = `runtime-telemetry:runtime-${runtimeCode}:${runtime}`
        blockers.push(blocker)
        if (failure.state === 'stale') freshnessBlockers.push(blocker)
        sources['runtime-telemetry'].state = failure.state
        sources['runtime-telemetry'].fresh = false
        sources['runtime-telemetry'].blockers.push(blocker)
      }
    }
  }

  const failureCases = { ...(manifest.failureCases ?? {}) } as Record<string, ReleaseFailureState>
  for (const failureCase of REQUIRED_RELEASE_FAILURE_CASES) {
    const state = failureCases[failureCase] ?? 'not-run'
    failureCases[failureCase] = state
    if (state !== 'passed') blockers.push(`failure:${failureCase}:${state}`)
  }

  const ready = validation.valid && blockers.length === 0
  const status = ready
    ? 'passed'
    : manifest.status === 'passed' && blockers.every((blocker) => freshnessBlockers.includes(blocker)) && freshnessBlockers.length > 0
      ? 'expired'
      : 'blocked'
  return {
    status,
    ready,
    evaluatedAt,
    sources,
    failureCases,
    runtimeCoverage: runtimeTelemetryRuntimes,
    blockers: [...new Set(blockers)],
  }
}

export function isReleaseReady(result: ReleaseGateResult): boolean {
  return result.ready && result.status === 'passed'
}

function isReleaseEvidenceSourceId(value: string): value is ReleaseEvidenceSourceId {
  return (RELEASE_EVIDENCE_SOURCE_IDS as readonly string[]).includes(value)
}

function isVerification(value: unknown): value is EvidenceVerification {
  return value === 'verified' || value === 'failed' || value === 'unavailable' || value === 'not-applicable'
}

function isFailureState(value: unknown): value is ReleaseFailureState {
  return value === 'passed' || value === 'failed' || value === 'not-run'
}

function safeToken(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value)
}

function validTokenSet(value: unknown, max: number): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => safeToken(item, max)) && new Set(value).size === value.length
}

function validHashSet(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && /^[a-f0-9]{64}$/.test(item)) && new Set(value).size === value.length
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)]
}

function sameSet<T>(left: readonly T[] | undefined, right: readonly T[]): boolean {
  return !!left && left.length === right.length && left.every((value) => right.includes(value))
}

function isoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

interface TemporalFailure {
  state: ReleaseSourceGateState
  code: 'invalid-observed-at' | 'pre-run-evidence' | 'future-evidence' | 'stale-evidence'
}

function temporalFailure(observedAt: string, runStartedAt: string, evaluatedAt: string): TemporalFailure | undefined {
  const observed = Date.parse(observedAt)
  const started = Date.parse(runStartedAt)
  const evaluated = Date.parse(evaluatedAt)
  if (Number.isNaN(observed)) return { state: 'incompatible', code: 'invalid-observed-at' }
  if (observed < started) return { state: 'wrong-run', code: 'pre-run-evidence' }
  if (observed > evaluated) return { state: 'incompatible', code: 'future-evidence' }
  if (evaluated - observed > RELEASE_RUN_WINDOW_MS) return { state: 'stale', code: 'stale-evidence' }
  return undefined
}

function latest(values: readonly string[]): string | undefined {
  return [...values].sort((left, right) => Date.parse(right) - Date.parse(left))[0]
}

function uniqueRuntimes(records: readonly EvidenceEnvelopeV1[]): EvidenceRuntimeId[] {
  return APPROVED_RELEASE_RUNTIMES.filter((runtime) => records.some((record) => record.operational?.runtime === runtime))
}
