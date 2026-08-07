import type {
  Dimension,
  EvidenceSourceHealth,
  Signal,
  SignalStatus,
} from '../types.ts'

export interface CheckDefinition {
  id: string
  version: 1
  dimension: Dimension
  title: string
  question: string
  importance: string
  rule: string
  inspectedInputs: readonly string[]
  outcomes: readonly SignalStatus[]
  passCondition: string
  missingCondition: string
  remediation: string
  invalidation: string
}

export interface SafeEvidenceReference {
  label: string
  reference?: string
  observedAt?: string
  sourceHealth?: EvidenceSourceHealth
}

export interface ProjectCheckResultContext {
  registryScope: string
  safeEvidence?: readonly SafeEvidenceReference[]
}

interface CheckResultBase {
  resultKey: string
  resultDiscriminator: string
  signalId: string
  checkId?: string
  assetId: string
  assetName: string
  dimension: Dimension
  status: SignalStatus
  finding: string
  owner: string
  evaluatedAt?: string
  category: NonNullable<Signal['category']>
  evidence: readonly SafeEvidenceReference[]
  inspectedInputs: readonly string[]
  belief: string
  missingEvidence: string
  passCondition: string
  remediation: string
  invalidation: string
}

export interface CatalogedCheckResult extends CheckResultBase {
  kind: 'cataloged'
  checkId: string
  definition: CheckDefinition
}

export interface UncatalogedCheckResult extends CheckResultBase {
  kind: 'uncataloged'
  definition?: undefined
}

export type CheckResultProjection = CatalogedCheckResult | UncatalogedCheckResult

function define(definition: CheckDefinition): CheckDefinition {
  return Object.freeze({
    ...definition,
    inspectedInputs: Object.freeze([...definition.inspectedInputs]),
    outcomes: Object.freeze([...definition.outcomes]),
  })
}

