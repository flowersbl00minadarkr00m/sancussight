import { useEffect, useMemo, useRef, useState } from 'react'
import type { CheckSelectionIntent, ConnectionNotice, EvidenceEnvelopeV1, Registry, RegistrySession, Signal, ViewId, WorkingRegistryCache } from './types'
import { createDemoRegistry, exportJSON, importJSON } from './lib/storage'
import { evaluateAll, flaggedSignals, generateShareCard, groupFlaggedByAsset, rollup } from './lib/registry'
import { APP_HASH, parseAppRoute, type AppRoute } from './lib/route'
import { BrowserFileConnector } from './lib/file-connector'
import { IndexedDbConnectionStore, disconnectConnectionState, migrateLegacyLocalRegistry } from './lib/connection-store'
import { SourceController, type SourceOperationResult } from './lib/source-controller'
import { LandingGateway } from './components/LandingGateway'
import { Header } from './components/Header'
import { WorkspaceNavigation } from './components/WorkspaceNavigation'
import { ConnectionNoticeBanner } from './components/ConnectionNotice'
import { Registry as RegistryView } from './components/Registry'
import { Definitions } from './components/Definitions'
import { ExitTest } from './components/ExitTest'
import { Queue } from './components/Queue'
import { ShareCard } from './components/ShareCard'
import { ActivityLog } from './components/ActivityLog'
import { ReleaseEvidence } from './components/ReleaseEvidence'
import { ConflictPanel } from './components/ConflictPanel'
import { EvidenceLedger } from './components/EvidenceLedger'
import { EvidenceSources } from './components/EvidenceSources'
import { StandardsInteroperability } from './components/StandardsInteroperability'
import { GovernanceWorkspace } from './components/governance/GovernanceWorkspace'
import { confirmEvidenceBinding, evidenceSignals } from './lib/evidence'
import { useCollector } from './lib/use-collector'
import { useGovernance } from './lib/use-governance'
import { CheckHistoryStore, hashRegistryScope } from './lib/check-history-store'
import { projectCheckResult } from './lib/check-catalog'
import {
  assignAssetVersionAlias,
  projectAssetVersionVerificationRefs,
  recordAssetVersion,
  removeAssetVersionAlias,
} from './lib/asset-versions'
import { browserSha256 } from './lib/evidence-packet'
import { verifyRegistryAssetVersionIdentities } from './lib/session'

interface AppState {
  route: AppRoute
  session?: RegistrySession
  loading?: boolean
}

const connectionStore = new IndexedDbConnectionStore()
const sourceController = new SourceController(new BrowserFileConnector(), connectionStore)
const checkHistoryStore = new CheckHistoryStore()

function readInitialState(): AppState {
  const route = parseAppRoute(window.location.hash)
  if (route === 'demo') {
    return { route, session: { registry: createDemoRegistry(), mode: 'demo', sourceKind: 'demo', dirty: false } }
  }
  return { route, loading: route === 'workspace' }
}

