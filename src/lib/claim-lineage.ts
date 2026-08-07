import type {
  Asset,
  EvidenceEnvelopeV1,
  EvidenceSourceState,
} from '../types.ts'
import type { CheckResultProjection } from './check-catalog.ts'

export type ClaimNodeKind =
  | 'target'
  | 'evidence'
  | 'producer'
  | 'run'
  | 'contract'
  | 'claim'
  | 'decision'

export type ClaimEdgeState =
  | 'verified'
  | 'missing'
  | 'inferred'
  | 'stale'
  | 'conflicting'

export type ClaimTruthClass =
  | 'recorded-fact'
  | 'deterministic-finding'
  | 'human-decision'
  | 'missing-evidence'

export interface ClaimLineageNode {
  id: string
  kind: ClaimNodeKind
  label: string
  truthClass: ClaimTruthClass
  reference?: string
}

export interface ClaimLineageEdge {
  id: string
  from: string
  to: string
  state: ClaimEdgeState
  explanation: string
}

export interface ClaimLineageGap {
  kind: ClaimNodeKind
  state: Exclude<ClaimEdgeState, 'verified'>
  explanation: string
}

export interface ClaimDecisionReference {
  id: string
  label: string
}

export interface BuildClaimLineageContext {
  asset?: Asset
  evidence?: readonly EvidenceEnvelopeV1[]
  sources?: readonly EvidenceSourceState[]
  decision?: ClaimDecisionReference
  narrativeOnly?: boolean
}

export interface ClaimLineage {
  nodes: readonly ClaimLineageNode[]
  edges: readonly ClaimLineageEdge[]
  gaps: readonly ClaimLineageGap[]
  bounded: true
  maxNodes: 8
}

const MAX_EVIDENCE_NODES = 2
const MAX_NODES = 8

function freezeNode(node: ClaimLineageNode): ClaimLineageNode {
  return Object.freeze(node)
}

function relevantEvidence(
  result: CheckResultProjection,
  context: BuildClaimLineageContext,
): EvidenceEnvelopeV1[] {
  const references = new Set(result.evidence.flatMap((item) => item.reference ? [item.reference] : []))
  return [...(context.evidence ?? [])]
    .filter((envelope) => references.has(envelope.id))
    .sort((left, right) => (
      right.observedAt.localeCompare(left.observedAt)
      || left.id.localeCompare(right.id)
    ))
    .slice(0, MAX_EVIDENCE_NODES)
}

function evidenceState(
  result: CheckResultProjection,
  envelopes: readonly EvidenceEnvelopeV1[],
  context: BuildClaimLineageContext,
): ClaimEdgeState {
  if (result.category === 'missing-evidence') return 'missing'
  if (context.narrativeOnly) return 'inferred'
  if (result.evidence.some((reference) => reference.reference) && envelopes.length === 0) {
    return 'missing'
  }

  const outcomes = new Set(envelopes.map((envelope) => envelope.outcome))
  const subjects = new Set(envelopes.map((envelope) => (
    `${envelope.subject.type}:${envelope.subject.stableId ?? envelope.subject.externalId}`
  )))
  if (envelopes.length > 1 && subjects.size === 1 && outcomes.size > 1) return 'conflicting'

  const sourceById = new Map((context.sources ?? []).map((source) => [source.id, source]))
  if (
    envelopes.some((envelope) => {
      const source = sourceById.get(envelope.source)
      return source !== undefined && source.health !== 'current'
    })
    || result.evidence.some((reference) => (
      reference.sourceHealth !== undefined && reference.sourceHealth !== 'current'
    ))
  ) {
    return 'stale'
  }

  return 'verified'
}

function edgeExplanation(state: ClaimEdgeState): string {
  switch (state) {
    case 'verified':
      return 'The recorded input is deterministically bound to the named rule and result; this does not independently prove the external fact.'
    case 'missing':
      return 'A required accepted input or evidence reference is missing.'
    case 'inferred':
      return 'The relationship is suggested by narrative metadata but lacks an exact accepted reference.'
    case 'stale':
      return 'The accepted record is retained, but its source or freshness state is stale.'
    case 'conflicting':
      return 'The latest bounded accepted observations make incompatible claims for the same subject.'
  }
}

function connect(
  edges: ClaimLineageEdge[],
  from: ClaimLineageNode,
  to: ClaimLineageNode,
  state: ClaimEdgeState,
): void {
  edges.push(Object.freeze({
    id: `${from.id}->${to.id}`,
    from: from.id,
    to: to.id,
    state,
    explanation: edgeExplanation(state),
  }))
}

