import { canonicalJson, createCanonicalRef, governanceEventId, sha256Hex } from './canonicalize.ts'
import type { CanonicalRef, GovernanceBinding, GovernanceEventV1, HumanDecisionPayload } from './model.ts'

const HEX_64 = /^[a-f0-9]{64}$/
const SAFE_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/

/** Create a SancusSight-owned decision for a retained hosted/manual event history. */
export function createHostedHumanDecision(input: HumanDecisionPayload, events: readonly GovernanceEventV1[], now = new Date().toISOString()): GovernanceEventV1 {
  assertDecisionInput(input)
  const actionEvent = events.find(event => eventMentionsAction(event, input.actionId))
  if (!actionEvent) throw new Error('Manual snapshot lacks the referenced action history.')
  if (input.evidenceRefs.some(id => !events.some(event => event.id === id))) throw new Error('Manual snapshot lacks a referenced evidence event.')
  if (input.supersedesDecisionId && !events.some(event => event.id === input.supersedesDecisionId && event.type === 'human.decided')) throw new Error('Manual snapshot lacks the superseded decision history.')
  const sourceRecordId = `manual-decision-${sha256Hex(canonicalJson({ input, now })).slice(0, 32)}`
  const subject = createCanonicalRef('approval', 'sancussight', sourceRecordId, 'SancusSight human decision')
  const relations = [{ type: 'approved-by' as const, target: actionSubject(actionEvent), basis: 'confirmed' as const, evidenceRefs: input.evidenceRefs }]
  const payload = { ...input }
  const event = {
    schemaVersion: 1 as const,
    type: 'human.decided' as const,
    observedAt: input.effectiveAt,
    importedAt: now,
    source: { id: 'sancussight', version: '1.0.0', recordType: 'sancussight.human-decision.v1' },
    subject,
    context: { actionId: input.actionId },
    truth: { assertion: 'human-confirmed' as const, authority: 'human' as const },
    payload,
    relations,
    provenance: {
      producerId: 'sancussight', producerVersion: '1.0.0', sourceRecordId,
      artifactName: 'human-decision', artifactContentHash: sha256Hex(canonicalJson(input)),
      parserId: 'sancussight-governance-ui', parserVersion: '1.0.0', contractVersion: 'human-decision-v1',
      qualification: 'manual' as const, verification: 'not-applicable' as const,
    },
  }
  return { ...event, id: governanceEventId({ type: event.type, sourceId: event.source.id, sourceRecordId, subject, payload, relations, parserVersion: event.provenance.parserVersion }) }
}

/** Create a SancusSight-owned binding for two retained canonical references. */
export function createHostedBinding(input: Omit<GovernanceBinding, 'id'>, events: readonly GovernanceEventV1[]): GovernanceBinding {
  assertBindingInput(input)
  if (input.evidenceRefs.some(id => !events.some(event => event.id === id))) throw new Error('Manual snapshot lacks a referenced evidence event.')
  if (!events.some(event => eventMentionsRef(event, input.from)) || !events.some(event => eventMentionsRef(event, input.to))) throw new Error('Manual snapshot lacks one of the referenced entities.')
  return { id: sha256Hex(canonicalJson(input)), ...input }
}

function assertDecisionInput(input: HumanDecisionPayload): void {
  if (!input || typeof input !== 'object' || !['approve', 'reject', 'override', 'exception', 'revoke'].includes(input.decision) || !SAFE_TOKEN.test(input.actionId) || !SAFE_TOKEN.test(input.policyId) || !SAFE_TOKEN.test(input.policyVersion) || !HEX_64.test(input.scopeHash) || !input.rationale || input.rationale.length > 320 || /[\u0000-\u001f\u007f]/.test(input.rationale) || !SAFE_TOKEN.test(input.decidedBy) || Number.isNaN(Date.parse(input.effectiveAt)) || (input.expiresAt !== undefined && (Number.isNaN(Date.parse(input.expiresAt)) || Date.parse(input.expiresAt) <= Date.parse(input.effectiveAt))) || (input.supersedesDecisionId !== undefined && !HEX_64.test(input.supersedesDecisionId)) || !Array.isArray(input.evidenceRefs) || input.evidenceRefs.length < 1 || input.evidenceRefs.length > 32 || !input.evidenceRefs.every(id => HEX_64.test(id))) throw new Error('The hosted decision is outside the bounded governance contract.')
}

function assertBindingInput(input: Omit<GovernanceBinding, 'id'>): void {
  if (!isCanonicalRef(input.from) || !isCanonicalRef(input.to) || input.from.id === input.to.id || !HEX_64.test(input.scopeHash) || !SAFE_TOKEN.test(input.confirmedBy) || Number.isNaN(Date.parse(input.confirmedAt)) || !Array.isArray(input.evidenceRefs) || input.evidenceRefs.length < 1 || input.evidenceRefs.length > 32 || !input.evidenceRefs.every(id => HEX_64.test(id))) throw new Error('The hosted binding is outside the bounded governance contract.')
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
  return Object.values(payload).some(value => isCanonicalRef(value) && value.id === ref.id)
}

function isCanonicalRef(value: unknown): value is CanonicalRef {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const ref = value as Record<string, unknown>
  return typeof ref.kind === 'string' && typeof ref.id === 'string' && HEX_64.test(ref.id) && typeof ref.namespace === 'string' && SAFE_TOKEN.test(ref.namespace) && (ref.label === undefined || typeof ref.label === 'string')
}
