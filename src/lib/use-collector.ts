import { useCallback, useEffect, useRef, useState } from 'react'
import type { EvidenceEnvelopeV1, EvidenceSourceId, EvidenceSourceState, RejectedEvidenceSummary, ReleaseEvidenceManifestV1 } from '../types'
import type { ReleaseProgressRead } from './release-progress'
import { CollectorClient } from './collector-client'
import { emptyEvidenceSources } from './evidence-catalog'
import { parseEvidenceBundle } from './evidence'
import { EvidenceSnapshotStore } from './evidence-snapshot-store'

export type CollectorMode = 'hosted' | 'connecting' | 'live' | 'degraded'

export interface CollectorViewState {
  mode: CollectorMode
  sources: EvidenceSourceState[]
  evidence: EvidenceEnvelopeV1[]
  rejected: RejectedEvidenceSummary[]
  releaseManifest?: ReleaseEvidenceManifestV1
  releaseProgress?: ReleaseProgressRead
  error?: string
}

const isLocalCollectorMode = document.querySelector<HTMLMetaElement>('meta[name="sancussight-mode"]')?.content === 'local-collector'
const snapshotStore = new EvidenceSnapshotStore()

export function useCollector() {
  const clientRef = useRef<CollectorClient | undefined>(undefined)
  const [state, setState] = useState<CollectorViewState>({
    mode: isLocalCollectorMode ? 'connecting' : 'hosted',
    sources: emptyEvidenceSources(),
    evidence: [],
    rejected: [],
  })

  const loadData = useCallback(async (client: CollectorClient) => {
    const [sources, evidence, rejected, release, progress] = await Promise.all([client.sources(), client.evidence(), client.rejected(), client.releaseManifest(), client.releaseProgress()])
    setState({ mode: 'live', sources: sources.items, evidence: evidence.items, rejected: rejected.items, ...(release.manifest ? { releaseManifest: release.manifest } : {}), releaseProgress: progress })
  }, [])

  const connect = useCallback(async (force = false) => {
    if (!isLocalCollectorMode) return
    const client = !force && clientRef.current ? clientRef.current : new CollectorClient(true)
    clientRef.current = client
    setState((current) => ({ ...current, mode: 'connecting', error: undefined }))
    const status = await client.status()
    if (!status) {
      setState((current) => degradedState(current, 'Collector unavailable. Retained evidence may be stale.'))
      return
    }
    try {
      await loadData(client)
    } catch {
      setState((current) => degradedState(current, 'Collector data could not be refreshed.'))
    }
  }, [loadData])

  useEffect(() => {
    if (!isLocalCollectorMode) {
      void snapshotStore.load().then((snapshot) => setState((current) => ({ ...current, evidence: snapshot.evidence, ...(snapshot.releaseManifest ? { releaseManifest: snapshot.releaseManifest } : {}) }))).catch(() => undefined)
      return
    }
    void connect()
    const timer = window.setInterval(() => {
      const client = clientRef.current
      if (client) void loadData(client).catch(() => setState((current) => degradedState(current, 'Collector refresh failed.')))
    }, 15_000)
    return () => window.clearInterval(timer)
  }, [connect, loadData])

  const configure = useCallback(async (source: EvidenceSourceId, artifactPath: string) => {
    const client = requireClient(clientRef.current)
    await client.configure(source, artifactPath)
    await client.refresh(source)
    await loadData(client)
  }, [loadData])

  const refresh = useCallback(async (source: EvidenceSourceId) => {
    const client = requireClient(clientRef.current)
    await client.refresh(source)
    await loadData(client)
  }, [loadData])

  const disconnect = useCallback(async (source: EvidenceSourceId) => {
    const client = requireClient(clientRef.current)
    await client.disconnect(source)
    await loadData(client)
  }, [loadData])

  const retryRejected = useCallback(async (id: string) => {
    const client = requireClient(clientRef.current)
    await client.retryRejected(id)
    await loadData(client)
  }, [loadData])

  const importSnapshot = useCallback(async (raw: string): Promise<number> => {
    const bundle = parseEvidenceBundle(raw)
    if (!bundle) throw new Error('That file is not a compatible SancusSight evidence snapshot.')
    await snapshotStore.save(bundle.evidence, bundle.releaseManifest)
    setState((current) => ({ ...current, evidence: bundle.evidence, ...(bundle.releaseManifest ? { releaseManifest: bundle.releaseManifest } : { releaseManifest: undefined }) }))
    return bundle.evidence.length
  }, [])

  const exportSnapshot = useCallback((): string => JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    evidence: state.evidence,
    ...(state.releaseManifest ? { releaseManifest: state.releaseManifest } : {}),
  }, null, 2), [state.evidence, state.releaseManifest])

  const clearSnapshot = useCallback(async () => {
    await snapshotStore.clear()
    setState((current) => ({ ...current, evidence: [], releaseManifest: undefined }))
  }, [])

  return { state, configure, refresh, disconnect, retryRejected, retryCollector: () => connect(true), importSnapshot, exportSnapshot, clearSnapshot }
}

function requireClient(client: CollectorClient | undefined): CollectorClient {
  if (!client) throw new Error('Local collector is unavailable.')
  return client
}

function degradedState(current: CollectorViewState, error: string): CollectorViewState {
  return {
    ...current,
    mode: 'degraded',
    sources: current.sources.map((source) => source.health === 'current' ? { ...source, health: 'stale' } : source),
    error,
  }
}
