import type { Registry, Asset, Signal, DimensionRollup, Dimension, ExitTestResult, OntologyExitTestResult, CoverageEntry, Platform } from '../types.ts'
import { CHECKS_CONFIG, DIMENSION_LABELS } from '../types.ts'

// ─── Helpers ───────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  return Math.floor((Date.parse(b) - Date.parse(a)) / 86400000)
}

function daysAgo(date: string, today: string): number {
  return daysBetween(date, today)
}

function dimensionFor(kind: Asset['kind']): Dimension {
  switch (kind) {
    case 'context':
    case 'intent-context':
    case 'prompt-template': return 'context'
    case 'skill': return 'skills'
    case 'workflow': return 'continuity'
    case 'control': return 'controls'
    case 'evaluation': return 'evidence'
    case 'ontology-object':
    case 'ontology-link':
    case 'schema': return 'context'
    case 'ontology-action': return 'controls'
    case 'consumer-adapter': return 'continuity'
    case 'evidence-contract':
    case 'candidate-tool':
    case 'accepted-asset': return 'evidence'
    default: return 'evidence'
  }
}

function acceptRisk(signal: Signal, asset: Asset, today: string): Signal {
  if (signal.status !== 'fail') return signal
  if (!asset.acceptedRisk) return signal
  if (Date.parse(asset.acceptedRisk.expires) < Date.parse(today)) return signal
  return {
    ...signal,
    status: 'accepted',
    finding: `${signal.finding} — accepted by ${asset.acceptedRisk.owner} until ${asset.acceptedRisk.expires}: ${asset.acceptedRisk.note}`,
    action: `Re-decide or remediate before ${asset.acceptedRisk.expires}`,
  }
}

// ─── Signal generator per asset ────────────────────────

