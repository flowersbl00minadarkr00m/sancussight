import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CheckResultSnapshot,
  CheckSelectionIntent,
  EvidenceEnvelopeV1,
  EvidenceSourceState,
  Registry,
  Signal,
  SignalStatus,
} from '../types'
import {
  projectCheckResult,
  resolveCheckDefinition,
  searchCheckDefinitions,
  type CheckDefinition,
  type CheckResultProjection,
  type SafeEvidenceReference,
} from '../lib/check-catalog'
import {
  buildClaimLineage,
  type ClaimDecisionReference,
} from '../lib/claim-lineage'
import type {
  CheckHistoryReadResult,
  CheckHistoryStore,
} from '../lib/check-history-store'
import { Card, Eyebrow, StatusBadge } from './Shared'
import { ClaimLineageInspector } from './ClaimLineageInspector'

type NarrowView = 'list' | 'detail'
type HistoryViewState =
  | { state: 'not-applicable' }
  | { state: 'loading' }
  | { state: 'ready'; result: CheckHistoryReadResult }

export interface CheckCatalogProps {
  registry: Registry
  signals: Signal[]
  attentionSignals: Signal[]
  evidence: EvidenceEnvelopeV1[]
  sources: EvidenceSourceState[]
  intent?: CheckSelectionIntent
  registryScopeHash?: string | null
  historyRevision: number
  historyStore: Pick<CheckHistoryStore, 'read' | 'clear'>
  onIntentChange: (intent?: CheckSelectionIntent) => void
  onOpenAsset: (assetId: string) => void
  onHistoryCleared: () => void
}

function viewportIsNarrow(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches
}

