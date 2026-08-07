import { useEffect, useMemo, useRef, useState } from 'react'
import type { Asset, ConnectionNotice, Registry as RegistryData, RegistrySession, Signal } from '../types'
import {
  buildAssetCatalogIndex,
  CATALOG_FACET_KEYS,
  queryAssetCatalog,
  type AssetCatalogEntry,
  type CatalogFacetKey,
} from '../lib/asset-catalog'
import { ABSENT_FIELD, formatRecordedTimestamp } from '../lib/format'
import { getCoverageGlyph } from '../lib/registry'
import { AssetVersionHistory } from './AssetVersionHistory'
import { Card, Eyebrow, StatusBadge } from './Shared'
import { SourceWriteStrip } from './SourceWriteStrip'

const KIND_ORDER = [
  'ontology-object', 'ontology-link', 'ontology-action', 'schema', 'evidence-contract', 'consumer-adapter',
  'accepted-asset', 'candidate-tool', 'context', 'intent-context', 'prompt-template', 'skill', 'workflow', 'control', 'evaluation',
]

type NarrowView = 'catalog' | 'passport'
type CatalogSelections = Partial<Record<CatalogFacetKey, readonly string[]>>

interface Props {
  registry: RegistryData
  session: RegistrySession
  sourceWriteFeedback?: ConnectionNotice
  onSaveSource: () => void
  today: string
  selectedId?: string
  signals: Signal[]
  onSelect: (id?: string) => void
  onOpenCheck: (signal: Signal) => void
  onReview: (id: string) => void
  onVerify: (id: string, platform: string) => void
  onDrill: (id: string) => void
  onRecordVersion: (id: string) => Promise<'recorded' | 'deduplicated'>
  onAssignVersionAlias: (id: string, name: string, versionId: string) => void
  onRemoveVersionAlias: (id: string, name: string) => void
}

function viewportIsNarrow(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches
}

