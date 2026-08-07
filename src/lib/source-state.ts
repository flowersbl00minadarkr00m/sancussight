import type { SourcePermission, SyncState } from '../types'

export type SourceAction =
  | 'refresh'
  | 'save'
  | 'reauthorize'
  | 'reload-source'
  | 'export-working-copy'
  | 'keep-working'
  | 'replace-source'
  | 'disconnect'

export interface SourceState {
  syncState: SyncState
  dirty: boolean
  externalChange: boolean
  readPermission: SourcePermission
  writePermission: SourcePermission
  error?: string
}

export type SourceStateEvent =
  | { type: 'local-edit' }
  | { type: 'source-unchanged' }
  | { type: 'source-changed-valid' }
  | { type: 'source-changed-invalid'; error?: string }
  | { type: 'permission-changed'; mode: 'read' | 'readwrite'; permission: SourcePermission }
  | { type: 'save-preflight-changed' }
  | { type: 'write-succeeded' }
  | { type: 'write-failed'; error?: string }
  | { type: 'reload-source' }
  | { type: 'keep-working' }

export const SYNC_STATE_LABELS: Record<SyncState, string> = {
  current: 'Current',
  unsaved: 'Unsaved changes',
  'external-change': 'Changed externally',
  conflict: 'Conflict',
  'permission-required': 'Permission required',
}

export function createSourceState(overrides: Partial<SourceState> = {}): SourceState {
  return {
    syncState: 'current',
    dirty: false,
    externalChange: false,
    readPermission: 'granted',
    writePermission: 'prompt',
    ...overrides,
  }
}

export function transitionSourceState(state: SourceState, event: SourceStateEvent): SourceState {
  switch (event.type) {
    case 'local-edit':
      return { ...state, dirty: true, syncState: state.externalChange ? 'conflict' : 'unsaved', error: undefined }

    case 'source-unchanged':
      return {
        ...state,
        externalChange: false,
        syncState: state.dirty ? 'unsaved' : 'current',
        error: undefined,
      }

    case 'source-changed-valid':
      if (state.dirty) {
        return { ...state, externalChange: true, syncState: 'conflict', error: undefined }
      }
      return { ...state, externalChange: false, syncState: 'current', error: undefined }

    case 'source-changed-invalid':
      if (state.dirty) {
        return { ...state, externalChange: true, syncState: 'conflict', error: event.error }
      }
      return { ...state, externalChange: true, syncState: 'external-change', error: event.error }

    case 'permission-changed': {
      const next = event.mode === 'read'
        ? { ...state, readPermission: event.permission }
        : { ...state, writePermission: event.permission }
      if (event.mode === 'read' && event.permission !== 'granted') {
        return { ...next, syncState: 'permission-required' }
      }
      if (event.mode === 'read') {
        return { ...next, syncState: stateAfterPermission(next), error: undefined }
      }
      return next
    }

    case 'save-preflight-changed':
      return { ...state, externalChange: true, syncState: 'conflict' }

    case 'write-succeeded':
      return {
        ...state,
        dirty: false,
        externalChange: false,
        syncState: 'current',
        writePermission: 'granted',
        error: undefined,
      }

    case 'write-failed':
      return { ...state, dirty: true, syncState: 'unsaved', error: event.error }

    case 'reload-source':
      return { ...state, dirty: false, externalChange: false, syncState: 'current', error: undefined }

    case 'keep-working':
      return state
  }
}

export function canWriteSource(state: SourceState): boolean {
  return state.readPermission === 'granted'
    && state.dirty
    && !state.externalChange
    && state.syncState === 'unsaved'
}

export function getSourceActions(state: SourceState): SourceAction[] {
  const actions: SourceAction[] = ['refresh', 'replace-source', 'disconnect']

  if (state.readPermission !== 'granted') actions.unshift('reauthorize')
  if (canWriteSource(state)) actions.unshift('save')
  if (state.dirty || state.syncState === 'conflict') actions.push('export-working-copy')
  if (state.syncState === 'conflict') actions.push('reload-source', 'keep-working')

  return actions
}

function stateAfterPermission(state: SourceState): SyncState {
  if (state.dirty && state.externalChange) return 'conflict'
  if (state.externalChange) return 'external-change'
  if (state.dirty) return 'unsaved'
  return 'current'
}
