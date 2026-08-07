import type { EvidenceEnvelopeV1, EvidenceSourceId, EvidenceSourceState } from '../src/types.ts'
import type {
  CanonicalRef,
  GovernanceBinding,
  GovernanceEventV1,
  HumanDecisionPayload,
  HumanDecisionRecord,
} from '../src/domain/governance/model.ts'
import { LOGICAL_ASSET_KINDS } from '../src/domain/governance/model.ts'
import { canonicalJson, createCanonicalRef, sha256Hex } from '../src/domain/governance/canonicalize.ts'
import { projectEvidenceEnvelope } from './adapters/projections/evidence-envelope.ts'
import { createGovernanceEvent } from './governance-event.ts'
import { GovernanceStore, type GovernanceCheckpoint, type GovernancePage } from './governance-store.ts'
import { GovernanceConfigStore, type GovernanceSourceConfig } from './governance-config-store.ts'
import { createInitialGovernanceAdapters } from './adapters/index.ts'
import type { GovernanceAdapter } from './adapters/governance-types.ts'
import { buildGovernanceReadModel, type GovernanceReadModel } from '../src/domain/governance/project.ts'
import { createGovernanceBundle, type GovernanceBundleV1 } from '../src/domain/governance/export.ts'

const HEX_64 = /^[a-f0-9]{64}$/
const SAFE_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/

export interface HumanDecisionInput extends HumanDecisionPayload {}

export interface ConfirmedBindingInput {
  from: CanonicalRef
  to: CanonicalRef
  scopeHash: string
  confirmedAt: string
  confirmedBy: string
  evidenceRefs: string[]
}

export interface GovernanceSourceState {
  id: GovernanceSourceConfig['id']
  enabled: boolean
  health: 'current' | 'stale' | 'failed' | 'not-configured'
  acceptedCount: number
  rejectedCount: number
  lastAcceptedAt?: string
  errorCode?: string
}

export class GovernanceService {
  private readonly store: GovernanceStore
  private readonly sourceStatesReader?: () => Promise<readonly EvidenceSourceState[]>
  private readonly evidenceStore?: import('./evidence-store.ts').EvidenceStore
  private readonly configStore?: GovernanceConfigStore
  private readonly adapters: Map<string, GovernanceAdapter>
  private readonly sourceStates = new Map<GovernanceSourceConfig['id'], GovernanceSourceState>()
  private storeWriteQueue: Promise<void> = Promise.resolve()
  private timer: NodeJS.Timeout | undefined

  constructor(
    store: GovernanceStore,
    sourceStatesReader?: () => Promise<readonly EvidenceSourceState[]>,
    evidenceStore?: import('./evidence-store.ts').EvidenceStore,
    configStore?: GovernanceConfigStore,
    adapters = createInitialGovernanceAdapters(),
  ) {
    this.store = store
    this.sourceStatesReader = sourceStatesReader
    this.evidenceStore = evidenceStore
    this.configStore = configStore
    this.adapters = adapters
    for (const id of ['findmnemo', 'flowsensa', 'runtime-inventory'] as const) this.sourceStates.set(id, { id, enabled: false, health: 'not-configured', acceptedCount: 0, rejectedCount: 0 })
  }

  async initialize(): Promise<void> {
    if (!this.configStore) {
      await this.syncEvidence()
      return
    }
    const config = await this.configStore.load()
    for (const id of this.sourceStates.keys()) {
      const configured = config.sources.find((source) => source.id === id && source.enabled)
      this.sourceStates.set(id, { ...this.sourceStates.get(id)!, enabled: !!configured, health: configured ? 'stale' : 'not-configured' })
    }
    await this.syncEvidence()
    await Promise.all(config.sources.filter((item) => item.enabled).map((source) => this.collectNativeSource(source).catch(() => undefined)))
    this.timer = setInterval(() => { void this.refreshConfiguredSources() }, config.pollIntervalMs)
    this.timer.unref()
  }

  async close(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
  }

  async projectEvidence(envelopes: readonly EvidenceEnvelopeV1[], checkpoint: GovernanceCheckpoint): Promise<GovernanceEventV1[]> {
    const events = envelopes.map(projectEvidenceEnvelope)
    await this.enqueueStoreWrite(() => this.store.accept(events, checkpoint))
    return events
  }