export function buildClaimLineage(
  result: CheckResultProjection,
  context: BuildClaimLineageContext = {},
): ClaimLineage {
  if (result.kind === 'uncataloged') {
    return Object.freeze({
      nodes: Object.freeze([]),
      edges: Object.freeze([]),
      gaps: Object.freeze([Object.freeze({
        kind: 'contract' as const,
        state: 'missing' as const,
        explanation: 'This source-qualified observation has no stable Check Catalog definition, so no rule or lineage edge is invented.',
      })]),
      bounded: true as const,
      maxNodes: MAX_NODES,
    })
  }

  const nodes: ClaimLineageNode[] = []
  const edges: ClaimLineageEdge[] = []
  const gaps: ClaimLineageGap[] = []
  const envelopes = relevantEvidence(result, context)
  const relationship = evidenceState(result, envelopes, context)
  const exactReferenceMissing = result.evidence.some((reference) => reference.reference)
    && envelopes.length === 0
  const missingExplanation = exactReferenceMissing
    ? 'The exact accepted evidence reference for this result is unavailable.'
    : result.missingEvidence
  const target = freezeNode({
    id: `target:${result.assetId}`,
    kind: 'target',
    label: context.asset?.name ?? result.assetName,
    truthClass: 'recorded-fact',
    reference: context.asset?.stableId ?? result.assetId,
  })
  nodes.push(target)

  const evidenceNodes: ClaimLineageNode[] = []
  if (relationship === 'missing') {
    evidenceNodes.push(freezeNode({
      id: `evidence:missing:${result.signalId}`,
      kind: 'evidence',
      label: missingExplanation,
      truthClass: 'missing-evidence',
    }))
    gaps.push(Object.freeze({
      kind: 'evidence',
      state: 'missing',
      explanation: missingExplanation,
    }))
  } else if (envelopes.length > 0) {
    for (const envelope of envelopes) {
      evidenceNodes.push(freezeNode({
        id: `evidence:${envelope.id}`,
        kind: 'evidence',
        label: `${envelope.source} accepted ${envelope.evidenceKind}`,
        truthClass: 'recorded-fact',
        reference: envelope.id,
      }))
    }
  } else {
    const reference = result.evidence[0]
    evidenceNodes.push(freezeNode({
      id: `evidence:input:${result.signalId}`,
      kind: 'evidence',
      label: reference?.label ?? result.inspectedInputs.join(', '),
      truthClass: 'recorded-fact',
      ...(reference?.reference ? { reference: reference.reference } : {}),
    }))
  }
  nodes.push(...evidenceNodes)

  if (relationship === 'inferred') {
    gaps.push(Object.freeze({
      kind: 'evidence',
      state: 'inferred',
      explanation: 'No exact accepted evidence reference binds the narrative metadata to this result.',
    }))
  } else if (relationship === 'conflicting') {
    gaps.push(Object.freeze({
      kind: 'evidence',
      state: 'conflicting',
      explanation: 'The bounded latest observations conflict and require an explicit resolution.',
    }))
  }

  const firstEnvelope = envelopes[0]
  let producer: ClaimLineageNode | undefined
  let run: ClaimLineageNode | undefined
  if (firstEnvelope) {
    producer = freezeNode({
      id: `producer:${firstEnvelope.source}`,
      kind: 'producer',
      label: firstEnvelope.source,
      truthClass: 'recorded-fact',
      reference: firstEnvelope.source,
    })
    nodes.push(producer)
    if (firstEnvelope.operational?.runId) {
      run = freezeNode({
        id: `run:${firstEnvelope.operational.runId}`,
        kind: 'run',
        label: `Operational run ${firstEnvelope.operational.runId}`,
        truthClass: 'recorded-fact',
        reference: firstEnvelope.operational.runId,
      })
      nodes.push(run)
    }
  }

  const contract = freezeNode({
    id: `contract:${result.checkId}`,
    kind: 'contract',
    label: result.definition.rule,
    truthClass: 'recorded-fact',
    reference: result.checkId,
  })
  const claim = freezeNode({
    id: `claim:${result.signalId}`,
    kind: 'claim',
    label: `${result.status}: ${result.finding}`,
    truthClass: result.category === 'human-decision' ? 'human-decision' : 'deterministic-finding',
    reference: result.signalId,
  })
  nodes.push(contract, claim)

  let decision: ClaimLineageNode | undefined
  if (context.decision) {
    decision = freezeNode({
      id: `decision:${context.decision.id}`,
      kind: 'decision',
      label: context.decision.label,
      truthClass: 'human-decision',
      reference: context.decision.id,
    })
    nodes.push(decision)
  }

  for (const evidence of evidenceNodes) connect(edges, target, evidence, relationship)
  const evidenceTail = evidenceNodes[evidenceNodes.length - 1]
  if (evidenceTail && producer) connect(edges, evidenceTail, producer, relationship)
  if (producer && run) connect(edges, producer, run, relationship)
  const preContract = run ?? producer ?? evidenceTail ?? target
  connect(edges, preContract, contract, relationship)
  connect(edges, contract, claim, relationship === 'conflicting' ? 'conflicting' : 'verified')
  if (decision) connect(edges, claim, decision, 'inferred')

  return Object.freeze({
    nodes: Object.freeze(nodes.slice(0, MAX_NODES)),
    edges: Object.freeze(edges.filter((edge) => (
      nodes.some((node) => node.id === edge.from)
      && nodes.some((node) => node.id === edge.to)
    )).slice(0, MAX_NODES + 1)),
    gaps: Object.freeze(gaps),
    bounded: true as const,
    maxNodes: MAX_NODES,
  })
}