export function evaluateAsset(asset: Asset, registry: Registry, today: string): Signal[] {
  const signals: Signal[] = []
  const platforms = new Set(registry.platforms)
  const tagLast = (checkId: string) => {
    const index = signals.length - 1
    signals[index] = { ...signals[index], checkId, evaluatedAt: today }
  }

  // 1. Format
  signals.push(asset.format === 'proprietary'
    ? { id: `${asset.id}:format`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'fail', condition: 'Canonical copy is stored in an open, exportable format', finding: `Canonical form is provider-proprietary (${asset.location})`, evidence: 'Registry format field = proprietary', owner: asset.owner ?? 'unowned', action: 'Export to an open format and make that copy canonical' }
    : { id: `${asset.id}:format`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Canonical copy is stored in an open, exportable format', finding: `Stored as ${asset.format} at ${asset.location}`, evidence: 'Registry format field', owner: asset.owner ?? 'unowned' }
  )
  tagLast('asset.open-format.v1')

  // 2. Owner
  signals.push(asset.owner
    ? { id: `${asset.id}:owner`, dimension: 'evidence' as Dimension, assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Asset has a named owner', finding: `Owned by ${asset.owner}`, evidence: 'Registry owner field', owner: asset.owner }
    : { id: `${asset.id}:owner`, dimension: 'evidence' as Dimension, assetId: asset.id, assetName: asset.name, status: 'fail', condition: 'Asset has a named owner', finding: 'No owner recorded — exceptions on this asset have nowhere to go', evidence: 'Registry owner field is empty', owner: 'unowned', action: 'Assign an owner' }
  )
  tagLast('asset.named-owner.v1')

  // 3. Review freshness
  if (!asset.lastReviewed) {
    signals.push({ id: `${asset.id}:review`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'unknown', condition: `Reviewed by a human within ${CHECKS_CONFIG.staleReviewDays} days`, finding: 'Never reviewed (no review date recorded)', evidence: 'Registry lastReviewed field is empty', owner: asset.owner ?? 'unowned', action: 'Review the asset and record the date' })
  } else {
    const d = daysAgo(asset.lastReviewed, today)
    signals.push(d <= CHECKS_CONFIG.staleReviewDays
      ? { id: `${asset.id}:review`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'pass', condition: `Reviewed by a human within ${CHECKS_CONFIG.staleReviewDays} days`, finding: `Reviewed ${d} days ago`, evidence: `lastReviewed = ${asset.lastReviewed}`, owner: asset.owner ?? 'unowned' }
      : { id: `${asset.id}:review`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'warn', condition: `Reviewed by a human within ${CHECKS_CONFIG.staleReviewDays} days`, finding: `Stale — last reviewed ${d} days ago`, evidence: `lastReviewed = ${asset.lastReviewed}`, owner: asset.owner ?? 'unowned', action: 'Re-review; stale context silently degrades every agent that loads it' }
    )
  }
  tagLast('asset.review-freshness.v1')

  // 4. Coverage (skip for workflows)
  if (asset.kind !== 'workflow' && asset.kind !== 'candidate-tool') {
    const shared = asset.coverage.filter(c => platforms.has(c.platform))
    const verified = shared.filter(c => c.lastVerified)
    if (verified.length >= 2) {
      const stale = verified.filter(c => daysAgo(c.lastVerified!, today) > CHECKS_CONFIG.staleVerifyDays)
      signals.push(stale.length === 0
        ? { id: `${asset.id}:coverage`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Shared and verified on 2+ approved platforms', finding: `Verified on ${verified.map(c => c.platform).join(', ')}`, evidence: 'Coverage entries with lastVerified dates', owner: asset.owner ?? 'unowned' }
        : { id: `${asset.id}:coverage`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'warn', condition: 'Shared and verified on 2+ approved platforms', finding: `Verified on ${verified.length} platforms but ${stale.map(c => c.platform).join(', ')} not re-verified in ${CHECKS_CONFIG.staleVerifyDays} days`, evidence: 'Coverage entries with lastVerified dates', owner: asset.owner ?? 'unowned', action: 'Re-run the import/retrieval test on the stale platforms' }
      )
    } else if (verified.length === 1) {
      signals.push({ id: `${asset.id}:coverage`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'warn', condition: 'Shared and verified on 2+ approved platforms', finding: `Only verified on ${verified[0].platform} — single-platform asset`, evidence: 'Coverage entries with lastVerified dates', owner: asset.owner ?? 'unowned', action: 'Import and verify on a second approved platform' })
    } else {
      signals.push({ id: `${asset.id}:coverage`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: shared.length > 0 ? 'fail' : 'fail', condition: 'Shared and verified on 2+ approved platforms', finding: shared.length > 0 ? 'Shared but never verified anywhere — sharing without a retrieval test is a hope, not a control' : 'Not shared with any approved platform', evidence: 'Coverage entries', owner: asset.owner ?? 'unowned', action: 'Run an import/retrieval test on at least one approved platform' })
    }
    tagLast('portability.platform-coverage.v1')
  }

  // 5. Provider dependencies
  for (const dep of asset.providerDependencies) {
    signals.push(dep.fallback
      ? { id: `${asset.id}:dep-${dep.provider}-${dep.capability}`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Every provider-specific dependency names an approved fallback', finding: `Depends on ${dep.provider} (${dep.capability}); fallback: ${dep.fallback}`, evidence: 'Registry providerDependencies', owner: asset.owner ?? 'unowned' }
      : { id: `${asset.id}:dep-${dep.provider}-${dep.capability}`, dimension: dimensionFor(asset.kind), assetId: asset.id, assetName: asset.name, status: 'fail', condition: 'Every provider-specific dependency names an approved fallback', finding: `Locked to ${dep.provider}: ${dep.capability} has no fallback`, evidence: 'Registry providerDependencies', owner: asset.owner ?? 'unowned', action: `Name and test an alternative to ${dep.provider}'s ${dep.capability}` }
    )
    tagLast('portability.provider-fallback.v1')
  }

  // 6. Workflow-specific checks
  if (asset.kind === 'workflow') {
    if (asset.primaryProvider && !asset.fallbackProvider) {
      signals.push({ id: `${asset.id}:concentration`, dimension: 'continuity', assetId: asset.id, assetName: asset.name, status: 'fail', condition: 'Workflow has an approved fallback provider', finding: `Concentrated on ${asset.primaryProvider} with no fallback`, evidence: 'Registry primaryProvider/fallbackProvider', owner: asset.owner ?? 'unowned', action: 'Approve and record a fallback provider' })
      tagLast('continuity.workflow-fallback.v1')
    } else if (asset.primaryProvider && asset.fallbackProvider) {
      signals.push({ id: `${asset.id}:concentration`, dimension: 'continuity', assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Workflow has an approved fallback provider', finding: `Primary ${asset.primaryProvider}, fallback ${asset.fallbackProvider}`, evidence: 'Registry primaryProvider/fallbackProvider', owner: asset.owner ?? 'unowned' })
      tagLast('continuity.workflow-fallback.v1')
    }
    if (!asset.lastSubstitutionDrill) {
      signals.push({ id: `${asset.id}:drill`, dimension: 'continuity', assetId: asset.id, assetName: asset.name, status: 'warn', condition: `Substitution drill run within ${CHECKS_CONFIG.drillDays} days`, finding: 'Never drilled — the fallback is untested paper', evidence: 'Registry lastSubstitutionDrill is empty', owner: asset.owner ?? 'unowned', action: 'Run the workflow once on the fallback provider and record the result' })
    } else {
      const d = daysAgo(asset.lastSubstitutionDrill, today)
      signals.push(d <= CHECKS_CONFIG.drillDays
        ? { id: `${asset.id}:drill`, dimension: 'continuity', assetId: asset.id, assetName: asset.name, status: 'pass', condition: `Substitution drill run within ${CHECKS_CONFIG.drillDays} days`, finding: `Last drilled ${d} days ago`, evidence: `lastSubstitutionDrill = ${asset.lastSubstitutionDrill}`, owner: asset.owner ?? 'unowned' }
        : { id: `${asset.id}:drill`, dimension: 'continuity', assetId: asset.id, assetName: asset.name, status: 'warn', condition: `Substitution drill run within ${CHECKS_CONFIG.drillDays} days`, finding: `Last drill was ${d} days ago`, evidence: `lastSubstitutionDrill = ${asset.lastSubstitutionDrill}`, owner: asset.owner ?? 'unowned', action: 'Re-run the substitution drill' }
      )
    }
    tagLast('continuity.substitution-drill.v1')

    // Evidence for workflow
    const evidenceAssets = (asset.dependsOn ?? [])
      .map(id => registry.assets.find(a => a.id === id))
      .filter(a => a && a.kind === 'evaluation')
    if (evidenceAssets.length === 0 && asset.evidence.length === 0) {
      signals.push({ id: `${asset.id}:evidence`, dimension: 'evidence', assetId: asset.id, assetName: asset.name, status: 'warn', condition: 'Workflow has durable evaluation evidence', finding: 'No evaluation asset linked and no evidence recorded — outcomes exist only in chat history', evidence: 'Registry dependsOn/evidence', owner: asset.owner ?? 'unowned', action: 'Export evaluation cases into a durable, versioned fixture' })
    } else {
      const allEvidence = [...asset.evidence, ...evidenceAssets.flatMap(a => a!.evidence)]
        .sort((a, b) => b.date.localeCompare(a.date))
      const latest = allEvidence[0]
      signals.push({ id: `${asset.id}:evidence`, dimension: 'evidence', assetId: asset.id, assetName: asset.name, status: 'pass', condition: 'Workflow has durable evaluation evidence', finding: latest ? `Latest evidence: ${latest.label} (${latest.date})` : `Evaluation asset linked: ${evidenceAssets.map(a => a!.name).join(', ')}`, evidence: 'Registry dependsOn/evidence', owner: asset.owner ?? 'unowned' })
    }
    tagLast('evidence.workflow-durability.v1')
  }

  if (asset.actionControl) {
    const control = asset.actionControl
    const controlsComplete = control.requiredControls.length > 0 && control.evidenceNeeds.length > 0
    const confirmationComplete = control.authority !== 'user-confirmed-write' || control.confirmation.trim().length > 0
    const highRiskSafe = control.authority !== 'automated-write' || (control.reversible && controlsComplete)
    signals.push({
      id: `${asset.id}:action-authority`,
      dimension: 'controls',
      assetId: asset.id,
      assetName: asset.name,
      status: controlsComplete && confirmationComplete && highRiskSafe ? 'pass' : 'fail',
      condition: 'Action authority has controls, confirmation, reversibility, and evidence requirements',
      finding: controlsComplete && confirmationComplete && highRiskSafe
        ? `${control.authority} authority is explicit; reversible: ${control.reversible ? 'yes' : 'no'}`
        : `${control.authority} authority is missing required safeguards or evidence`,
      evidence: `actionControl: ${control.requiredControls.length} controls, ${control.evidenceNeeds.length} evidence needs`,
      owner: asset.owner ?? 'unowned',
      action: controlsComplete && confirmationComplete && highRiskSafe ? undefined : 'Record controls, confirmation behavior, reversibility, and required evidence before use',
    })
    tagLast('governance.action-authority.v1')
    if (!control.reversible) {
      signals.push({
        id: `${asset.id}:action-reversibility`, dimension: 'controls', assetId: asset.id, assetName: asset.name, status: 'warn',
        condition: 'High-risk actions are reversible', finding: 'Action is recorded as irreversible', evidence: 'actionControl.reversible = false',
        owner: asset.owner ?? 'unowned', action: 'Add a rollback path or require explicit risk acceptance',
      })
      tagLast('governance.action-reversibility.v1')
    }
  }

  if (asset.acceptedAsset) {
    const accepted = asset.acceptedAsset
    const identityComplete = Boolean(asset.stableId && asset.supportedVersion && asset.owner)
    const decisionComplete = Boolean(accepted.decisionRationale && accepted.sourceProvenance && accepted.scope)
    const rightsComplete = Boolean(accepted.license || accepted.ownershipEvidence)
    const evidenceComplete = asset.evidence.length > 0
    signals.push({
      id: `${asset.id}:accepted-governance`, dimension: 'evidence', assetId: asset.id, assetName: asset.name,
      status: identityComplete && decisionComplete && rightsComplete && evidenceComplete ? 'pass' : 'fail',
      condition: 'Accepted asset retains identity, rights, rationale, provenance, scope, and evidence',
      finding: identityComplete && decisionComplete && rightsComplete && evidenceComplete
        ? `Accepted ${asset.stableId} with governed provenance and review evidence`
        : 'Acceptance record has an identity, rights, rationale, provenance, scope, or evidence gap',
      evidence: 'stableId, supportedVersion, acceptedAsset metadata, and evidence entries', owner: asset.owner ?? 'unowned',
      action: identityComplete && decisionComplete && rightsComplete && evidenceComplete ? undefined : 'Complete the acceptance record before treating the asset as governed',
    })
    tagLast('governance.accepted-asset-metadata.v1')
  }

  if (asset.candidateTool) {
    const tool = asset.candidateTool
    const metadataComplete = Boolean(tool.sourceUrl && tool.license && tool.attributionNotes && tool.evidenceType && tool.trustBoundary && tool.maintenanceStatus)
    signals.push({
      id: `${asset.id}:candidate-metadata`, dimension: 'evidence', assetId: asset.id, assetName: asset.name,
      status: metadataComplete ? 'pass' : 'fail', condition: 'Candidate assessment records source, license, attribution, evidence, trust boundary, and maintenance status',
      finding: metadataComplete ? `${tool.license}; ${tool.assessmentStatus} assessment; disposition: ${tool.disposition}` : 'Candidate assessment metadata is incomplete',
      evidence: 'candidateTool assessment metadata', owner: asset.owner ?? 'unowned',
      action: metadataComplete ? undefined : 'Complete source, license, attribution, evidence, trust-boundary, and maintenance fields',
    })
    tagLast('candidate.metadata-completeness.v1')
    const mappingComplete = tool.dimensions.length > 0 && tool.supportedChecks.length > 0
    signals.push({
      id: `${asset.id}:candidate-mapping`, dimension: 'controls', assetId: asset.id, assetName: asset.name,
      status: mappingComplete ? 'pass' : 'fail', condition: 'Candidate maps to SancusSight dimensions and supported checks',
      finding: mappingComplete ? `Supports ${tool.supportedChecks.join(', ')}` : 'No evidence or control mapping is recorded',
      evidence: 'candidateTool.dimensions and candidateTool.supportedChecks', owner: asset.owner ?? 'unowned',
      action: mappingComplete ? undefined : 'Map the tool to at least one dimension and deterministic check',
    })
    tagLast('candidate.check-mapping.v1')
    const egressReviewed = tool.dataEgress === 'none-known' || tool.dataEgress === 'local-only'
    signals.push({
      id: `${asset.id}:candidate-egress`, dimension: 'controls', assetId: asset.id, assetName: asset.name,
      status: egressReviewed ? 'pass' : 'warn', condition: 'Candidate data flow is local or explicitly reviewed',
      finding: `Recorded data egress: ${tool.dataEgress}; trust boundary: ${tool.trustBoundary}`,
      evidence: 'candidateTool.dataEgress and candidateTool.trustBoundary', owner: asset.owner ?? 'unowned',
      action: egressReviewed ? undefined : 'Review data flow and sensitive fields before adoption or import automation',
    })
    tagLast('candidate.data-egress.v1')
    if (tool.integrationLevel === 'bundled-dependency') {
      const readiness = tool.bundleReadiness
      const complete = Boolean(readiness && Object.values(readiness).every(Boolean))
      signals.push({
        id: `${asset.id}:bundle-readiness`, dimension: 'controls', assetId: asset.id, assetName: asset.name,
        status: complete ? 'pass' : 'warn', condition: 'Bundling requires complete legal, update, security, data-flow, and rollback review',
        finding: complete ? 'Bundle-readiness record is complete, but bundling still requires a later approved design' : 'Bundle readiness is incomplete; govern outputs first',
        evidence: 'candidateTool.bundleReadiness', owner: asset.owner ?? 'unowned',
        action: complete ? 'Return to SDD design approval before bundling' : 'Keep this tool external and record missing readiness reviews',
      })
      tagLast('candidate.bundle-readiness.v1')
    }
  }

  if (asset.ontologyCategory || asset.acceptedAsset) {
    signals.push({
      id: `${asset.id}:ontology-identity`, dimension: 'continuity', assetId: asset.id, assetName: asset.name,
      status: asset.stableId ? 'pass' : 'fail', condition: 'Ontology asset has a stable identifier independent of product display name',
      finding: asset.stableId ? `Stable ID: ${asset.stableId}` : 'No stable identifier recorded', evidence: 'Asset stableId field',
      owner: asset.owner ?? 'unowned', action: asset.stableId ? undefined : 'Assign a versioned stable identifier',
    })
    tagLast('ontology.stable-identity.v1')
    signals.push({
      id: `${asset.id}:ontology-consumers`, dimension: 'continuity', assetId: asset.id, assetName: asset.name,
      status: asset.producingProduct && asset.consumingProducts?.length ? 'pass' : 'warn',
      condition: 'Ontology producer and consumers are recorded',
      finding: asset.producingProduct && asset.consumingProducts?.length
        ? `${asset.producingProduct} -> ${asset.consumingProducts.join(', ')}`
        : 'Producer or consumer mapping is incomplete',
      evidence: 'producingProduct and consumingProducts fields', owner: asset.owner ?? 'unowned',
      action: asset.producingProduct && asset.consumingProducts?.length ? undefined : 'Record the producing product and supported consumers',
    })
    tagLast('ontology.producer-consumers.v1')
    signals.push({
      id: `${asset.id}:ontology-evidence`, dimension: 'evidence', assetId: asset.id, assetName: asset.name,
      status: asset.evidence.length > 0 ? 'pass' : 'warn', condition: 'Ontology evidence references survive export and handoff',
      finding: asset.evidence.length > 0 ? `${asset.evidence.length} durable evidence reference(s) recorded` : 'No durable evidence reference is recorded',
      evidence: 'Asset evidence entries', owner: asset.owner ?? 'unowned',
      action: asset.evidence.length > 0 ? undefined : 'Attach a durable evidence reference before relying on this contract',
    })
    tagLast('ontology.evidence-survival.v1')
    if (asset.sourceProduct === 'FindMnemo' || asset.name.includes('FindMnemo')) {
      const renameCompatible = Boolean(asset.stableId?.startsWith('findmnemo:') && asset.acceptedAsset?.decisionRationale.includes('MnemoSync'))
      signals.push({
        id: `${asset.id}:findmnemo-rename`, dimension: 'continuity', assetId: asset.id, assetName: asset.name,
        status: renameCompatible ? 'pass' : 'warn', condition: 'FindMnemo display naming is separated from legacy identifier compatibility',
        finding: renameCompatible ? 'Stable FindMnemo identity and legacy MnemoSync compatibility are documented' : 'Legacy rename compatibility is not fully evidenced',
        evidence: 'stableId and acceptedAsset.decisionRationale', owner: asset.owner ?? 'unowned',
        action: renameCompatible ? undefined : 'Document stable identity and legacy MnemoSync compatibility',
      })
      tagLast('ontology.findmnemo-rename-compatibility.v1')
    }
  }

  return signals.map(s => acceptRisk(s, asset, today))
}

export function evaluateAll(registry: Registry, today: string): Signal[] {
  const signals: Signal[] = []
  for (const asset of registry.assets) {
    signals.push(...evaluateAsset(asset, registry, today))
  }
  return signals
}

export function rollup(signals: Signal[]): DimensionRollup[] {
  const dims: Dimension[] = ['context', 'skills', 'continuity', 'controls', 'evidence']
  return dims.map(dimension => {
    const s = signals.filter(s => s.dimension === dimension)
    return {
      dimension,
      pass: s.filter(x => x.status === 'pass').length,
      warn: s.filter(x => x.status === 'warn').length,
      fail: s.filter(x => x.status === 'fail').length,
      accepted: s.filter(x => x.status === 'accepted').length,
      unknown: s.filter(x => x.status === 'unknown').length,
    }
  })
}

export function flaggedSignals(signals: Signal[]): Signal[] {
  const order: Record<string, number> = { fail: 0, warn: 1, unknown: 2, accepted: 3, pass: 4 }
  return signals
    .filter(s => s.status !== 'pass')
    .sort((a, b) => (order[a.status] - order[b.status]) || a.assetName.localeCompare(b.assetName))
}

export { groupFlaggedByAsset } from './findings.ts'

// ─── Exit test ─────────────────────────────────────────

export function runExitTest(registry: Registry, workflowId: string, targetPlatform: Platform, today: string, evidenceSignals: Signal[] = []): ExitTestResult | undefined {
  const workflow = registry.assets.find(a => a.id === workflowId && a.kind === 'workflow')
  if (!workflow) return undefined

  const items: ExitTestResult['items'] = []

  function checkAsset(asset: Asset, platform: Platform): ExitTestResult['items'][0] {
    const dep = asset.providerDependencies.find(d => d.provider === platform && !d.fallback)
    if (dep) return { assetId: asset.id, assetName: asset.name, status: 'locked', note: `Depends on ${dep.provider}'s ${dep.capability} with no fallback` }
    if (asset.format === 'proprietary') return { assetId: asset.id, assetName: asset.name, status: 'locked', note: 'Canonical copy is provider-proprietary; nothing portable to move' }
    const cov = asset.coverage.find(c => c.platform === platform)
    if (!cov) return { assetId: asset.id, assetName: asset.name, status: 'missing', note: `Not shared with ${platform}` }
    if (!cov.lastVerified) return { assetId: asset.id, assetName: asset.name, status: 'unverified', note: `Shared with ${platform} but never verified there` }
    const d = daysAgo(cov.lastVerified, today)
    if (d > CHECKS_CONFIG.staleVerifyDays) return { assetId: asset.id, assetName: asset.name, status: 'unverified', note: `Last verified on ${platform} ${d} days ago (stale)` }
    return { assetId: asset.id, assetName: asset.name, status: 'ok', note: `Verified on ${platform} ${d} days ago` }
  }

  // Check workflow's own dependencies
  const wfDep = workflow.providerDependencies.find(d => d.provider === workflow.primaryProvider && !d.fallback)
  if (wfDep) {
    items.unshift({ assetId: workflow.id, assetName: `${workflow.name} (workflow itself)`, status: 'locked', note: `Depends on ${wfDep.provider}'s ${wfDep.capability} with no fallback` })
  }

  // Check each dependency asset
  for (const depId of workflow.dependsOn ?? []) {
    const dep = registry.assets.find(a => a.id === depId)
    if (dep) items.push(checkAsset(dep, targetPlatform))
  }

  const relevantAssets = new Set([workflow.id, ...(workflow.dependsOn ?? [])])
  for (const signal of evidenceSignals.filter((item) => relevantAssets.has(item.assetId) && (item.category === 'recorded-fact' || item.category === 'missing-evidence'))) {
    items.push({
      assetId: signal.assetId,
      assetName: `${signal.assetName} evidence`,
      status: signal.status === 'fail' ? 'locked' : signal.status === 'pass' ? 'ok' : 'unverified',
      note: `${signal.finding} Reference: ${signal.evidenceRef ?? signal.evidence}`,
    })
  }

  const verdict = items.some(i => i.status === 'locked' || i.status === 'missing') ? 'breaks'
    : items.some(i => i.status === 'unverified') ? 'degrades'
    : 'survives'

  return { workflowId: workflow.id, workflowName: workflow.name, targetPlatform, verdict, items }
}

export function getWorkflows(registry: Registry) {
  return registry.assets.filter(a => a.kind === 'workflow')
}

export function runOntologyExitTest(registry: Registry): OntologyExitTestResult {
  const governed = registry.assets.filter(asset => asset.ontologyCategory || asset.acceptedAsset)
  const findMnemo = governed.find(asset => asset.sourceProduct === 'FindMnemo' || asset.name.includes('FindMnemo'))
  const items: OntologyExitTestResult['items'] = []

  items.push({
    id: 'schema-export', label: 'Schema export', riskType: 'technical',
    status: registry.schemaVersion === 2 && governed.every(asset => asset.format !== 'proprietary') ? 'ok' : 'locked',
    note: registry.schemaVersion === 2 && governed.every(asset => asset.format !== 'proprietary')
      ? 'Versioned v2 records use open formats' : 'A governed record lacks a versioned, open export form',
  })
  items.push({
    id: 'stable-identities', label: 'Stable IDs', riskType: 'technical',
    status: governed.length > 0 && governed.every(asset => asset.stableId) ? 'ok' : 'missing',
    note: governed.length > 0 && governed.every(asset => asset.stableId) ? 'Every governed ontology record has a stable ID' : 'One or more governed records lack a stable ID',
  })
  items.push({
    id: 'evidence-portability', label: 'Evidence references', riskType: 'technical',
    status: governed.length > 0 && governed.every(asset => asset.evidence.length > 0) ? 'ok' : 'unverified',
    note: governed.length > 0 && governed.every(asset => asset.evidence.length > 0) ? 'Evidence references are retained in the local registry' : 'One or more governed records lacks durable evidence',
  })
  const actions = governed.filter(asset => asset.actionControl)
  items.push({
    id: 'action-handoff', label: 'Action handoff reversibility', riskType: 'technical',
    status: actions.length > 0 && actions.every(asset => asset.actionControl?.reversible) ? 'ok' : 'locked',
    note: actions.length > 0 && actions.every(asset => asset.actionControl?.reversible) ? 'Governed actions have reversible handoffs' : 'An action is missing or lacks a reversible handoff',
  })
  items.push({
    id: 'consumer-compatibility', label: 'Consumer compatibility', riskType: 'technical',
    status: governed.length > 0 && governed.every(asset => asset.consumingProducts?.length) ? 'ok' : 'unverified',
    note: governed.length > 0 && governed.every(asset => asset.consumingProducts?.length) ? 'Producing and consuming products are explicitly mapped' : 'Consumer compatibility is not fully recorded',
  })
  const renameCompatible = Boolean(findMnemo?.stableId?.startsWith('findmnemo:') && findMnemo.acceptedAsset?.decisionRationale.includes('MnemoSync'))
  items.push({
    id: 'findmnemo-rename', label: 'FindMnemo rename compatibility', riskType: 'product',
    status: renameCompatible ? 'ok' : 'unverified',
    note: renameCompatible ? 'Display-name change is separated from stable identity; legacy MnemoSync compatibility is documented' : 'FindMnemo legacy naming compatibility is not fully evidenced',
  })

  const verdict = items.some(item => item.status === 'locked' || item.status === 'missing') ? 'breaks'
    : items.some(item => item.status === 'unverified') ? 'degrades'
    : 'survives'
  return { scenarioName: 'Personal ontology and FindMnemo compatibility', verdict, items }
}

// ─── Coverage matrix helpers ───────────────────────────

export function getCoverageGlyph(asset: Asset, platform: string, today: string): { glyph: string; title: string; tone: 'navy' | 'moss' | 'rust' | 'amber' | 'slate' } {
  if (asset.kind === 'workflow') {
    if (asset.primaryProvider === platform) return { glyph: 'PRI', title: 'Primary provider', tone: 'navy' }
    if (asset.fallbackProvider === platform) return { glyph: 'FBK', title: 'Fallback provider', tone: 'moss' }
    return { glyph: '·', title: 'Not applicable', tone: 'slate' }
  }
  const cov = asset.coverage.find(c => c.platform === platform)
  if (!cov) return { glyph: '✕', title: 'Not shared', tone: 'rust' }
  if (!cov.lastVerified) return { glyph: '?', title: 'Shared, never verified', tone: 'amber' }
  const d = daysAgo(cov.lastVerified, today)
  if (d > CHECKS_CONFIG.staleVerifyDays) return { glyph: '!', title: `Verified ${d}d ago (stale)`, tone: 'amber' }
  return { glyph: '✓', title: `Verified ${d}d ago`, tone: 'moss' }
}

// ─── Share card markdown generator ─────────────────────

export function generateShareCard(registry: Registry, signals: Signal[], today: string): string {
  const rolls = rollup(signals)
  const lines: string[] = []
  const isDemo = registry.provenance?.mode === 'demo'
  lines.push(`# ${isDemo ? 'Demo data - ' : ''}Portability posture - ${today}`)
  lines.push('')
  lines.push(`**Source:** ${isDemo ? 'Synthetic demonstration data' : 'Local registry data'}`)
  lines.push('')
  lines.push(`${registry.assets.length} assets registered across ${registry.platforms.length} approved platforms.`)
  lines.push('')
  lines.push('| Dimension | Pass | Warn | Fail | Accepted | Unknown |')
  lines.push('|---|---|---|---|---|---|')
  for (const r of rolls) {
    lines.push(`| ${DIMENSION_LABELS[r.dimension]} | ${r.pass} | ${r.warn} | ${r.fail} | ${r.accepted} | ${r.unknown} |`)
  }
  lines.push('')
  lines.push('## Exit tests (workflow names redacted)')
  const workflows = getWorkflows(registry)
  workflows.forEach((wf, i) => {
    const fallback = wf.fallbackProvider ?? registry.platforms.find(p => p !== wf.primaryProvider)
    if (!fallback) return
    const result = runExitTest(registry, wf.id, fallback, today)
    if (result) lines.push(`- Workflow ${String.fromCharCode(65 + i)} → fallback platform: **${result.verdict}**`)
  })
  lines.push('')
  lines.push('_Statuses reflect deterministic checks of registry metadata (formats, coverage, verification dates, fallbacks, owners) — not model behavior, security posture or a compliance opinion._')
  lines.push(`_Generated locally by SancusSight from ${isDemo ? 'synthetic demo data' : 'a local registry'}. No asset content leaves the browser._`)
  return lines.join('\n')
}