  async syncEvidence(): Promise<void> {
    if (!this.evidenceStore) return
    const accepted = await this.evidenceStore.readAccepted()
    const bySource = new Map<string, EvidenceEnvelopeV1[]>()
    for (const envelope of accepted) bySource.set(envelope.source, [...(bySource.get(envelope.source) ?? []), envelope])
    for (const [source, envelopes] of bySource) {
      const checkpoint = this.evidenceStore.getCheckpoint(source as EvidenceSourceId)
      await this.projectEvidence(envelopes, { source: `evidence:${source}`, cursor: checkpoint?.cursor ?? String(envelopes.length), updatedAt: new Date().toISOString(), ...(checkpoint?.artifactIdentity ? { artifactIdentity: checkpoint.artifactIdentity } : {}) })
    }
  }

  async listEvents(options: { cursor?: string; limit?: number; source?: string } = {}): Promise<GovernancePage> {
    await this.syncEvidence()
    return this.store.pageEvents(options)
  }

  async allEvents(): Promise<GovernanceEventV1[]> {
    return this.store.readEvents()
  }

  async readModel(now: string): Promise<GovernanceReadModel> {
    await this.syncEvidence()
    return buildGovernanceReadModel({ events: await this.store.readEvents(), bindings: await this.store.readBindings(), sourceStates: this.sourceStatesReader ? await this.sourceStatesReader() : [], now })
  }

  async listSourceStates(): Promise<GovernanceSourceState[]> {
    return [...this.sourceStates.values()]
  }

  async configureSource(id: GovernanceSourceConfig['id'], artifactPath: string): Promise<GovernanceSourceState> {
    if (!this.configStore) throw new GovernanceServiceError('governance-config-unavailable')
    const adapter = this.adapters.get(id)
    if (!adapter) throw new GovernanceServiceError('unknown-governance-source')
    await adapter.validate(artifactPath)
    const config = await this.configStore.load()
    const sources = config.sources.filter((source) => source.id !== id)
    const next = { id, artifactPath, enabled: true } satisfies GovernanceSourceConfig
    sources.push(next)
    await this.configStore.save({ ...config, sources })
    this.sourceStates.set(id, { ...this.sourceStates.get(id)!, enabled: true, health: 'stale', errorCode: undefined })
    await this.collectNativeSource(next)
    return this.sourceStates.get(id)!
  }

  async refreshSource(id: GovernanceSourceConfig['id']): Promise<GovernanceSourceState> {
    if (!this.configStore) throw new GovernanceServiceError('governance-config-unavailable')
    const config = await this.configStore.load()
    const source = config.sources.find((item) => item.id === id && item.enabled)
    if (!source) throw new GovernanceServiceError('governance-source-not-configured')
    await this.collectNativeSource(source)
    return this.sourceStates.get(id)!
  }

  async disconnectSource(id: GovernanceSourceConfig['id']): Promise<void> {
    if (!this.configStore) throw new GovernanceServiceError('governance-config-unavailable')
    const config = await this.configStore.load()
    await this.configStore.save({ ...config, sources: config.sources.filter((source) => source.id !== id) })
    const previous = this.sourceStates.get(id)!
    this.sourceStates.set(id, { ...previous, enabled: false, health: 'not-configured', errorCode: undefined })
  }

  async appendHumanDecision(input: HumanDecisionInput): Promise<HumanDecisionRecord> {
    assertDecisionInput(input)
    const events = await this.store.readEvents()
    const actionEvent = events.find((event) => eventMentionsAction(event, input.actionId))
    if (!actionEvent) throw new GovernanceServiceError('decision-action-not-found')
    if (input.evidenceRefs.some((id) => !this.store.hasEvent(id))) throw new GovernanceServiceError('decision-evidence-not-found')
    if (input.supersedesDecisionId && !events.some((event) => event.id === input.supersedesDecisionId && event.type === 'human.decided')) {
      throw new GovernanceServiceError('decision-supersession-not-found')
    }
    const sourceRecordId = `decision-${Date.now()}-${sha256Hex(`${input.decidedBy}\n${input.effectiveAt}\n${input.scopeHash}`).slice(0, 16)}`
    const subject = createCanonicalRef('approval', 'sancussight', sourceRecordId, 'SancusSight human decision')
    const relations = [{ type: 'approved-by' as const, target: actionSubject(actionEvent), basis: 'confirmed' as const, evidenceRefs: input.evidenceRefs }]
    const event = {
      schemaVersion: 1 as const,
      type: 'human.decided' as const,
      observedAt: input.effectiveAt,
      importedAt: new Date().toISOString(),
      source: { id: 'sancussight', version: '1.0.0', recordType: 'sancussight.human-decision.v1' },
      subject,
      context: { actionId: input.actionId },
      truth: { assertion: 'human-confirmed' as const, authority: 'human' as const },
      payload: input,
      relations,
      provenance: {
        producerId: 'sancussight', producerVersion: '1.0.0', sourceRecordId,
        artifactName: 'human-decision', artifactContentHash: sha256Hex(canonicalJson(input)),
        parserId: 'sancussight-governance-api', parserVersion: '1.0.0', contractVersion: 'human-decision-v1',
        qualification: 'manual' as const, verification: 'not-applicable' as const,
      },
    }
    const decision = createGovernanceEvent(event) as HumanDecisionRecord
    await this.enqueueStoreWrite(() => this.store.appendLocal([decision]))
    return decision
  }

