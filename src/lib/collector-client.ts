import type { EvidenceEnvelopeV1, EvidenceSourceState, RejectedEvidenceSummary, ReleaseEvidenceManifestV1 } from '../types'
import type { ReleaseProgressRead } from './release-progress'

export interface CollectorStatus {
  version: 1
  mode: 'local-collector'
  health: string
  csrfToken: string
}

export class CollectorClient {
  private statusPromise: Promise<CollectorStatus | undefined> | undefined
  private csrfToken: string | undefined
  private readonly localMode: boolean
  private readonly request: typeof fetch

  constructor(localMode: boolean, request: typeof fetch = fetch) {
    this.localMode = localMode
    this.request = request.bind(globalThis)
  }

  async status(): Promise<CollectorStatus | undefined> {
    if (!this.localMode) return undefined
    if (!this.statusPromise) {
      this.statusPromise = this.get<CollectorStatus>('/api/v1/status').then((status) => {
        this.csrfToken = status.csrfToken
        return status
      }).catch(() => undefined)
    }
    return this.statusPromise
  }

  sources(): Promise<{ items: EvidenceSourceState[] }> {
    return this.get('/api/v1/sources')
  }

  evidence(): Promise<{ items: EvidenceEnvelopeV1[] }> {
    return this.get('/api/v1/evidence')
  }

  rejected(): Promise<{ items: RejectedEvidenceSummary[] }> {
    return this.get('/api/v1/rejected')
  }

  releaseManifest(): Promise<{ manifest?: ReleaseEvidenceManifestV1 }> {
    return this.get('/api/v1/release-manifest')
  }

  releaseProgress(): Promise<ReleaseProgressRead> {
    return this.get('/api/v1/release-progress')
  }

  retryRejected(id: string): Promise<void> {
    return this.mutate(`/api/v1/rejected/${encodeURIComponent(id)}/retry`, 'POST')
  }

  configure(source: string, artifactPath: string): Promise<EvidenceSourceState> {
    return this.mutate(`/api/v1/sources/${encodeURIComponent(source)}/configure`, 'POST', { artifactPath })
  }

  refresh(source: string): Promise<EvidenceSourceState> {
    return this.mutate(`/api/v1/sources/${encodeURIComponent(source)}/refresh`, 'POST')
  }

  disconnect(source: string): Promise<void> {
    return this.mutate(`/api/v1/sources/${encodeURIComponent(source)}`, 'DELETE')
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.request(path, { credentials: 'same-origin' })
    if (!response.ok) throw await collectorError(response)
    return response.json() as Promise<T>
  }

  private async mutate<T>(path: string, method: string, body?: unknown): Promise<T> {
    if (!this.csrfToken) throw new Error('Collector session is unavailable.')
    const response = await this.request(path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-SancusSight-CSRF': this.csrfToken },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    if (!response.ok) throw await collectorError(response)
    return response.status === 204 ? undefined as T : response.json() as Promise<T>
  }
}

async function collectorError(response: Response): Promise<Error> {
  let code = ''
  try { code = String((await response.json() as { error?: string }).error ?? '') } catch { /* safe fallback */ }
  if (code === 'invalid-source') return new Error('That path does not contain compatible evidence for the selected source.')
  if (code === 'origin-rejected' || code === 'session-required' || code === 'csrf-rejected') return new Error('The local collector session expired. Retry the collector connection.')
  return new Error('Collector request failed.')
}