export function Registry({
  registry,
  session,
  sourceWriteFeedback,
  onSaveSource,
  today,
  selectedId,
  signals,
  onSelect,
  onOpenCheck,
  onReview,
  onVerify,
  onDrill,
  onRecordVersion,
  onAssignVersionAlias,
  onRemoveVersionAlias,
}: Props) {
  const [query, setQuery] = useState('')
  const [facetSelections, setFacetSelections] = useState<CatalogSelections>({})
  const [isNarrow, setIsNarrow] = useState(viewportIsNarrow)
  const [narrowView, setNarrowView] = useState<NarrowView>(() => viewportIsNarrow() && selectedId ? 'passport' : 'catalog')
  const [focusNotice, setFocusNotice] = useState('')
  const rowButtons = useRef(new Map<string, HTMLButtonElement>())
  const originatingAssetId = useRef<string | undefined>(undefined)
  const pendingReturnAssetId = useRef<string | undefined>(undefined)
  const passportHeading = useRef<HTMLHeadingElement>(null)
  const catalogHeading = useRef<HTMLHeadingElement>(null)
  const clearCriteriaButton = useRef<HTMLButtonElement>(null)

  const catalogIndex = useMemo(
    () => buildAssetCatalogIndex(registry.assets, signals, today),
    [registry.assets, signals, today],
  )
  const catalogResult = useMemo(
    () => queryAssetCatalog(catalogIndex, { search: query, facets: facetSelections }, selectedId),
    [catalogIndex, query, facetSelections, selectedId],
  )
  const sortedEntries = useMemo(
    () => [...catalogResult.entries].sort((a, b) => {
      const kindA = KIND_ORDER.indexOf(a.asset.kind)
      const kindB = KIND_ORDER.indexOf(b.asset.kind)
      if (kindA !== kindB) return kindA - kindB
      return a.asset.name.localeCompare(b.asset.name)
    }),
    [catalogResult.entries],
  )
  const selected = registry.assets.find(asset => asset.id === selectedId)
  const selectedCatalogEntry = catalogIndex.entries.find(entry => entry.asset.id === selectedId)
  const assetSignals = signals.filter(signal => signal.assetId === selectedId)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 899px)')
    const update = () => setIsNarrow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isNarrow || narrowView !== 'passport' || !selected) return
    const frame = window.requestAnimationFrame(() => passportHeading.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isNarrow, narrowView, selected?.id])

  useEffect(() => {
    if (!isNarrow || narrowView !== 'catalog' || !pendingReturnAssetId.current) return
    const returnId = pendingReturnAssetId.current
    pendingReturnAssetId.current = undefined
    const frame = window.requestAnimationFrame(() => {
      const row = rowButtons.current.get(returnId)
      if (row) {
        row.focus()
        setFocusNotice(`Returned to ${row.textContent?.replace('Selected', '').trim() ?? 'the selected asset'}.`)
        return
      }
      if (catalogResult.canClearCriteria && clearCriteriaButton.current) {
        clearCriteriaButton.current.focus()
        setFocusNotice('The selected asset is outside the current results. Focus moved to Clear criteria.')
        return
      }
      catalogHeading.current?.focus()
      setFocusNotice('The originating asset row is unavailable. Focus moved to the asset catalog heading.')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isNarrow, narrowView, catalogResult.canClearCriteria])

  function updateFacet(key: CatalogFacetKey, value: string) {
    setFacetSelections(current => {
      const next = { ...current }
      if (value) next[key] = [value]
      else delete next[key]
      return next
    })
  }

  function clearCriteria() {
    setQuery('')
    setFacetSelections({})
    setFocusNotice('Catalog criteria cleared.')
  }

  function selectAsset(assetId: string) {
    originatingAssetId.current = assetId
    setFocusNotice('')
    onSelect(assetId)
    if (isNarrow) setNarrowView('passport')
  }

  function returnToCatalog() {
    pendingReturnAssetId.current = selectedId ?? originatingAssetId.current
    setNarrowView('catalog')
  }

  return (
    <div
      className={`assets-workspace assets-view-${narrowView}`}
      data-layout={isNarrow ? 'narrow' : 'desktop'}
    >
      <Card className="assets-catalog-region">
        <div className="assets-catalog-heading">
          <div>
            <Eyebrow>Asset catalog</Eyebrow>
            <h2 ref={catalogHeading} tabIndex={-1}>Coverage matrix</h2>
          </div>
          {catalogResult.canClearCriteria && (
            <button ref={clearCriteriaButton} type="button" className="btn" onClick={clearCriteria}>
              Clear criteria
            </button>
          )}
        </div>

        <div className="asset-catalog-controls" aria-label="Asset catalog criteria">
          <label className="asset-search-control">
            <span>Search assets</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Name, owner, provider, ID, format, location"
            />
          </label>
          <div className="asset-filter-grid">
            {CATALOG_FACET_KEYS.map(key => {
              const facet = catalogIndex.facets[key]
              const value = facetSelections[key]?.[0] ?? ''
              return (
                <label key={key}>
                  <span>{facet.label}</span>
                  <select
                    value={value}
                    disabled={facet.availability === 'unavailable'}
                    onChange={event => updateFacet(key, event.target.value)}
                  >
                    <option value="">{facet.availability === 'unavailable' ? 'Unavailable' : `All ${facet.label.toLowerCase()}`}</option>
                    {facet.values.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                </label>
              )
            })}
          </div>
        </div>

        <div className="asset-result-state" aria-live="polite">
          <strong>{catalogResult.resultSummary}</strong>
          <span>{catalogResult.activeCriteriaSummary}</span>
        </div>

        {catalogResult.resultCount === 0 ? (
          <div className="asset-no-results" role="status">
            <h3>No matching assets</h3>
            <p>Change the search or filters, or clear the active criteria to recover the full catalog.</p>
            {catalogResult.canClearCriteria && <button type="button" className="btn" onClick={clearCriteria}>Clear criteria</button>}
          </div>
        ) : (
          <>
            <ul className="coverage-legend" aria-label="Coverage legend">
              <li><strong>check</strong> verified</li>
              <li><strong>!</strong> stale</li>
              <li><strong>?</strong> unverified</li>
              <li><strong>x</strong> not shared</li>
              <li><strong>PRI</strong> primary provider</li>
              <li><strong>FBK</strong> fallback provider</li>
              <li><strong>dot</strong> not applicable</li>
            </ul>
            <div className="matrix-scroll">
              <table className="coverage-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Kind</th>
                    {registry.platforms.map(platform => <th key={platform}>{platform}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map(({ asset }) => {
                    const isSelected = selectedId === asset.id
                    return (
                      <tr key={asset.id} className={isSelected ? 'selected-row' : undefined}>
                        <td>
                          <button
                            ref={node => {
                              if (node) rowButtons.current.set(asset.id, node)
                              else rowButtons.current.delete(asset.id)
                            }}
                            type="button"
                            className="asset-link"
                            aria-current={isSelected ? 'true' : undefined}
                            onClick={() => selectAsset(asset.id)}
                          >
                            {asset.name}
                          </button>
                        </td>
                        <td className="kind-cell">{asset.kind}</td>
                        {registry.platforms.map(platform => {
                          const coverage = getCoverageGlyph(asset, platform, today)
                          return (
                            <td key={platform} className="coverage-cell" aria-label={`${asset.name}, ${platform}: ${coverage.title}`} title={coverage.title}>
                              <span className={`coverage-tone-${coverage.tone}`}>{coverage.glyph}</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="sr-only" aria-live="polite">{focusNotice}</p>
      </Card>

      <Card className="asset-passport-region">
        {selected ? (
          <AssetPassport
            asset={selected}
            registry={registry}
            session={session}
            sourceWriteFeedback={sourceWriteFeedback}
            signals={assetSignals}
            catalogEntry={selectedCatalogEntry}
            today={today}
            headingRef={passportHeading}
            isNarrow={isNarrow}
            selectedOutsideResults={catalogResult.selectedAssetOutsideResults}
            onBack={returnToCatalog}
            onClearCriteria={clearCriteria}
            onClearSelection={() => onSelect(undefined)}
            onOpenCheck={onOpenCheck}
            onReview={onReview}
            onVerify={onVerify}
            onDrill={onDrill}
            onRecordVersion={onRecordVersion}
            onAssignVersionAlias={onAssignVersionAlias}
            onRemoveVersionAlias={onRemoveVersionAlias}
            onSaveSource={onSaveSource}
          />
        ) : (
          <div className="asset-passport-empty">
            <Eyebrow>Asset Passport</Eyebrow>
            <h2 tabIndex={-1}>Select an asset</h2>
            <p>No asset is selected. Choose a catalog row to inspect its recorded facts, deterministic findings, evidence, decisions, and history.</p>
          </div>
        )}
      </Card>
    </div>
  )
}

function AssetPassport({
  asset,
  registry,
  session,
  sourceWriteFeedback,
  signals,
  catalogEntry,
  today,
  headingRef,
  isNarrow,
  selectedOutsideResults,
  onBack,
  onClearCriteria,
  onClearSelection,
  onOpenCheck,
  onReview,
  onVerify,
  onDrill,
  onRecordVersion,
  onAssignVersionAlias,
  onRemoveVersionAlias,
  onSaveSource,
}: {
  asset: Asset
  registry: RegistryData
  session: RegistrySession
  sourceWriteFeedback?: ConnectionNotice
  signals: Signal[]
  catalogEntry: AssetCatalogEntry | undefined
  today: string
  headingRef: React.RefObject<HTMLHeadingElement | null>
  isNarrow: boolean
  selectedOutsideResults: boolean
  onBack: () => void
  onClearCriteria: () => void
  onClearSelection: () => void
  onOpenCheck: (signal: Signal) => void
  onReview: (id: string) => void
  onVerify: (id: string, platform: string) => void
  onDrill: (id: string) => void
  onRecordVersion: (id: string) => Promise<'recorded' | 'deduplicated'>
  onAssignVersionAlias: (id: string, name: string, versionId: string) => void
  onRemoveVersionAlias: (id: string, name: string) => void
  onSaveSource: () => void
}) {
  const dependencyNames = (asset.dependsOn ?? []).map(id => registry.assets.find(candidate => candidate.id === id)?.name ?? id)
  const decisionCount = Number(Boolean(asset.acceptedRisk))
    + Number(Boolean(asset.actionControl))
    + Number(Boolean(asset.acceptedAsset))
    + Number(Boolean(asset.candidateTool))
  const flaggedSignals = signals.filter(signal => signal.status !== 'pass')
  const verdict = worstSignalStatus(signals)

  return (
    <article aria-labelledby="asset-passport-heading">
      <div className="asset-detail-heading">
        <div>
          <Eyebrow>Asset Passport / {asset.kind}</Eyebrow>
          <h2 id="asset-passport-heading" ref={headingRef} tabIndex={-1}>{asset.name}</h2>
          <div className="asset-detail-verdict">
            {verdict ? <StatusBadge status={verdict} /> : <span className="asset-detail-verdict-absent">No deterministic findings</span>}
            <span>{flaggedSignals.length} finding{flaggedSignals.length === 1 ? '' : 's'} needing attention</span>
            <span>{signals.length} evaluated</span>
          </div>
          <p>Selected asset: {asset.id}</p>
        </div>
        {isNarrow ? (
          <button type="button" className="btn" onClick={onBack}>Back to assets</button>
        ) : (
          <button type="button" className="btn" onClick={onClearSelection}>Clear selection</button>
        )}
      </div>

      <SourceWriteStrip
        session={session}
        feedback={sourceWriteFeedback}
        onSaveSource={onSaveSource}
      />

      {selectedOutsideResults && (
        <div className="selected-outside-results" role="status">
          <strong>Selected asset is outside current results.</strong>
          <span>The Passport remains tied to {asset.name}; the catalog selection was not reassigned.</span>
          <button type="button" className="text-command" onClick={onClearCriteria}>Clear criteria</button>
        </div>
      )}

      <DetailSection title="Summary" truthClass="Recorded facts" key={`${asset.id}:summary`} defaultOpen>
        <DetailGrid entries={[
          ['Name', asset.name],
          ['Kind', asset.kind],
          ['Format', asset.format],
          ['Location', asset.location],
          ['Owner', recorded(asset.owner)],
          ['Sensitivity', asset.sensitivity],
          ['Lifecycle', recorded(asset.registryState)],
          ['Shared by design', asset.sharedByDesign ? 'Yes' : 'No'],
          ['Purpose', recorded(asset.purpose)],
          ['Stable ID', recorded(asset.stableId)],
          ['Supported version', recorded(asset.supportedVersion)],
          ['Source product', recorded(asset.sourceProduct)],
          ['Producer', recorded(asset.producingProduct)],
          ['Consumers', listOrNone(asset.consumingProducts)],
        ]} />
        <div className="asset-actions">
          <button type="button" className="btn" onClick={() => onReview(asset.id)}>Record review today</button>
        </div>
      </DetailSection>

      <DetailSection title="Portability" truthClass="Recorded facts + deterministic findings" key={`${asset.id}:portability`} defaultOpen>
        <DetailGrid entries={[
          ['Deterministic portability state', catalogFacetState(catalogEntry, 'portability')],
        ]} />
        <div className="passport-subsection">
          <h4>Recorded coverage and providers</h4>
          {asset.coverage.length > 0 ? (
            <ul className="passport-record-list">
              {asset.coverage.map(entry => {
                const coverage = getCoverageGlyph(asset, entry.platform, today)
                return (
                  <li key={entry.platform}>
                    <strong>{entry.platform}</strong>
                    <span>{coverage.title} · Last verified: {entry.lastVerified ?? ABSENT_FIELD}</span>
                    {asset.kind !== 'workflow' && (
                      <button type="button" className="text-command" onClick={() => onVerify(asset.id, entry.platform)}>Record verification</button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : <AbsentState text="No coverage recorded." />}
          <DetailGrid entries={[
            ['Primary provider', recorded(asset.primaryProvider)],
            ['Fallback provider', recorded(asset.fallbackProvider)],
          ]} />
        </div>
        <SignalList signals={signals.filter(signal => signal.dimension !== 'evidence')} empty="No deterministic portability findings recorded." onOpenCheck={onOpenCheck} />
      </DetailSection>

      <DetailSection title="Dependencies" truthClass="Recorded facts" key={`${asset.id}:dependencies`}>
        {asset.providerDependencies.length > 0 ? (
          <ul className="passport-record-list">
            {asset.providerDependencies.map((dependency, index) => (
              <li key={`${dependency.provider}-${dependency.capability}-${index}`}>
                <strong>{dependency.provider}</strong>
                <span>{dependency.capability} · Fallback: {dependency.fallback ?? ABSENT_FIELD}</span>
              </li>
            ))}
          </ul>
        ) : <AbsentState text="No provider dependencies recorded." />}
        <DetailGrid entries={[
          ['Workflow dependencies', listOrNone(dependencyNames)],
          ['Producing product', recorded(asset.producingProduct)],
          ['Consuming products', listOrNone(asset.consumingProducts)],
        ]} />
        {asset.kind === 'workflow' && (
          <div className="asset-actions">
            <button type="button" className="btn" onClick={() => onDrill(asset.id)}>Record substitution drill</button>
          </div>
        )}
      </DetailSection>

      <DetailSection title="Evidence" truthClass="Evidence states + deterministic findings" key={`${asset.id}:evidence`}>
        <DetailGrid entries={[
          ['Deterministic evidence freshness', catalogFacetState(catalogEntry, 'evidenceFreshness')],
        ]} />
        {asset.evidence.length > 0 ? (
          <ul className="passport-record-list">
            {asset.evidence.map((point, index) => (
              <li key={`${point.label}-${point.date}-${index}`}>
                <strong>{point.label}</strong>
                <span>Recorded {point.date}</span>
              </li>
            ))}
          </ul>
        ) : <AbsentState text="No evidence points recorded." />}
        <DetailGrid entries={[
          ['Evidence bindings', asset.evidenceBindings?.length
            ? asset.evidenceBindings.map(binding => `${binding.source}: ${binding.externalId}`).join(', ')
            : 'None recorded'],
        ]} />
        <SignalList signals={signals.filter(signal => signal.dimension === 'evidence')} empty="No deterministic evidence findings recorded." onOpenCheck={onOpenCheck} />
      </DetailSection>

      <DetailSection title="Decisions" truthClass="Human decisions" key={`${asset.id}:decisions`}>
        {asset.acceptedRisk && (
          <DecisionBlock title="Accepted risk">
            <p>{asset.acceptedRisk.note}</p>
            <DetailGrid entries={[
              ['Owner', asset.acceptedRisk.owner],
              ['Expires', asset.acceptedRisk.expires],
            ]} />
          </DecisionBlock>
        )}
        {asset.actionControl && (
          <DecisionBlock title="Action boundary">
            <DetailGrid entries={[
              ['Authority', asset.actionControl.authority],
              ['Confirmation', asset.actionControl.confirmation],
              ['Reversible', asset.actionControl.reversible ? 'Yes' : 'No'],
              ['Required controls', listOrNone(asset.actionControl.requiredControls)],
              ['Evidence needed', listOrNone(asset.actionControl.evidenceNeeds)],
            ]} />
          </DecisionBlock>
        )}
        {asset.acceptedAsset && (
          <DecisionBlock title="Accepted asset">
            <DetailGrid entries={[
              ['Version / license', [asset.acceptedAsset.version, asset.acceptedAsset.license].filter(Boolean).join(' / ') || 'Not recorded'],
              ['Rights evidence', recorded(asset.acceptedAsset.ownershipEvidence)],
              ['Rationale', asset.acceptedAsset.decisionRationale],
              ['Provenance', asset.acceptedAsset.sourceProvenance],
              ['Scope', asset.acceptedAsset.scope],
            ]} />
          </DecisionBlock>
        )}
        {asset.candidateTool && <CandidateToolDecision tool={asset.candidateTool} />}
        {decisionCount === 0 && <AbsentState text="No human decisions recorded." />}
      </DetailSection>

      <DetailSection title="History" truthClass="Recorded facts" key={`${asset.id}:history`}>
        <AssetVersionHistory
          asset={asset}
          onRecordVersion={() => onRecordVersion(asset.id)}
          onAssignAlias={(name, versionId) => onAssignVersionAlias(asset.id, name, versionId)}
          onRemoveAlias={name => onRemoveVersionAlias(asset.id, name)}
        />
        <DetailGrid entries={[
          ['Registry source updated', formatRecordedTimestamp(registry.provenance?.sourceUpdatedAt ?? registry.updatedAt)],
          ['Last review', asset.lastReviewed ?? ABSENT_FIELD],
          ['Last substitution drill', asset.lastSubstitutionDrill ?? ABSENT_FIELD],
        ]} />
        {asset.coverage.length > 0 ? (
          <ul className="passport-record-list">
            {asset.coverage.map(entry => (
              <li key={entry.platform}>
                <strong>{entry.platform} verification</strong>
                <span>Last verified: {entry.lastVerified ?? ABSENT_FIELD}</span>
              </li>
            ))}
          </ul>
        ) : <AbsentState text="No coverage verification history recorded." />}
      </DetailSection>
    </article>
  )
}

function DetailSection({ title, truthClass, defaultOpen = false, children }: {
  title: string
  truthClass: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details className="detail-section" open={defaultOpen}>
      <summary className="passport-section-heading">
        <span className="passport-section-heading-copy">
          <span className="passport-section-title">{title}</span>
          <span className="truth-class">{truthClass}</span>
        </span>
      </summary>
      <div className="passport-section-content">
        {children}
      </div>
    </details>
  )
}

const UNRECORDED_VALUES = new Set(['Not recorded', 'None recorded', 'Missing / unavailable', ABSENT_FIELD])

/**
 * Recorded facts render first. Fields with no recorded value collapse into a
 * single counted group so the Passport reads as the facts it actually holds,
 * without hiding that the gaps exist (spec 017 FR-005).
 */
function DetailGrid({ entries }: { entries: Array<[string, string]> }) {
  const recorded = entries.filter(([, value]) => !UNRECORDED_VALUES.has(value))
  const unrecorded = entries.filter(([, value]) => UNRECORDED_VALUES.has(value))

  return (
    <>
      {recorded.length > 0 && <DetailGridList entries={recorded} />}
      {unrecorded.length > 0 && (
        <details className="detail-unrecorded">
          <summary>Unrecorded ({unrecorded.length})</summary>
          <DetailGridList entries={unrecorded} />
        </details>
      )}
    </>
  )
}

function DetailGridList({ entries }: { entries: Array<[string, string]> }) {
  return (
    <dl className="detail-grid">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function worstSignalStatus(signals: Signal[]): Signal['status'] | undefined {
  const order: Signal['status'][] = ['fail', 'warn', 'unknown', 'accepted', 'pass']
  return order.find(status => signals.some(signal => signal.status === status))
}

function SignalList({ signals, empty, onOpenCheck }: { signals: Signal[]; empty: string; onOpenCheck: (signal: Signal) => void }) {
  if (signals.length === 0) return <AbsentState text={empty} />
  return (
    <ul className="signal-list">
      {signals.map(signal => (
        <li key={signal.id}>
          <div className="signal-heading">
            <StatusBadge status={signal.status} />
            <strong>{signal.condition}</strong>
            <span className="signal-truth-class">{signalTruthClass(signal)}</span>
          </div>
          <p>{signal.finding}</p>
          <dl className="signal-evidence">
            <div><dt>Evidence</dt><dd>{signal.evidence || ABSENT_FIELD}</dd></div>
            <div><dt>Observed</dt><dd>{signal.observedAt ?? ABSENT_FIELD}</dd></div>
            <div><dt>Owner</dt><dd>{signal.owner || ABSENT_FIELD}</dd></div>
          </dl>
          {signal.action && <div className="signal-action">Action: {signal.action}</div>}
          <button type="button" className="text-command signal-check-command" onClick={() => onOpenCheck(signal)}>
            Open check explanation
          </button>
        </li>
      ))}
    </ul>
  )
}

function DecisionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="passport-decision">
      <h4>{title}</h4>
      {children}
    </section>
  )
}

function AbsentState({ text }: { text: string }) {
  return <p className="passport-absent"><strong>Missing / unavailable:</strong> {text}</p>
}

function CandidateToolDecision({ tool }: { tool: NonNullable<Asset['candidateTool']> }) {
  const readiness = tool.bundleReadiness ? Object.entries(tool.bundleReadiness) : []
  const readyCount = readiness.filter(([, ready]) => ready).length

  return (
    <DecisionBlock title="Candidate tool disposition">
      <div className="assessment-summary" aria-label="Candidate decision summary">
        <LabeledFact label="Assessment" value={humanize(tool.assessmentStatus)} />
        <LabeledFact label="Integration" value={humanize(tool.integrationLevel)} />
        <LabeledFact label="Disposition" value={humanize(tool.disposition)} />
        <LabeledFact label="License" value={tool.license || 'Not recorded'} />
        <LabeledFact label="Data egress" value={humanize(tool.dataEgress)} caution={tool.dataEgress === 'unknown' || tool.dataEgress === 'network-required'} />
      </div>
      <p><strong>Human rationale:</strong> {tool.dispositionRationale}</p>
      <DetailGrid entries={[
        ['Evidence output', recorded(tool.evidenceType)],
        ['Dimensions', listOrNone(tool.dimensions)],
        ['Supported checks', listOrNone(tool.supportedChecks)],
        ['Maintenance', recorded(tool.maintenanceStatus)],
        ['Runtime', listOrNone(tool.runtimeRequirements)],
        ['Trust boundary', recorded(tool.trustBoundary)],
        ['Attribution', recorded(tool.attributionNotes)],
        ['Use constraints', listOrNone(tool.knownUseConstraints)],
        ['Direct bundle trade-off', recorded(tool.directBundleTradeoff)],
        ['Bundle readiness', readiness.length ? `${readyCount} of ${readiness.length} recorded` : 'Not recorded'],
      ]} />
      {tool.sourceUrl ? <a className="source-link" href={tool.sourceUrl} target="_blank" rel="noreferrer">{tool.sourceUrl}</a> : <AbsentState text="No candidate source URL recorded." />}
    </DecisionBlock>
  )
}

function LabeledFact({ label, value, caution = false }: { label: string; value: string; caution?: boolean }) {
  return (
    <div className={caution ? 'labeled-fact labeled-fact-caution' : 'labeled-fact'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function recorded(value: string | undefined): string {
  return value?.trim() || 'Not recorded'
}

function listOrNone(values: readonly string[] | undefined): string {
  return values?.length ? values.join(', ') : 'None recorded'
}

function catalogFacetState(entry: AssetCatalogEntry | undefined, key: CatalogFacetKey): string {
  const values = entry?.facetValues[key]
  if (!values?.length || values.includes('__missing__')) return 'Missing / unavailable'
  return values.map(humanize).join(', ')
}

function signalTruthClass(signal: Signal): string {
  switch (signal.category) {
    case 'recorded-fact': return 'Recorded fact'
    case 'missing-evidence': return 'Missing evidence'
    case 'human-decision': return 'Human decision'
    default: return 'Deterministic finding'
  }
}

function humanize(value: string): string {
  return value.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
}
