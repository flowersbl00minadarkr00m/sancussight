import type { GovernanceBinding, GovernanceEventV1, HumanDecisionPayload } from '../domain/governance/model.ts'
import type { GovernanceBundleV1 } from '../domain/governance/export.ts'
import type { ControlLedgerRow, GovernanceReadModel, InventoryLedgerRow } from '../domain/governance/project.ts'

export interface GovernancePage<T> {
  items: T[]
  nextCursor?: string
}

export async function getGovernanceEvents(query: { cursor?: string; limit?: number; source?: string } = {}): Promise<GovernancePage<GovernanceEventV1>> {
  const params = new URLSearchParams()
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.source) params.set('source', query.source)
  return getJson<GovernancePage<GovernanceEventV1>>(`/api/v1/governance/events${params.size ? `?${params}` : ''}`)
}

export async function getGovernanceSummary(): Promise<GovernanceReadModel> {
  return getJson<GovernanceReadModel>('/api/v1/governance/summary')
}

export async function getGovernanceInventory(query: { cursor?: string; limit?: number } = {}): Promise<GovernancePage<InventoryLedgerRow>> {
  return getJson<GovernancePage<InventoryLedgerRow>>(collectionUrl('/api/v1/governance/inventory', query))
}

export async function getGovernanceControls(query: { cursor?: string; limit?: number } = {}): Promise<GovernancePage<ControlLedgerRow>> {
  return getJson<GovernancePage<ControlLedgerRow>>(collectionUrl('/api/v1/governance/controls', query))
}

export async function getGovernanceLineage(id: string): Promise<unknown> {
  return getJson<unknown>(`/api/v1/governance/lineage/${encodeURIComponent(id)}`)
}

export async function getGovernanceBundle(): Promise<GovernanceBundleV1> {
  return getJson<GovernanceBundleV1>('/api/v1/governance/export')
}

export async function postGovernanceDecision(input: HumanDecisionPayload, csrfToken: string): Promise<GovernanceEventV1> {
  return postJson<GovernanceEventV1>('/api/v1/governance/decisions', input, csrfToken)
}

export async function getGovernanceCsrfToken(): Promise<string> {
  const response = await fetch('/api/v1/status', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
  const value = await parseResponse<{ csrfToken?: unknown }>(response)
  if (typeof value.csrfToken !== 'string' || !value.csrfToken) throw new Error('Local collector session is unavailable.')
  return value.csrfToken
}

export async function postGovernanceBinding(input: Omit<GovernanceBinding, 'id'>, csrfToken: string): Promise<GovernanceBinding> {
  return postJson<GovernanceBinding>('/api/v1/governance/bindings', input, csrfToken)
}

function collectionUrl(path: string, query: { cursor?: string; limit?: number }): string {
  const params = new URLSearchParams()
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  return `${path}${params.size ? `?${params}` : ''}`
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
  return parseResponse<T>(response)
}

async function postJson<T>(url: string, body: unknown, csrfToken: string): Promise<T> {
  const response = await fetch(url, {
    method: 'POST', credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-SancusSight-CSRF': csrfToken },
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

async function parseResponse<T>(response: Response): Promise<T> {
  const value = await response.json().catch(() => undefined)
  if (!response.ok) throw new Error(value && typeof value === 'object' && 'error' in value ? String((value as { error: unknown }).error) : `governance-request-${response.status}`)
  return value as T
}