  async appendBinding(input: ConfirmedBindingInput): Promise<GovernanceBinding> {
    assertBindingInput(input)
    const events = await this.store.readEvents()
    if (input.evidenceRefs.some((id) => !events.some((event) => event.id === id))) throw new GovernanceServiceError('binding-evidence-not-found')
    if (!events.some((event) => eventMentionsRef(event, input.from)) || !events.some((event) => eventMentionsRef(event, input.to))) {
      throw new GovernanceServiceError('binding-entity-not-found')
    }
    const id = sha256Hex(canonicalJson(input))
    const binding = { id, ...input }
    await this.enqueueStoreWrite(() => this.store.appendBinding(binding))
    return binding
  }

  async listBindings(): Promise<GovernanceBinding[]> {
    return this.store.readBindings()
  }

  async exportBundle(now = new Date().toISOString()): Promise<GovernanceBundleV1> {
    return createGovernanceBundle(await this.readModel(now), { mode: 'local-collector', events: await this.store.readEvents(), bindings: await this.store.readBindings() })
  }

  private async refreshConfiguredSources(): Promise<void> {
    if (!this.configStore) return
    const config = await this.configStore.load()
    await this.syncEvidence()
    await Promise.all(config.sources.filter((item) => item.enabled).map((source) => this.collectNativeSource(source).catch(() => undefined)))
  }

  private async collectNativeSource(source: GovernanceSourceConfig): Promise<void> {
    const adapter = this.adapters.get(source.id)
    if (!adapter) throw new GovernanceServiceError('unknown-governance-source')
    const attemptedAt = new Date().toISOString()
    const current = this.sourceStates.get(source.id)!
    this.sourceStates.set(source.id, { ...current, enabled: true, health: 'stale', errorCode: undefined })
    try {
      const result = await adapter.collect(source.artifactPath, this.store.getCheckpoint(source.id), attemptedAt)
      await this.enqueueStoreWrite(async () => {
        for (const rejection of result.rejected) await this.store.reject(rejection)
        const checkpoint = this.store.getCheckpoint(source.id)
        const checkpointChanged = result.checkpoint.cursor !== checkpoint?.cursor
        const acceptedCount = await this.store.accept(result.accepted, result.checkpoint)
        this.sourceStates.set(source.id, { ...this.sourceStates.get(source.id)!, health: result.rejected.length && !acceptedCount && !checkpointChanged ? 'failed' : 'current', acceptedCount: (this.sourceStates.get(source.id)?.acceptedCount ?? 0) + acceptedCount, rejectedCount: (this.sourceStates.get(source.id)?.rejectedCount ?? 0) + result.rejected.length, lastAcceptedAt: acceptedCount ? attemptedAt : this.sourceStates.get(source.id)?.lastAcceptedAt, ...(result.rejected.length ? { errorCode: result.rejected[0].errorCode } : {}) })
      })
    } catch (error) {
      this.sourceStates.set(source.id, { ...this.sourceStates.get(source.id)!, health: 'failed', errorCode: error instanceof Error ? error.message.slice(0, 120) : 'governance-collection-failed' })
    }
  }

  private enqueueStoreWrite<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.storeWriteQueue.then(operation, operation)
    this.storeWriteQueue = next.then(() => undefined, () => undefined)
    return next
  }
}

export class GovernanceServiceError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export { projectEvidenceEnvelope }