export function CheckCatalog({
  registry,
  signals,
  attentionSignals,
  evidence,
  sources,
  intent,
  registryScopeHash,
  historyRevision,
  historyStore,
  onIntentChange,
  onOpenAsset,
  onHistoryCleared,
}: CheckCatalogProps) {
  const [query, setQuery] = useState('')
  const [isNarrow, setIsNarrow] = useState(viewportIsNarrow)
  const [narrowView, setNarrowView] = useState<NarrowView>(() => viewportIsNarrow() && intent ? 'detail' : 'list')
  const [historyState, setHistoryState] = useState<HistoryViewState>({ state: 'not-applicable' })
  const [historyNotice, setHistoryNotice] = useState('')
  const [focusNotice, setFocusNotice] = useState('')
  const listButtons = useRef(new Map<string, HTMLButtonElement>())
  const originatingListKey = useRef<string | undefined>(undefined)
  const pendingReturnKey = useRef<string | undefined>(undefined)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const catalogHeading = useRef<HTMLHeadingElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  const sourceById = useMemo(
    () => new Map(sources.map(source => [source.id, source])),
    [sources],
  )
  const evidenceById = useMemo(
    () => new Map(evidence.map(envelope => [envelope.id, envelope])),
    [evidence],
  )
  const resultBySignalId = useMemo(() => {
    const scope = registryScopeHash ?? `pending:${registry.updatedAt}`
    return new Map(signals.map(signal => [
      signal.id,
      projectCheckResult(signal, {
        registryScope: scope,
        safeEvidence: safeEvidenceForSignal(signal, evidenceById, sourceById),
      }),
    ]))
  }, [signals, registryScopeHash, registry.updatedAt, evidenceById, sourceById])
  const allResults = useMemo(
    () => signals.flatMap(signal => {
      const result = resultBySignalId.get(signal.id)
      return result ? [result] : []
    }),
    [signals, resultBySignalId],
  )
  const attentionResults = useMemo(
    () => attentionSignals.flatMap(signal => {
      const result = resultBySignalId.get(signal.id)
      return result ? [result] : []
    }),
    [attentionSignals, resultBySignalId],
  )

  const selectedSignal = useMemo(() => {
    if (intent?.signalId) return signals.find(signal => signal.id === intent.signalId)
    if (!intent?.checkId) return undefined
    return signals.find(signal => (
      signal.checkId === intent.checkId
      && (!intent.assetId || signal.assetId === intent.assetId)
    ))
  }, [signals, intent])
  const selectedResult = selectedSignal ? resultBySignalId.get(selectedSignal.id) : undefined
  const selectedDefinition = selectedResult?.kind === 'cataloged'
    ? selectedResult.definition
    : resolveCheckDefinition(intent?.checkId)
  const selectedListKey = selectedResult
    ? `result:${selectedResult.signalId}`
    : selectedDefinition
      ? `definition:${selectedDefinition.id}`
      : undefined
  const selectedAsset = selectedResult
    ? registry.assets.find(asset => asset.id === selectedResult.assetId)
    : undefined
  const decision = decisionForResult(selectedResult, selectedAsset)
  const lineage = selectedResult
    ? buildClaimLineage(selectedResult, {
        asset: selectedAsset,
        evidence,
        sources,
        ...(decision ? { decision } : {}),
      })
    : undefined

  const visibleDefinitions = useMemo(
    () => searchCheckDefinitions(query),
    [query],
  )
  const visibleAttentionResults = useMemo(
    () => attentionResults.filter(result => resultMatchesQuery(result, query)),
    [attentionResults, query],
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 899px)')
    const update = () => setIsNarrow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isNarrow && intent) setNarrowView('detail')
  }, [isNarrow, intent?.checkId, intent?.signalId, intent?.assetId])

  useEffect(() => {
    if (!intent || (intent.origin !== 'asset-passport' && (!isNarrow || narrowView !== 'detail'))) return
    const frame = window.requestAnimationFrame(() => detailHeading.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [isNarrow, narrowView, selectedListKey, intent])

  useEffect(() => {
    if (!isNarrow || narrowView !== 'list' || !pendingReturnKey.current) return
    const returnKey = pendingReturnKey.current
    pendingReturnKey.current = undefined
    const frame = window.requestAnimationFrame(() => {
      const button = listButtons.current.get(returnKey)
      if (button) {
        button.focus()
        setFocusNotice(`Returned to ${button.textContent?.trim() || 'the selected check'}.`)
        return
      }
      searchInput.current?.focus()
      setFocusNotice('The originating check is outside the current results. Focus moved to search.')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isNarrow, narrowView, query])

  useEffect(() => {
    let cancelled = false
    if (!selectedResult || selectedResult.kind !== 'cataloged') {
      setHistoryState({ state: 'not-applicable' })
      return () => {
        cancelled = true
      }
    }
    if (registryScopeHash === null) {
      setHistoryState({ state: 'ready', result: { availability: 'unavailable' } })
      return () => {
        cancelled = true
      }
    }
    if (!registryScopeHash) {
      setHistoryState({ state: 'loading' })
      return () => {
        cancelled = true
      }
    }

    setHistoryState({ state: 'loading' })
    void historyStore.read(
      registryScopeHash,
      selectedResult.assetId,
      selectedResult.checkId,
      selectedResult.resultDiscriminator,
    ).then(result => {
      if (!cancelled) setHistoryState({ state: 'ready', result })
    })

    return () => {
      cancelled = true
    }
  }, [
    selectedResult?.signalId,
    selectedResult?.resultDiscriminator,
    selectedResult?.kind,
    registryScopeHash,
    historyRevision,
    historyStore,
  ])

  function selectDefinition(definition: CheckDefinition) {
    const key = `definition:${definition.id}`
    originatingListKey.current = key
    setFocusNotice('')
    onIntentChange({
      checkId: definition.id,
      origin: 'attention',
    })
    if (isNarrow) setNarrowView('detail')
  }

  function selectResult(result: CheckResultProjection) {
    const key = `result:${result.signalId}`
    originatingListKey.current = key
    setFocusNotice('')
    onIntentChange({
      ...(result.checkId ? { checkId: result.checkId } : {}),
      signalId: result.signalId,
      assetId: result.assetId,
      origin: 'attention',
    })
    if (isNarrow) setNarrowView('detail')
  }

  function returnToList() {
    pendingReturnKey.current = selectedListKey ?? originatingListKey.current
    setNarrowView('list')
  }

  async function clearHistory() {
    if (!window.confirm('Clear all locally recorded Feature 009 check-result history? Current results and registry data will remain.')) return
    const result = await historyStore.clear()
    if (result.state === 'cleared') {
      setHistoryNotice('Local check-result history cleared. Current results remain available.')
      onHistoryCleared()
      return
    }
    setHistoryNotice('Local check-result history is unavailable and could not be cleared.')
  }

  const showList = !isNarrow || narrowView === 'list'
  const showDetail = !isNarrow || narrowView === 'detail'

  return (
    <div
      className={`check-catalog-workspace check-view-${narrowView}`}
      data-layout={isNarrow ? 'narrow' : 'desktop'}
    >
      {showList && (
        <Card className="check-catalog-list-region">
          <div className="check-catalog-heading">
            <div>
              <Eyebrow>Attention / deterministic checks</Eyebrow>
              <h2 ref={catalogHeading} tabIndex={-1}>Check Catalog</h2>
            </div>
            <button type="button" className="btn" onClick={() => void clearHistory()}>
              Clear history
            </button>
          </div>
          <p className="section-summary">
            Browse stable rule definitions or inspect a current non-passing result. Definitions and asset results remain separate.
          </p>
          <label className="check-search-control">
            <span>Search checks and current results</span>
            <input
              ref={searchInput}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rule, question, asset, finding, or stable ID"
            />
          </label>
          <p className="check-result-summary" aria-live="polite">
            {visibleDefinitions.length} definitions / {visibleAttentionResults.length} current attention results
          </p>
          {historyNotice && <p className="check-history-notice" role="status">{historyNotice}</p>}

          <section className="check-list-section" aria-labelledby="check-definitions-heading">
            <h3 id="check-definitions-heading">Definitions</h3>
            {visibleDefinitions.length > 0 ? (
              <ul className="check-definition-list">
                {visibleDefinitions.map(definition => {
                  const summary = summarizeDefinitionResults(definition.id, allResults)
                  const key = `definition:${definition.id}`
                  return (
                    <li key={definition.id}>
                      <button
                        ref={node => registerButton(listButtons.current, key, node)}
                        type="button"
                        aria-current={selectedListKey === key ? 'true' : undefined}
                        onClick={() => selectDefinition(definition)}
                      >
                        <strong>{definition.title}</strong>
                        <span>{definition.id}</span>
                        <span>{summary}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="check-state">No check definitions match this search. Change or clear the search to recover the catalog.</p>
            )}
          </section>

          <section className="check-list-section" aria-labelledby="attention-results-heading">
            <h3 id="attention-results-heading">Attention now</h3>
            {visibleAttentionResults.length > 0 ? (
              <ul className="check-result-list">
                {visibleAttentionResults.map(result => {
                  const key = `result:${result.signalId}`
                  return (
                    <li key={result.signalId}>
                      <button
                        ref={node => registerButton(listButtons.current, key, node)}
                        type="button"
                        aria-current={selectedListKey === key ? 'true' : undefined}
                        onClick={() => selectResult(result)}
                      >
                        <StatusBadge status={result.status} />
                        <span className="check-result-list-copy">
                          <strong>{result.assetName}</strong>
                          <span>{result.finding}</span>
                          <small>{result.kind === 'cataloged' ? result.checkId : 'Uncataloged observation'}</small>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="check-state">
                {query
                  ? 'No current attention results match this search. Definitions may still be inspected independently.'
                  : 'No non-passing current results are recorded. Stable definitions remain available for inspection.'}
              </p>
            )}
          </section>
          <p className="sr-only" aria-live="polite">{focusNotice}</p>
        </Card>
      )}

      {showDetail && (
        <Card className="check-catalog-detail-region">
          <CheckDetail
            headingRef={detailHeading}
            definition={selectedDefinition}
            result={selectedResult}
            selectedResultMissing={Boolean(intent?.signalId && !selectedResult)}
            lineage={lineage}
            historyState={historyState}
            isNarrow={isNarrow}
            onBack={returnToList}
            onOpenAsset={onOpenAsset}
          />
        </Card>
      )}
    </div>
  )
}

function CheckDetail({
  headingRef,
  definition,
  result,
  selectedResultMissing,
  lineage,
  historyState,
  isNarrow,
  onBack,
  onOpenAsset,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>
  definition?: CheckDefinition
  result?: CheckResultProjection
  selectedResultMissing: boolean
  lineage?: ReturnType<typeof buildClaimLineage>
  historyState: HistoryViewState
  isNarrow: boolean
  onBack: () => void
  onOpenAsset: (assetId: string) => void
}) {
  const heading = result
    ? result.kind === 'cataloged' ? result.definition.title : 'Uncataloged observation'
    : definition?.title ?? 'Select a check'

  return (
    <article aria-labelledby="check-detail-heading">
      <div className="check-detail-heading">
        <div>
          <Eyebrow>{result ? 'Current result explanation' : 'Check definition'}</Eyebrow>
          <h2 id="check-detail-heading" ref={headingRef} tabIndex={-1}>{heading}</h2>
          <p>{result?.checkId ?? definition?.id ?? 'No check or result selected'}</p>
        </div>
        {isNarrow && <button type="button" className="btn" onClick={onBack}>Back to checks</button>}
      </div>

      {!definition && !result && (
        <p className="check-state">
          Select a stable definition or a current attention result to inspect one canonical explanation.
        </p>
      )}

      <CheckDetailSection title="Definition" truthClass="Stable deterministic rule">
        {definition ? (
          <>
            <p className="check-question">{definition.question}</p>
            <p>{definition.importance}</p>
            <DetailGrid entries={[
              ['Stable ID', definition.id],
              ['Version', String(definition.version)],
              ['Dimension', definition.dimension],
              ['Exact rule', definition.rule],
              ['Inspected inputs', definition.inspectedInputs.join(', ')],
              ['Possible outcomes', definition.outcomes.join(', ')],
            ]} />
          </>
        ) : result ? (
          <p className="check-state check-state-uncataloged">
            Uncataloged observation. No stable rule, passing condition, lineage contract, or remediation has been invented.
          </p>
        ) : (
          <p className="check-state">No definition selected.</p>
        )}
      </CheckDetailSection>

      <CheckDetailSection title="Current result" truthClass={result ? truthClassLabel(result) : 'No result selected'}>
        {result ? (
          <>
            <div className="check-current-heading">
              <StatusBadge status={result.status} />
              <strong>{result.assetName}</strong>
            </div>
            <p>{result.finding}</p>
            <DetailGrid entries={[
              ['Evaluation time', result.evaluatedAt ?? 'Not recorded'],
              ['Owner', result.owner || 'Not recorded'],
              ['Result identity', result.resultDiscriminator],
              ['Result class', result.kind === 'cataloged' ? 'Cataloged deterministic result' : 'Uncataloged source-qualified observation'],
            ]} />
            <button type="button" className="btn check-open-asset" onClick={() => onOpenAsset(result.assetId)}>
              Open Asset Passport
            </button>
          </>
        ) : (
          <p className="check-state">
            {selectedResultMissing
              ? 'The previously selected result is no longer current. The stable definition remains selected.'
              : definition
                ? 'No result selected. This definition can be inspected independently of an asset result.'
                : 'No result selected.'}
          </p>
        )}
      </CheckDetailSection>

      <CheckDetailSection title="Previous result" truthClass="Bounded metadata-only local history">
        <PreviousResult result={result} historyState={historyState} />
      </CheckDetailSection>

      <CheckDetailSection title="Evidence inspected" truthClass="Recorded facts + explicit gaps">
        {result ? (
          result.evidence.length > 0 ? (
            <ul className="check-evidence-list">
              {result.evidence.map((item, index) => (
                <li key={`${item.reference ?? item.label}-${index}`}>
                  <strong>{item.label}</strong>
                  <span>Reference: {item.reference ?? 'No exact accepted reference'}</span>
                  <span>Observed: {item.observedAt ?? 'Not recorded'}</span>
                  <span>Source state: {item.sourceHealth ?? 'Not recorded'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="check-state">Missing / unavailable: no safe evidence reference is recorded for this result.</p>
          )
        ) : (
          <p className="check-state">
            No result selected. Required inputs: {definition?.inspectedInputs.join(', ') || 'No cataloged inputs available'}.
          </p>
        )}
      </CheckDetailSection>

      <CheckDetailSection title="Claim lineage" truthClass="Bounded typed relationships">
        {lineage ? (
          <ClaimLineageInspector lineage={lineage} />
        ) : (
          <p className="check-state">No result selected. Asset-specific claim lineage is not constructed for a definition alone.</p>
        )}
      </CheckDetailSection>

      <CheckDetailSection title="Remediation and invalidation" truthClass="Stable check contract">
        {result || definition ? (
          <DetailGrid entries={[
            ['Why do we believe this?', result?.belief ?? 'No result selected; only the stable rule is available.'],
            ['What is missing?', result?.missingEvidence ?? 'No result selected; current input gaps are unknown.'],
            ['What would make this pass?', result?.passCondition ?? definition?.passCondition ?? 'No cataloged passing condition is available.'],
            ['Remediation', result?.remediation ?? definition?.remediation ?? 'No cataloged remediation contract is available.'],
            ['What would invalidate or change it?', result?.invalidation ?? definition?.invalidation ?? 'No cataloged invalidation contract is available.'],
          ]} />
        ) : (
          <p className="check-state">Select a definition or result to inspect remediation and invalidation.</p>
        )}
      </CheckDetailSection>
    </article>
  )
}

function PreviousResult({
  result,
  historyState,
}: {
  result?: CheckResultProjection
  historyState: HistoryViewState
}) {
  if (!result) return <p className="check-state">No result selected.</p>
  if (result.kind === 'uncataloged') {
    return <p className="check-state check-state-uncataloged">Uncataloged observations do not receive cataloged result history.</p>
  }
  if (historyState.state === 'loading') {
    return <p className="check-state">Loading local result history...</p>
  }
  if (historyState.state === 'not-applicable') {
    return <p className="check-state">No previous result recorded.</p>
  }
  if (historyState.result.availability === 'unavailable') {
    return <p className="check-state check-state-unavailable">Local history unavailable. The current result remains usable.</p>
  }
  if (!historyState.result.previous) {
    return <p className="check-state">No previous result recorded.</p>
  }

  return <ResultSnapshot snapshot={historyState.result.previous} />
}

function ResultSnapshot({ snapshot }: { snapshot: CheckResultSnapshot }) {
  return (
    <div className="previous-result">
      <StatusBadge status={snapshot.status} />
      <DetailGrid entries={[
        ['Recorded evaluation time', snapshot.evaluatedAt],
        ['Check ID', snapshot.checkId],
        ['Result discriminator', snapshot.resultDiscriminator],
        ['Safe evidence hash', snapshot.safeEvidenceHash],
      ]} />
    </div>
  )
}

function CheckDetailSection({
  title,
  truthClass,
  children,
}: {
  title: string
  truthClass: string
  children: React.ReactNode
}) {
  return (
    <section className="check-detail-section">
      <div className="check-detail-section-heading">
        <h3>{title}</h3>
        <span>{truthClass}</span>
      </div>
      {children}
    </section>
  )
}

function DetailGrid({ entries }: { entries: Array<[string, string]> }) {
  return (
    <dl className="check-detail-grid">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function safeEvidenceForSignal(
  signal: Signal,
  evidenceById: ReadonlyMap<string, EvidenceEnvelopeV1>,
  sourceById: ReadonlyMap<EvidenceEnvelopeV1['source'], EvidenceSourceState>,
): readonly SafeEvidenceReference[] {
  const envelope = signal.evidenceRef ? evidenceById.get(signal.evidenceRef) : undefined
  if (envelope) {
    return [{
      label: `${envelope.source} / ${envelope.evidenceKind}`,
      reference: envelope.id,
      observedAt: envelope.observedAt,
      sourceHealth: sourceById.get(envelope.source)?.health,
    }]
  }
  if (!signal.evidence) return []
  return [{
    label: signal.evidence,
    ...(signal.evidenceRef ? { reference: signal.evidenceRef } : {}),
    ...(signal.observedAt ? { observedAt: signal.observedAt } : {}),
  }]
}

function decisionForResult(
  result: CheckResultProjection | undefined,
  asset: Registry['assets'][number] | undefined,
): ClaimDecisionReference | undefined {
  if (!result || result.category !== 'human-decision' || !asset?.acceptedRisk) return undefined
  return {
    id: `${asset.id}:accepted-risk:${asset.acceptedRisk.expires}`,
    label: `Risk accepted by ${asset.acceptedRisk.owner} until ${asset.acceptedRisk.expires}`,
  }
}

function summarizeDefinitionResults(
  checkId: string,
  results: readonly CheckResultProjection[],
): string {
  const applicable = results.filter(result => result.checkId === checkId)
  if (applicable.length === 0) return 'No current result'
  const worst = [...applicable].sort((left, right) => statusRank(left.status) - statusRank(right.status))[0]
  return `${applicable.length} current result${applicable.length === 1 ? '' : 's'} / worst ${worst.status}`
}

function resultMatchesQuery(result: CheckResultProjection, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return true
  return [
    result.assetName,
    result.assetId,
    result.finding,
    result.signalId,
    result.checkId ?? 'uncataloged observation',
    result.kind === 'cataloged' ? result.definition.title : '',
    result.kind === 'cataloged' ? result.definition.question : '',
  ].some(value => value.toLocaleLowerCase().includes(normalized))
}

function statusRank(status: SignalStatus): number {
  return {
    fail: 0,
    warn: 1,
    unknown: 2,
    accepted: 3,
    pass: 4,
  }[status]
}

function truthClassLabel(result: CheckResultProjection): string {
  switch (result.category) {
    case 'recorded-fact': return 'Recorded fact'
    case 'missing-evidence': return 'Missing evidence'
    case 'human-decision': return 'Human decision'
    default: return 'Deterministic finding'
  }
}

function registerButton(
  map: Map<string, HTMLButtonElement>,
  key: string,
  node: HTMLButtonElement | null,
): void {
  if (node) map.set(key, node)
  else map.delete(key)
}
