import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EvidenceSourceState } from '../types'
import type { GovernanceBinding, HumanDecisionPayload } from '../domain/governance/model'
import type { GovernanceEventV1 } from '../domain/governance/model'
import { buildGovernanceReadModel, type GovernanceReadModel } from '../domain/governance/project'
import { createGovernanceBundle, manualizeGovernanceProjection, parseGovernanceBundle } from '../domain/governance/export'
import { createHostedBinding, createHostedHumanDecision } from '../domain/governance/manual'
import { getGovernanceBundle, getGovernanceCsrfToken, getGovernanceEvents, getGovernanceSummary, postGovernanceBinding, postGovernanceDecision } from './governance-client'
import { GovernanceSnapshotStore } from './governance-snapshot-store'
import type { CollectorMode } from './use-collector'

export type GovernanceLoadState = 'manual' | 'loading' | 'live' | 'degraded'

export interface GovernanceViewState {
  model: GovernanceReadModel
  events: GovernanceEventV1[]
  bindings: GovernanceBinding[]
  status: GovernanceLoadState
  message: string
  bounded: boolean
}

export interface GovernanceActions {
  recordDecision(input: HumanDecisionPayload): Promise<void>
  confirmBinding(input: Omit<GovernanceBinding, 'id'>): Promise<void>
  importBundle(raw: string): Promise<void>
  exportBundle(): Promise<string>
  clearBundle(): Promise<void>
}

const EMPTY_MODEL: GovernanceReadModel = {
  generatedAt: new Date(0).toISOString(), inventory: [], activity: [], controls: [], decisions: [], outcomes: [], lineage: [], sourceStates: [], gaps: [], eventCount: 0,
}
const EMPTY_STATE: GovernanceViewState = { model: EMPTY_MODEL, events: [], bindings: [], status: 'manual', message: '', bounded: false }
const snapshotStore = new GovernanceSnapshotStore()