function assertDecisionInput(input: HumanDecisionInput): void {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !hasOnlyKeys(input as unknown as Record<string, unknown>, ['decision', 'actionId', 'policyId', 'policyVersion', 'scopeHash', 'rationale', 'decidedBy', 'effectiveAt', 'expiresAt', 'supersedesDecisionId', 'evidenceRefs']) || !['approve', 'reject', 'override', 'exception', 'revoke'].includes(input.decision)) throw new GovernanceServiceError('invalid-decision')
  if (!SAFE_TOKEN.test(input.actionId) || !SAFE_TOKEN.test(input.policyId) || !SAFE_TOKEN.test(input.policyVersion)) throw new GovernanceServiceError('invalid-decision')
  if (!HEX_64.test(input.scopeHash) || !input.rationale || input.rationale.length > 320 || /[\u0000-\u001f\u007f]/.test(input.rationale)) throw new GovernanceServiceError('invalid-decision')
  if (!SAFE_TOKEN.test(input.decidedBy) || Number.isNaN(Date.parse(input.effectiveAt))) throw new GovernanceServiceError('invalid-decision')
  if (input.expiresAt !== undefined && (Number.isNaN(Date.parse(input.expiresAt)) || Date.parse(input.expiresAt) <= Date.parse(input.effectiveAt))) throw new GovernanceServiceError('invalid-decision-expiry')
  if (input.supersedesDecisionId !== undefined && !HEX_64.test(input.supersedesDecisionId)) throw new GovernanceServiceError('invalid-decision')
  if (!Array.isArray(input.evidenceRefs) || input.evidenceRefs.length < 1 || input.evidenceRefs.length > 32 || !input.evidenceRefs.every((id) => HEX_64.test(id))) throw new GovernanceServiceError('invalid-decision-evidence')
}

function assertBindingInput(input: ConfirmedBindingInput): void {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !hasOnlyKeys(input as unknown as Record<string, unknown>, ['from', 'to', 'scopeHash', 'confirmedAt', 'confirmedBy', 'evidenceRefs']) || !isCanonicalRef(input.from) || !isCanonicalRef(input.to) || input.from.id === input.to.id) throw new GovernanceServiceError('invalid-binding')
  if (!HEX_64.test(input.scopeHash) || !SAFE_TOKEN.test(input.confirmedBy) || Number.isNaN(Date.parse(input.confirmedAt))) throw new GovernanceServiceError('invalid-binding')
  if (!Array.isArray(input.evidenceRefs) || input.evidenceRefs.length < 1 || input.evidenceRefs.length > 32 || !input.evidenceRefs.every((id) => HEX_64.test(id))) throw new GovernanceServiceError('invalid-binding-evidence')
}

function eventMentionsAction(event: GovernanceEventV1, actionId: string): boolean {
  if (event.context.actionId === actionId) return true
  const payload = event.payload as unknown as Record<string, unknown>
  return isCanonicalRef(payload.action) && payload.action.id === actionId || payload.actionId === actionId
}

function actionSubject(event: GovernanceEventV1): CanonicalRef {
  const payload = event.payload as unknown as Record<string, unknown>
  return isCanonicalRef(payload.action) ? payload.action : event.subject
}

function eventMentionsRef(event: GovernanceEventV1, ref: CanonicalRef): boolean {
  if (event.subject.id === ref.id) return true
  const payload = event.payload as unknown as Record<string, unknown>
  return Object.values(payload).some((value) => isCanonicalRef(value) && value.id === ref.id)
}

function isCanonicalRef(value: unknown): value is CanonicalRef {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && hasOnlyKeys(value as Record<string, unknown>, ['kind', 'id', 'namespace', 'label'])
    && typeof (value as { kind?: unknown }).kind === 'string' && LOGICAL_ASSET_KINDS.includes((value as { kind: typeof LOGICAL_ASSET_KINDS[number] }).kind)
    && typeof (value as { id?: unknown }).id === 'string' && HEX_64.test((value as { id: string }).id)
    && typeof (value as { namespace?: unknown }).namespace === 'string' && SAFE_TOKEN.test((value as { namespace: string }).namespace)
    && ((value as { label?: unknown }).label === undefined || (typeof (value as { label: unknown }).label === 'string' && String((value as { label: string }).label).length <= 160 && !/[\u0000-\u001f\u007f]/.test(String((value as { label: string }).label))))
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}