export default function App() {
  const collector = useCollector()
  const governance = useGovernance(collector.state.mode, collector.state.sources)
  const [notice, setNotice] = useState<ConnectionNotice>()
  const [sourceWriteFeedback, setSourceWriteFeedback] = useState<ConnectionNotice>()
  const [appState, setAppState] = useState<AppState>(readInitialState)
  const [view, setView] = useState<ViewId>(() => parseAppRoute(window.location.hash) === 'landing' ? 'overview' : 'registry')
  const [selectedAssetId, setSelectedAssetId] = useState<string>()
  const [checkIntent, setCheckIntent] = useState<CheckSelectionIntent>()
  const [registryScopeHash, setRegistryScopeHash] = useState<string | null>()
  const [historyRevision, setHistoryRevision] = useState(0)
  const [evidenceSourcesActive, setEvidenceSourcesActive] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [conflictGuidanceDismissed, setConflictGuidanceDismissed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const routeGeneration = useRef(0)
  const operationPending = useRef(false)

  const persistentAccessSupported = sourceController.isPersistentAccessSupported()
  const today = new Date().toISOString().slice(0, 10)
  const registry = appState.session?.registry
  const signals: Signal[] = useMemo(() => registry
    ? [...evaluateAll(registry, today), ...evidenceSignals(registry, collector.state.evidence, collector.state.sources)]
    : [], [registry, today, collector.state.evidence, collector.state.sources])
  const rolls = useMemo(() => rollup(signals), [signals])
  const flagged = useMemo(() => flaggedSignals(signals), [signals])
  const findingGroups = useMemo(() => groupFlaggedByAsset(signals), [signals])
  const shareMarkdown = useMemo(
    () => registry ? generateShareCard(registry, signals, today) : '',
    [registry, signals, today],
  )

  useEffect(() => {
    async function syncRoute() {
      const generation = ++routeGeneration.current
      const route = parseAppRoute(window.location.hash)
      setShowShare(false)

      if (route === 'demo') {
        setAppState({ route, session: { registry: createDemoRegistry(), mode: 'demo', sourceKind: 'demo', dirty: false } })
        setNotice(undefined)
        setSourceWriteFeedback(undefined)
        return
      }

      if (route === 'workspace') {
        setAppState(current => ({ ...current, route, loading: true }))
        let migrationFailed = false
        try {
          await migrateLegacyLocalRegistry(connectionStore, window.localStorage)
        } catch {
          migrationFailed = true
        }
        const result = await sourceController.restore()
        if (generation !== routeGeneration.current) return
        if (result.session) {
          if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
            window.history.replaceState(null, '', APP_HASH.landing)
            setAppState({ route: 'landing' })
            setNotice({ tone: 'error', message: 'Saved version history failed deterministic identity verification. The workspace was not opened.' })
            return
          }
          setAppState({ route, session: result.session })
          setNotice(migrationFailed
            ? { tone: 'error', message: 'Legacy browser data could not be migrated. Export any available workspace before retrying.' }
            : noticeFromResult(result))
          return
        }
        window.history.replaceState(null, '', APP_HASH.landing)
        setAppState({ route: 'landing' })
        setNotice({ tone: 'neutral', message: 'No local registry is connected yet. Connect a file or import a snapshot.' })
        return
      }

      setAppState({ route: 'landing' })
      setNotice(undefined)
    }

    function handleRouteChange() {
      setView(parseAppRoute(window.location.hash) === 'landing' ? 'overview' : 'registry')
      setSelectedAssetId(undefined)
      setCheckIntent(undefined)
      setEvidenceSourcesActive(false)
      void syncRoute()
    }

    window.addEventListener('hashchange', handleRouteChange)
    window.addEventListener('popstate', handleRouteChange)
    void syncRoute()
    return () => {
      window.removeEventListener('hashchange', handleRouteChange)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    async function handleVisibilityChange() {
      const session = appState.session
      if (document.visibilityState !== 'visible' || operationPending.current || !session?.connection) return
      const result = await sourceController.refresh(session, 'focus')
      setSourceWriteFeedback(undefined)
      if (result.session) {
        if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
          setNotice({ tone: 'error', message: 'Changed version history failed deterministic identity verification. The last accepted workspace remains active.' })
          return
        }
        setAppState(current => ({ ...current, session: result.session }))
      }
      if (result.outcome !== 'success' || result.message) setNotice(noticeFromResult(result))
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [appState.session])

  useEffect(() => {
    if (appState.session?.connection?.syncState !== 'conflict') setConflictGuidanceDismissed(false)
  }, [appState.session?.connection?.syncState])

  useEffect(() => {
    let cancelled = false
    setRegistryScopeHash(undefined)

    if (!registry) return () => {
      cancelled = true
    }
    const activeRegistry = registry

    async function recordCurrentCheckResults() {
      try {
        const scopeHash = await hashRegistryScope(activeRegistry)
        if (cancelled) return
        setRegistryScopeHash(scopeHash)

        await Promise.all(signals.flatMap(signal => (
          signal.checkId && signal.evaluatedAt
            ? [checkHistoryStore.record({
                registryScopeHash: scopeHash,
                assetId: signal.assetId,
                checkId: signal.checkId,
                resultDiscriminator: signal.id,
                status: signal.status,
                evaluatedAt: signal.evaluatedAt,
                safeEvidenceRef: signal.evidenceRef,
              })]
            : []
        )))

        if (!cancelled) setHistoryRevision(current => current + 1)
      } catch {
        if (!cancelled) {
          setRegistryScopeHash(null)
          setHistoryRevision(current => current + 1)
        }
      }
    }

    void recordCurrentCheckResults()
    return () => {
      cancelled = true
    }
  }, [registry, signals])

  function navigate(route: AppRoute, session?: RegistrySession, nextNotice?: ConnectionNotice) {
    routeGeneration.current += 1
    window.history.pushState(null, '', APP_HASH[route])
    setAppState({ route, session })
    setNotice(nextNotice)
    setSourceWriteFeedback(undefined)
    setView(route === 'landing' ? 'overview' : 'registry')
    setSelectedAssetId(undefined)
    setCheckIntent(undefined)
    setEvidenceSourcesActive(false)
    setShowShare(false)
  }

  async function handleConnect() {
    setNotice(undefined)
    if (!persistentAccessSupported) {
      fileRef.current?.click()
      return
    }

    operationPending.current = true
    const result = await sourceController.connect(sourceName => window.confirm(
      `Replace the current workspace with the validated source ${sourceName}? Unsaved browser state will be replaced.`,
    ))
    operationPending.current = false
    if (result.session) {
      if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
        setNotice({ tone: 'error', message: 'Version history failed deterministic identity verification. The selected workspace was not opened.' })
        return
      }
      navigate(result.session.mode === 'demo' ? 'demo' : 'workspace', result.session, noticeFromResult(result))
    } else {
      setNotice(noticeFromResult(result))
    }
  }

  function openSnapshotImport() {
    setNotice(undefined)
    fileRef.current?.click()
  }

  async function handleSnapshotFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      setNotice({ tone: 'neutral', message: 'Snapshot import cancelled. The current workspace was not changed.' })
      return
    }

    const imported = await importJSON(await file.text(), browserSha256)
    if (!imported) {
      setNotice({ tone: 'error', message: 'That file is not a compatible SancusSight registry.' })
      return
    }
    if (imported.provenance?.mode === 'demo') {
      navigate('demo', { registry: imported, mode: 'demo', sourceKind: 'demo', dirty: false }, {
        tone: 'neutral',
        message: 'This file is marked as synthetic demo data. It was not saved as actual evidence.',
      })
      return
    }

    if (appState.session && !window.confirm('Replace the current workspace with this validated snapshot?')) {
      setNotice({ tone: 'neutral', message: 'Snapshot replacement cancelled.' })
      return
    }

    const session: RegistrySession = { registry: imported, mode: 'local', sourceKind: 'snapshot', dirty: false, cacheState: 'authoritative-read' }
    try {
      await sourceController.replaceWithSnapshot(session)
    } catch {
      setNotice({ tone: 'error', message: 'The snapshot is valid, but browser recovery storage is unavailable. The current workspace was not replaced.' })
      return
    }
    navigate('workspace', session, { tone: 'success', message: `Snapshot imported from ${file.name}. Later source changes require another import.` })
  }

  async function handleRefresh() {
    const session = appState.session
    if (!session?.connection || operationPending.current) return
    setSourceWriteFeedback(undefined)
    operationPending.current = true
    const result = await sourceController.refresh(session, 'manual')
    operationPending.current = false
    if (result.session) {
      if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
        setNotice({ tone: 'error', message: 'Refreshed version history failed deterministic identity verification. The last accepted workspace remains active.' })
        return
      }
      setAppState(current => ({ ...current, session: result.session }))
    }
    setNotice(noticeFromResult(result))
  }

  async function handleReauthorize() {
    const session = appState.session
    if (!session?.connection || operationPending.current) return
    setSourceWriteFeedback(undefined)
    operationPending.current = true
    const result = await sourceController.reauthorize(session)
    operationPending.current = false
    if (result.session) {
      if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
        setNotice({ tone: 'error', message: 'Reauthorized version history failed deterministic identity verification. The last accepted workspace remains active.' })
        return
      }
      setAppState(current => ({ ...current, session: result.session }))
    }
    setNotice(noticeFromResult(result))
  }

  function updateRegistry(next: Registry) {
    const session = appState.session
    if (!session) return
    if (session.mode === 'demo') {
      const updated: Registry = {
        ...next,
        updatedAt: new Date().toISOString(),
        provenance: { mode: 'demo', sourceUpdatedAt: next.provenance?.sourceUpdatedAt ?? next.updatedAt },
      }
      setAppState(current => ({ ...current, session: { ...session, registry: updated } }))
      return
    }

    const dirty = session.sourceKind === 'file'
    const connection = session.connection ? { ...session.connection, syncState: dirty ? 'unsaved' as const : session.connection.syncState } : undefined
    const updatedSession: RegistrySession = { ...session, registry: next, dirty, ...(connection ? { connection } : {}) }
    if (dirty) {
      setSourceWriteFeedback(current => current?.tone === 'success' ? undefined : current)
    }
    setAppState(current => ({ ...current, session: updatedSession }))
    void sourceController.saveWorkingCopy(updatedSession).catch(() => {
      setNotice({ tone: 'error', message: 'Changes remain in this tab, but restart recovery is currently unavailable.' })
    })
  }

  async function handleSaveSource() {
    const session = appState.session
    if (!session?.connection || !session.dirty || operationPending.current) return
    const confirmed = window.confirm(
      `Save ${session.registry.assets.length} assets to ${session.connection.sourceName}? This overwrites the canonical file after a conflict check.`,
    )
    if (!confirmed) {
      setSourceWriteFeedback({
        tone: 'neutral',
        message: 'Save cancelled. Unsaved changes remain in the recovery cache.',
        operationPhase: 'settled',
      })
      return
    }
    setSourceWriteFeedback({
      tone: 'neutral',
      message: `Saving changes to ${session.connection.sourceName}...`,
      operationPhase: 'pending',
    })
    operationPending.current = true
    const result = await sourceController.save(session)
    operationPending.current = false
    if (result.session) setAppState(current => ({ ...current, session: result.session }))
    const feedback = noticeFromResult(result)
    setSourceWriteFeedback(feedback ? { ...feedback, operationPhase: 'settled' } : undefined)
  }

  async function handleReloadSource() {
    const session = appState.session
    if (!session?.connection) return
    if (!window.confirm('Reload the canonical source and discard unsaved working changes?')) return
    setSourceWriteFeedback(undefined)
    operationPending.current = true
    const result = await sourceController.reloadSource(session)
    operationPending.current = false
    if (result.session) {
      if (!await verifyRegistryAssetVersionIdentities(result.session.registry, browserSha256)) {
        setNotice({ tone: 'error', message: 'Reloaded version history failed deterministic identity verification. The last accepted workspace remains active.' })
        return
      }
      setAppState(current => ({ ...current, session: result.session }))
    }
    setNotice(noticeFromResult(result))
  }

  function handleReview(assetId: string) {
    if (!registry) return
    updateRegistry({ ...registry, assets: registry.assets.map(asset => asset.id === assetId ? { ...asset, lastReviewed: today } : asset) })
  }

  function handleVerify(assetId: string, platform: string) {
    if (!registry) return
    updateRegistry({
      ...registry,
      assets: registry.assets.map(asset => asset.id === assetId ? {
        ...asset,
        coverage: asset.coverage.map(entry => entry.platform === platform ? { ...entry, lastVerified: today } : entry),
      } : asset),
    })
  }

  function handleDrill(assetId: string) {
    if (!registry) return
    updateRegistry({ ...registry, assets: registry.assets.map(asset => asset.id === assetId ? { ...asset, lastSubstitutionDrill: today } : asset) })
  }

  async function handleRecordAssetVersion(assetId: string): Promise<'recorded' | 'deduplicated'> {
    if (!registry) throw new Error('No active registry is available.')
    const activeRegistry = registry
    const asset = activeRegistry.assets.find(candidate => candidate.id === assetId)
    if (!asset) throw new Error('The selected asset is no longer available.')

    const scopeHash = await hashRegistryScope(activeRegistry)
    const catalogedResults = signals
      .filter(signal => signal.assetId === assetId)
      .map(signal => projectCheckResult(signal, { registryScope: scopeHash }))
    const verificationRefs = projectAssetVersionVerificationRefs(catalogedResults)
    const result = await recordAssetVersion(asset, {
      recordedAt: new Date().toISOString(),
      verificationRefs,
    }, browserSha256)

    if (result.status === 'recorded') {
      updateRegistry({
        ...activeRegistry,
        assets: activeRegistry.assets.map(candidate => (
          candidate.id === assetId ? result.asset : candidate
        )),
      })
    }
    return result.status
  }

  function handleAssignAssetVersionAlias(assetId: string, name: string, versionId: string) {
    if (!registry) throw new Error('No active registry is available.')
    const asset = registry.assets.find(candidate => candidate.id === assetId)
    if (!asset) throw new Error('The selected asset is no longer available.')
    const updatedAsset = assignAssetVersionAlias(asset, name, versionId)
    updateRegistry({
      ...registry,
      assets: registry.assets.map(candidate => candidate.id === assetId ? updatedAsset : candidate),
    })
  }

  function handleRemoveAssetVersionAlias(assetId: string, name: string) {
    if (!registry) throw new Error('No active registry is available.')
    const asset = registry.assets.find(candidate => candidate.id === assetId)
    if (!asset) throw new Error('The selected asset is no longer available.')
    const updatedAsset = removeAssetVersionAlias(asset, name)
    updateRegistry({
      ...registry,
      assets: registry.assets.map(candidate => candidate.id === assetId ? updatedAsset : candidate),
    })
  }

  function handleSelectAsset(id: string) {
    setSelectedAssetId(id)
    setCheckIntent(undefined)
    setEvidenceSourcesActive(false)
    setView('registry')
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLHeadingElement>('#asset-passport-heading')?.focus()
    })
  }

  function handleOpenCheck(signal: Signal, origin: CheckSelectionIntent['origin']) {
    setSelectedAssetId(signal.assetId)
    setCheckIntent({
      ...(signal.checkId ? { checkId: signal.checkId } : {}),
      signalId: signal.id,
      assetId: signal.assetId,
      origin,
    })
    setEvidenceSourcesActive(false)
    setView('queue')
  }

  function handleOpenEvidenceSources() {
    setSelectedAssetId(undefined)
    setEvidenceSourcesActive(true)
    setView('overview')
  }

  function handleBindEvidence(envelope: EvidenceEnvelopeV1, assetId: string) {
    if (!registry) return
    const asset = registry.assets.find((item) => item.id === assetId)
    if (!asset || !window.confirm(`Bind ${envelope.source} subject ${envelope.subject.externalId} to ${asset.name}? This changes only the registry evidence binding.`)) return
    updateRegistry(confirmEvidenceBinding(registry, assetId, envelope))
    setNotice({ tone: 'success', message: `Evidence binding recorded for ${asset.name}. Save the canonical registry to make it durable.` })
  }

  function handleExport() {
    if (!registry) return
    const blob = new Blob([exportJSON(registry)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sancussight-${appState.session?.sourceKind ?? 'registry'}-${today}.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  async function handleReset() {
    const session = appState.session
    if (!session) return
    if (session.mode === 'demo') {
      if (!window.confirm('Reset this demo session and discard its in-memory changes?')) return
      setAppState(current => ({ ...current, session: { registry: createDemoRegistry(), mode: 'demo', sourceKind: 'demo', dirty: false } }))
      setNotice({ tone: 'success', message: 'Demo data was reset.' })
      return
    }
    if (!window.confirm('Remove this workspace and its recovery cache from the browser? The source file will not be deleted.')) return
    try {
      await sourceController.disconnect()
      await disconnectConnectionState(connectionStore, window.localStorage)
    } catch {
      setNotice({ tone: 'error', message: 'The browser connection could not be removed. The source file was not changed.' })
      return
    }
    navigate('landing', undefined, { tone: 'success', message: 'Browser connection and cache removed. The source file was not changed.' })
  }

  if (appState.loading && appState.route === 'workspace' && !appState.session) {
    return <main className="loading-screen" aria-live="polite">Restoring local workspace...</main>
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleSnapshotFile} />

      {appState.route === 'landing' || !appState.session || !registry ? (
        <LandingGateway
          onConnect={handleConnect}
          persistentAccessSupported={persistentAccessSupported}
          notice={notice}
        />
      ) : (
        <div className="workspace-shell">
          <Header
            registry={registry}
            session={appState.session}
            persistentAccessSupported={persistentAccessSupported}
            onConnect={handleConnect}
            onImportSnapshot={openSnapshotImport}
            onRefresh={handleRefresh}
            onReauthorize={handleReauthorize}
            onExport={handleExport}
            onShare={() => setShowShare(true)}
            onReset={handleReset}
            onHome={() => navigate('landing')}
          />

          <WorkspaceNavigation
            view={view}
            queueCount={flagged.length}
            evidenceSourcesActive={evidenceSourcesActive}
            onOpenEvidenceSources={handleOpenEvidenceSources}
            onSelect={nextView => {
              setEvidenceSourcesActive(false)
              setView(nextView)
              setCheckIntent(undefined)
              if (nextView !== 'registry') setSelectedAssetId(undefined)
            }}
          />

          <ConnectionNoticeBanner notice={notice} />
          {appState.session.connection?.syncState === 'conflict' && !conflictGuidanceDismissed && (
            <ConflictPanel
              sourceName={appState.session.connection.sourceName}
              onReloadSource={handleReloadSource}
              onExportWorkingCopy={handleExport}
              onKeepWorking={() => setConflictGuidanceDismissed(true)}
            />
          )}

          <div className={view === 'registry' ? 'evidence-workspace-grid evidence-workspace-grid-assets' : 'evidence-workspace-grid'}>
            <main id="workspace-content" className="workspace-content">
              {evidenceSourcesActive ? (
                <StandardsInteroperability evidence={collector.state.evidence} />
              ) : (
                <>
                  {view === 'overview' && <EvidenceLedger registry={registry} rollups={rolls} groups={findingGroups} signals={signals} evidence={collector.state.evidence} onSelectAsset={handleSelectAsset} onOpenQueue={() => { setCheckIntent(undefined); setEvidenceSourcesActive(false); setView('queue') }} onBind={handleBindEvidence} onOpenSources={handleOpenEvidenceSources} />}
                  {view === 'governance' && <GovernanceWorkspace model={governance.model} status={governance.status} message={governance.message} bounded={governance.bounded} onRecordDecision={governance.recordDecision} onConfirmBinding={governance.confirmBinding} onImportBundle={governance.importBundle} onExportBundle={governance.exportBundle} onClearBundle={governance.clearBundle} />}
                  {view === 'release' && <ReleaseEvidence mode={collector.state.mode} evidence={collector.state.evidence} manifest={collector.state.releaseManifest} progress={collector.state.releaseProgress} />}
                  {view === 'registry' && <RegistryView registry={registry} session={appState.session} sourceWriteFeedback={sourceWriteFeedback} onSaveSource={handleSaveSource} today={today} selectedId={selectedAssetId} signals={signals} onSelect={setSelectedAssetId} onOpenCheck={signal => handleOpenCheck(signal, 'asset-passport')} onReview={handleReview} onVerify={handleVerify} onDrill={handleDrill} onRecordVersion={handleRecordAssetVersion} onAssignVersionAlias={handleAssignAssetVersionAlias} onRemoveVersionAlias={handleRemoveAssetVersionAlias} />}
                  {view === 'definitions' && <Definitions />}
                  {view === 'exit' && <ExitTest registry={registry} today={today} signals={signals} onSelectAsset={handleSelectAsset} />}
                  {view === 'queue' && (
                    <Queue
                      registry={registry}
                      signals={signals}
                      attentionSignals={flagged}
                      evidence={collector.state.evidence}
                      sources={collector.state.sources}
                      intent={checkIntent}
                      registryScopeHash={registryScopeHash}
                      historyRevision={historyRevision}
                      historyStore={checkHistoryStore}
                      onIntentChange={setCheckIntent}
                      onOpenAsset={handleSelectAsset}
                      onHistoryCleared={() => setHistoryRevision(current => current + 1)}
                    />
                  )}
                  {view === 'activity' && <ActivityLog evidence={collector.state.evidence} />}
                </>
              )}
            </main>
            <EvidenceSources
              mode={collector.state.mode}
              sources={collector.state.sources}
              rejected={collector.state.rejected}
              error={collector.state.error}
              onConfigure={collector.configure}
              onRefresh={collector.refresh}
              onDisconnect={collector.disconnect}
              onRetryRejected={collector.retryRejected}
              onRetryCollector={collector.retryCollector}
              snapshotCount={collector.state.evidence.length}
              onImportSnapshot={collector.importSnapshot}
              onExportSnapshot={collector.exportSnapshot}
              onClearSnapshot={collector.clearSnapshot}
              onNotice={(message, error) => setNotice({ tone: error ? 'error' : 'success', message })}
            />
          </div>

          {showShare && <ShareCard markdown={shareMarkdown} onClose={() => setShowShare(false)} />}
          <footer className="workspace-footer">
            <a href="https://sancussight.vercel.app">https://sancussight.vercel.app</a>
          </footer>
        </div>
      )}
    </>
  )
}

function noticeFromResult(result: SourceOperationResult): ConnectionNotice | undefined {
  if (!result.message) return undefined
  if (result.outcome === 'success') return { tone: 'success', message: result.message }
  if (result.outcome === 'cancelled' || result.outcome === 'unavailable') return { tone: 'neutral', message: result.message }
  return { tone: 'error', message: result.message }
}