export function useGovernance(mode: CollectorMode, sourceStates: readonly EvidenceSourceState[]): GovernanceViewState & GovernanceActions {
  const [state, setState] = useState<GovernanceViewState>(() => ({ ...EMPTY_STATE, status: mode === 'live' ? 'loading' : 'manual', message: mode === 'live' ? 'Loading the bounded local governance page.' : 'Hosted/manual mode: import a governance snapshot to inspect local ledgers.' }))
  const sourceKey = useMemo(() => sourceStates.map(source => `${source.id}:${source.health}:${source.lastAcceptedAt ?? ''}`).join('|'), [sourceStates])

  useEffect(() => {
    let active = true
    if (mode !== 'live') {
      snapshotStore.load().then(bundle => {
        if (!active) return
        if (!bundle) { setState({ ...EMPTY_STATE, status: 'manual', message: 'Hosted/manual mode: no localhost request was made. Import a governance snapshot to inspect local ledgers.' }); return }
        setState({ ...manualState(bundle), status: 'manual', message: `Manual governance snapshot imported ${new Date(bundle.exportedAt).toLocaleString()}; local freshness and upstream enforcement are not claimed.`, bounded: false })
      }).catch(() => { if (active) setState({ ...EMPTY_STATE, status: 'manual', message: 'Hosted/manual storage is unavailable. Import remains explicit and read-only.' }) })
      return () => { active = false }
    }
    setState(current => ({ ...current, status: 'loading', message: 'Loading the bounded local governance projection…' }))
    getGovernanceSummary().then(model => {
      if (!active) return
      setState({ model, events: [], bindings: [], status: 'live', message: 'Showing the local collector governance projection.', bounded: model.eventCount > 100 })
    }).catch(async () => {
      try {
        const page = await getGovernanceEvents({ limit: 100 })
        if (!active) return
        const now = new Date().toISOString()
        setState({ model: buildGovernanceReadModel({ events: page.items, sourceStates, now }), events: page.items, bindings: [], status: 'live', message: page.nextCursor ? 'Showing the first bounded page; more events remain available through the collector cursor.' : 'Showing the current bounded governance page.', bounded: !!page.nextCursor })
      } catch {
        if (active) setState({ ...EMPTY_STATE, status: 'degraded', message: 'The local governance API is unavailable. Retained evidence remains read-only and no upstream action is available.', bounded: true })
      }
    })
    return () => { active = false }
  }, [mode, sourceKey])

  const refresh = useCallback(async () => {
    if (mode !== 'live') throw new Error('Hosted/manual governance snapshots are read-only in this slice.')
    const model = await getGovernanceSummary()
    setState({ model, events: [], bindings: [], status: 'live', message: 'Showing the local collector governance projection.', bounded: model.eventCount > 100 })
  }, [mode, sourceKey])
  const recordDecision = useCallback(async (input: HumanDecisionPayload) => {
    if (mode === 'live') { await postGovernanceDecision(input, await getGovernanceCsrfToken()); await refresh(); return }
    if (!state.events.length) throw new Error('Hosted/manual decisions require a snapshot with retained event history.')
    const event = createHostedHumanDecision(input, state.events)
    const events = [...state.events, event]
    const bundle = createGovernanceBundle(buildGovernanceReadModel({ events, bindings: state.bindings, now: new Date().toISOString() }), { mode: 'hosted-manual', events, bindings: state.bindings })
    await snapshotStore.save(bundle)
    setState({ ...manualState(bundle), status: 'manual', message: 'Hosted/manual decision appended to the browser-local governance snapshot; upstream execution remains unavailable.', bounded: false })
  }, [mode, refresh, state.events, state.bindings])
  const confirmBinding = useCallback(async (input: Omit<GovernanceBinding, 'id'>) => {
    if (mode === 'live') { await postGovernanceBinding(input, await getGovernanceCsrfToken()); await refresh(); return }
    if (!state.events.length) throw new Error('Hosted/manual bindings require a snapshot with retained event history.')
    const binding = createHostedBinding(input, state.events)
    const bindings = [...state.bindings, binding]
    const bundle = createGovernanceBundle(buildGovernanceReadModel({ events: state.events, bindings, now: new Date().toISOString() }), { mode: 'hosted-manual', events: state.events, bindings })
    await snapshotStore.save(bundle)
    setState({ ...manualState(bundle), status: 'manual', message: 'Hosted/manual binding appended to the browser-local governance snapshot; upstream execution remains unavailable.', bounded: false })
  }, [mode, refresh, state.events, state.bindings])

  const importBundle = useCallback(async (raw: string) => {
    const parsed: unknown = JSON.parse(raw)
    const bundle = parseGovernanceBundle(parsed)
    if (!bundle) throw new Error('That file is not a compatible SancusSight governance bundle.')
    await snapshotStore.save(bundle)
    setState({ ...manualState(bundle), status: 'manual', message: 'Manual governance snapshot imported. Local freshness and upstream enforcement are not claimed.', bounded: false })
  }, [])
  const exportBundle = useCallback(async () => {
    if (mode === 'live') return JSON.stringify(await getGovernanceBundle(), null, 2)
    return JSON.stringify(createGovernanceBundle(state.model, { mode: 'hosted-manual', events: state.events, bindings: state.bindings }), null, 2)
  }, [mode, state.model, state.events, state.bindings])
  const clearBundle = useCallback(async () => { await snapshotStore.clear(); setState({ ...EMPTY_STATE, status: mode === 'live' ? 'loading' : 'manual', message: mode === 'live' ? 'Local governance projection will reload.' : 'Manual governance snapshot cleared. No localhost request was made.' }) }, [mode])

  return { ...state, recordDecision, confirmBinding, importBundle, exportBundle, clearBundle }
}

function manualState(bundle: ReturnType<typeof parseGovernanceBundle>): GovernanceViewState {
  if (!bundle) return { ...EMPTY_STATE }
  const events = bundle.events ?? []
  const bindings = bundle.bindings ?? []
  const model = events.length ? buildGovernanceReadModel({ events, bindings, now: new Date().toISOString() }) : bundle.projection
  return { model: manualizeGovernanceProjection(model), events, bindings, status: 'manual', message: '', bounded: false }
}