export const CHECK_CATALOG: readonly CheckDefinition[] = Object.freeze([
  define({
    id: 'asset.open-format.v1',
    version: 1,
    dimension: 'context',
    title: 'Open canonical format',
    question: 'Is the canonical asset stored in an open, exportable format?',
    importance: 'An open canonical copy can survive a provider or tool change.',
    rule: 'Pass when the recorded asset format is not proprietary; otherwise fail.',
    inspectedInputs: ['asset.format', 'asset.location'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record an open, exportable canonical format for the asset.',
    missingCondition: 'The registry does not provide a usable canonical format.',
    remediation: 'Export the asset to an open format and make that copy canonical.',
    invalidation: 'The result changes if the recorded canonical format or location changes.',
  }),
  define({
    id: 'asset.named-owner.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Named owner',
    question: 'Does the asset have a named owner?',
    importance: 'Findings and exceptions need an accountable destination.',
    rule: 'Pass when asset.owner is a non-empty recorded value; otherwise fail.',
    inspectedInputs: ['asset.owner'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record a named owner for the asset.',
    missingCondition: 'No owner is recorded.',
    remediation: 'Assign and record an owner.',
    invalidation: 'The result changes if the owner is removed or reassigned.',
  }),
  define({
    id: 'asset.review-freshness.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Review freshness',
    question: 'Was the asset reviewed within the configured freshness window?',
    importance: 'Old registry metadata can silently misdescribe current portability.',
    rule: 'Unknown when lastReviewed is absent; pass within the configured window; otherwise warn.',
    inspectedInputs: ['asset.lastReviewed', 'checksConfig.staleReviewDays', 'evaluationTime'],
    outcomes: ['pass', 'warn', 'unknown'],
    passCondition: 'Record a completed review within the configured freshness window.',
    missingCondition: 'No review date is recorded.',
    remediation: 'Review the asset and record the review date.',
    invalidation: 'A passing result becomes stale when the review age exceeds the configured window.',
  }),
  define({
    id: 'portability.platform-coverage.v1',
    version: 1,
    dimension: 'skills',
    title: 'Verified platform coverage',
    question: 'Is the asset verified on at least two approved platforms?',
    importance: 'A second verified platform is evidence of practical portability.',
    rule: 'Pass with two current approved-platform verifications; warn for stale or single-platform verification; fail when none are verified.',
    inspectedInputs: ['registry.platforms', 'asset.coverage[].platform', 'asset.coverage[].lastVerified', 'checksConfig.staleVerifyDays'],
    outcomes: ['pass', 'warn', 'fail', 'accepted'],
    passCondition: 'Verify retrieval or import on at least two approved platforms within the freshness window.',
    missingCondition: 'No current approved-platform verification is recorded.',
    remediation: 'Run and record import or retrieval verification on the missing or stale approved platforms.',
    invalidation: 'The result changes when approved platforms, coverage records, verification dates, or the freshness window change.',
  }),
  define({
    id: 'portability.provider-fallback.v1',
    version: 1,
    dimension: 'continuity',
    title: 'Provider dependency fallback',
    question: 'Does each provider-specific dependency name an approved fallback?',
    importance: 'An explicit fallback bounds provider lock-in.',
    rule: 'Pass for a dependency with a recorded fallback; otherwise fail.',
    inspectedInputs: ['asset.providerDependencies[].provider', 'asset.providerDependencies[].capability', 'asset.providerDependencies[].fallback'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Every provider-specific dependency records and tests an approved fallback.',
    missingCondition: 'A provider-specific dependency has no recorded fallback.',
    remediation: 'Record and test an approved fallback for every provider-specific dependency.',
    invalidation: 'The result changes when a dependency or its recorded fallback changes.',
  }),
  define({
    id: 'continuity.workflow-fallback.v1',
    version: 1,
    dimension: 'continuity',
    title: 'Workflow fallback provider',
    question: 'Does the workflow record an approved fallback provider?',
    importance: 'A named fallback makes provider concentration visible and actionable.',
    rule: 'When a primary provider is recorded, pass if fallbackProvider is recorded; otherwise fail.',
    inspectedInputs: ['asset.primaryProvider', 'asset.fallbackProvider'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record an approved fallback provider for the workflow.',
    missingCondition: 'A primary provider is recorded without a fallback provider.',
    remediation: 'Approve and record a fallback provider, then verify the workflow can use it.',
    invalidation: 'The result changes when the primary or fallback provider record changes.',
  }),
  define({
    id: 'continuity.substitution-drill.v1',
    version: 1,
    dimension: 'continuity',
    title: 'Substitution drill freshness',
    question: 'Was the workflow substitution drill run recently?',
    importance: 'A fallback is only credible when it has been exercised.',
    rule: 'Pass within the configured drill window; otherwise warn, including when no drill is recorded.',
    inspectedInputs: ['asset.lastSubstitutionDrill', 'checksConfig.drillDays', 'evaluationTime'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Run the workflow on its fallback provider within the configured drill window.',
    missingCondition: 'No substitution drill date is recorded.',
    remediation: 'Run the workflow on the fallback provider and record the result date.',
    invalidation: 'A passing result becomes stale when the drill age exceeds the configured window.',
  }),
  define({
    id: 'evidence.workflow-durability.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Durable workflow evidence',
    question: 'Does the workflow retain durable evaluation evidence?',
    importance: 'Durable evidence survives beyond chat history and supports later inspection.',
    rule: 'Pass when a linked evaluation asset or evidence entry exists; otherwise warn.',
    inspectedInputs: ['asset.dependsOn', 'linked evaluation assets', 'asset.evidence'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Link a durable evaluation asset or record a durable evidence reference.',
    missingCondition: 'No linked evaluation asset or durable evidence entry is recorded.',
    remediation: 'Export evaluation cases into a durable, versioned fixture and link it.',
    invalidation: 'The result changes if the linked evaluation asset or evidence reference is removed.',
  }),
  define({
    id: 'governance.action-authority.v1',
    version: 1,
    dimension: 'controls',
    title: 'Action authority controls',
    question: 'Does the action authority record the controls required for safe use?',
    importance: 'Authority, confirmation, reversibility, and evidence requirements bound automated action risk.',
    rule: 'Pass when required controls and evidence needs exist, confirmation is recorded when required, and automated writes are reversible.',
    inspectedInputs: ['asset.actionControl.authority', 'requiredControls', 'confirmation', 'reversible', 'evidenceNeeds'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record complete controls, confirmation behavior, reversibility, and evidence needs.',
    missingCondition: 'One or more required action-control fields or safeguards is absent.',
    remediation: 'Complete the action-control record before use.',
    invalidation: 'The result changes when authority, controls, confirmation, reversibility, or evidence needs change.',
  }),
  define({
    id: 'governance.action-reversibility.v1',
    version: 1,
    dimension: 'controls',
    title: 'Action reversibility',
    question: 'Is the governed action reversible?',
    importance: 'A rollback path limits the consequence of an incorrect action.',
    rule: 'Warn when actionControl.reversible is false.',
    inspectedInputs: ['asset.actionControl.reversible'],
    outcomes: ['warn'],
    passCondition: 'Record a tested rollback path and set the action as reversible.',
    missingCondition: 'No reversible path is recorded for the action.',
    remediation: 'Add a rollback path or require explicit risk acceptance.',
    invalidation: 'The result changes when the recorded reversibility changes.',
  }),
  define({
    id: 'governance.accepted-asset-metadata.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Accepted asset governance metadata',
    question: 'Does an accepted asset retain its required governance metadata?',
    importance: 'Acceptance without identity, rights, rationale, provenance, scope, and evidence is not auditable.',
    rule: 'Pass when stable identity, supported version, owner, decision metadata, rights evidence, and durable evidence are all recorded; otherwise fail.',
    inspectedInputs: ['asset.stableId', 'asset.supportedVersion', 'asset.owner', 'asset.acceptedAsset', 'asset.evidence'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record every required accepted-asset governance field and evidence reference.',
    missingCondition: 'At least one required accepted-asset field or evidence reference is absent.',
    remediation: 'Complete the acceptance record before treating the asset as governed.',
    invalidation: 'The result changes when any required identity, rights, decision, scope, provenance, or evidence field changes.',
  }),
  define({
    id: 'candidate.metadata-completeness.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Candidate metadata completeness',
    question: 'Does the candidate assessment record its required metadata?',
    importance: 'Source, rights, trust, and maintenance facts are prerequisites for a bounded evaluation.',
    rule: 'Pass when source, license, attribution, evidence type, trust boundary, and maintenance status are recorded; otherwise fail.',
    inspectedInputs: ['candidateTool.sourceUrl', 'license', 'attributionNotes', 'evidenceType', 'trustBoundary', 'maintenanceStatus'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Record all required candidate assessment metadata.',
    missingCondition: 'At least one required candidate metadata field is absent.',
    remediation: 'Complete source, license, attribution, evidence, trust-boundary, and maintenance fields.',
    invalidation: 'The result changes when any required candidate metadata field changes.',
  }),
  define({
    id: 'candidate.check-mapping.v1',
    version: 1,
    dimension: 'controls',
    title: 'Candidate check mapping',
    question: 'Is the candidate mapped to SancusSight dimensions and deterministic checks?',
    importance: 'An explicit mapping prevents a tool from acquiring vague or invented authority.',
    rule: 'Pass when at least one dimension and one supported check are recorded; otherwise fail.',
    inspectedInputs: ['candidateTool.dimensions', 'candidateTool.supportedChecks'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Map the candidate to at least one dimension and supported deterministic check.',
    missingCondition: 'No complete dimension and check mapping is recorded.',
    remediation: 'Record the supported dimensions and deterministic checks.',
    invalidation: 'The result changes when the candidate mapping changes.',
  }),
  define({
    id: 'candidate.data-egress.v1',
    version: 1,
    dimension: 'controls',
    title: 'Candidate data egress',
    question: 'Is candidate data egress local or explicitly reviewed?',
    importance: 'Unknown or network-required egress can cross the local evidence boundary.',
    rule: 'Pass for none-known or local-only egress; otherwise warn.',
    inspectedInputs: ['candidateTool.dataEgress', 'candidateTool.trustBoundary'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Record local-only or no-known egress after reviewing the data flow.',
    missingCondition: 'The data flow is unknown or requires network egress without a completed review.',
    remediation: 'Review data flow and sensitive fields before adoption or import automation.',
    invalidation: 'The result changes when the recorded egress or trust boundary changes.',
  }),
  define({
    id: 'candidate.bundle-readiness.v1',
    version: 1,
    dimension: 'controls',
    title: 'Candidate bundle readiness',
    question: 'Are all bundle-readiness reviews recorded?',
    importance: 'Bundling expands the trust and maintenance boundary.',
    rule: 'For bundled dependencies, pass when every fixed readiness flag is true; otherwise warn.',
    inspectedInputs: ['candidateTool.integrationLevel', 'candidateTool.bundleReadiness'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Complete every legal, attribution, trademark, update, security, data-flow, and rollback review.',
    missingCondition: 'At least one fixed bundle-readiness review is absent or incomplete.',
    remediation: 'Keep the tool external until every bundle-readiness review is complete.',
    invalidation: 'The result changes when integration level or any readiness review changes.',
  }),
  define({
    id: 'ontology.stable-identity.v1',
    version: 1,
    dimension: 'continuity',
    title: 'Ontology stable identity',
    question: 'Does the governed ontology asset have a stable identifier?',
    importance: 'Stable identity separates durable references from changing display names.',
    rule: 'Pass when asset.stableId is recorded; otherwise fail.',
    inspectedInputs: ['asset.stableId'],
    outcomes: ['pass', 'fail', 'accepted'],
    passCondition: 'Assign and record a versioned stable identifier.',
    missingCondition: 'No stable identifier is recorded.',
    remediation: 'Assign a versioned stable identifier independent of display name.',
    invalidation: 'The result changes when the stable identifier is removed or replaced.',
  }),
  define({
    id: 'ontology.producer-consumers.v1',
    version: 1,
    dimension: 'continuity',
    title: 'Ontology producer and consumers',
    question: 'Are the producing and consuming products recorded?',
    importance: 'Explicit consumers make handoff and compatibility responsibilities inspectable.',
    rule: 'Pass when a producing product and at least one consuming product are recorded; otherwise warn.',
    inspectedInputs: ['asset.producingProduct', 'asset.consumingProducts'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Record the producing product and every supported consumer.',
    missingCondition: 'The producer or consumer mapping is incomplete.',
    remediation: 'Record the producing product and supported consumers.',
    invalidation: 'The result changes when producer or consumer mappings change.',
  }),
  define({
    id: 'ontology.evidence-survival.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Ontology evidence survival',
    question: 'Do ontology evidence references survive export and handoff?',
    importance: 'Durable references keep the governed contract inspectable after a tool change.',
    rule: 'Pass when at least one asset evidence reference is recorded; otherwise warn.',
    inspectedInputs: ['asset.evidence'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Attach at least one durable evidence reference.',
    missingCondition: 'No durable evidence reference is recorded.',
    remediation: 'Attach a durable evidence reference before relying on the contract.',
    invalidation: 'The result changes when the final durable evidence reference is removed.',
  }),
  define({
    id: 'ontology.findmnemo-rename-compatibility.v1',
    version: 1,
    dimension: 'continuity',
    title: 'FindMnemo rename compatibility',
    question: 'Is FindMnemo display naming separated from legacy identifier compatibility?',
    importance: 'A product rename must not silently break stable references.',
    rule: 'Pass when the stable ID uses the findmnemo namespace and the acceptance rationale records MnemoSync compatibility; otherwise warn.',
    inspectedInputs: ['asset.sourceProduct', 'asset.name', 'asset.stableId', 'asset.acceptedAsset.decisionRationale'],
    outcomes: ['pass', 'warn'],
    passCondition: 'Record stable FindMnemo identity and legacy MnemoSync compatibility.',
    missingCondition: 'Stable identity or legacy rename compatibility is not fully recorded.',
    remediation: 'Document stable identity and legacy MnemoSync compatibility.',
    invalidation: 'The result changes when the stable namespace or recorded compatibility rationale changes.',
  }),
  define({
    id: 'evidence.binding-presence.v1',
    version: 1,
    dimension: 'evidence',
    title: 'Evidence binding presence',
    question: 'Does a configured evidence binding have an accepted normalized observation?',
    importance: 'A binding without an accepted observation is an explicit evidence gap.',
    rule: 'Unknown when no accepted evidence matches the configured source and external ID.',
    inspectedInputs: ['asset.evidenceBindings[].source', 'asset.evidenceBindings[].externalId', 'accepted evidence subject'],
    outcomes: ['unknown'],
    passCondition: 'Import an accepted normalized observation matching the configured binding.',
    missingCondition: 'No accepted normalized observation matches the configured binding.',
    remediation: 'Refresh the source or inspect unmapped and rejected evidence.',
    invalidation: 'The result changes when a matching accepted observation appears or the configured binding changes.',
  }),
])

const catalogById = new Map<string, CheckDefinition>()
for (const definition of CHECK_CATALOG) {
  if (catalogById.has(definition.id)) {
    throw new Error(`Duplicate Check Catalog definition: ${definition.id}`)
  }
  catalogById.set(definition.id, definition)
}

export function resolveCheckDefinition(checkId?: string): CheckDefinition | undefined {
  return checkId ? catalogById.get(checkId) : undefined
}

export function searchCheckDefinitions(query: string): readonly CheckDefinition[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return CHECK_CATALOG
  return CHECK_CATALOG.filter((definition) => [
    definition.id,
    definition.title,
    definition.question,
    definition.importance,
    definition.rule,
    definition.passCondition,
    definition.remediation,
    definition.invalidation,
    ...definition.inspectedInputs,
  ].some((value) => value.toLocaleLowerCase().includes(normalized)))
}

function signalCategory(signal: Signal): NonNullable<Signal['category']> {
  if (signal.category) return signal.category
  if (signal.status === 'accepted') return 'human-decision'
  return 'deterministic-finding'
}

export function projectCheckResult(
  signal: Signal,
  context: ProjectCheckResultContext,
): CheckResultProjection {
  const definition = resolveCheckDefinition(signal.checkId)
  const category = signalCategory(signal)
  const evidence = Object.freeze([
    ...(context.safeEvidence ?? []),
    ...(!context.safeEvidence?.length && signal.evidence
      ? [{
          label: signal.evidence,
          ...(signal.evidenceRef ? { reference: signal.evidenceRef } : {}),
          ...(signal.observedAt ? { observedAt: signal.observedAt } : {}),
        }]
      : []),
  ].slice(0, 2).map((reference) => Object.freeze({ ...reference })))
  const resultDiscriminator = signal.id
  const resultKey = `${context.registryScope}:${signal.assetId}:${signal.checkId ?? 'uncataloged'}:${resultDiscriminator}`
  const common = {
    resultKey,
    resultDiscriminator,
    signalId: signal.id,
    ...(signal.checkId ? { checkId: signal.checkId } : {}),
    assetId: signal.assetId,
    assetName: signal.assetName,
    dimension: signal.dimension,
    status: signal.status,
    finding: signal.finding,
    owner: signal.owner,
    ...(signal.evaluatedAt ? { evaluatedAt: signal.evaluatedAt } : {}),
    category,
    evidence,
  }

  if (!definition) {
    return Object.freeze({
      ...common,
      kind: 'uncataloged' as const,
      inspectedInputs: Object.freeze([]),
      belief: 'This is a source-qualified observation, not a cataloged SancusSight deterministic check.',
      missingEvidence: 'No stable Check Catalog definition is registered for this observation.',
      passCondition: 'No cataloged passing condition is available.',
      remediation: 'No cataloged remediation contract is available.',
      invalidation: 'No cataloged invalidation contract is available.',
    })
  }

  return Object.freeze({
    ...common,
    kind: 'cataloged' as const,
    checkId: definition.id,
    definition,
    inspectedInputs: definition.inspectedInputs,
    belief: `SancusSight deterministically applied ${definition.id} to the named recorded inputs. This verifies the rule binding, not the external truth of those inputs.`,
    missingEvidence: signal.status === 'unknown' || category === 'missing-evidence'
      ? definition.missingCondition
      : 'No required input gap was identified for this recorded result.',
    passCondition: definition.passCondition,
    remediation: definition.remediation,
    invalidation: definition.invalidation,
  })
}
