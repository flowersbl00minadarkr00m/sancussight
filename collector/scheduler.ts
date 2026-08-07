import type { EvidenceSourceId } from '../src/types.ts'

export type RefreshSource = (source: EvidenceSourceId) => Promise<void>

export class CollectorScheduler {
  private readonly inFlight = new Map<EvidenceSourceId, Promise<void>>()
  private readonly refreshSource: RefreshSource
  private readonly intervalMs: number
  private timer: NodeJS.Timeout | undefined

  constructor(refreshSource: RefreshSource, intervalMs = 15_000) {
    this.refreshSource = refreshSource
    this.intervalMs = intervalMs
  }

  refresh(source: EvidenceSourceId): Promise<void> {
    const current = this.inFlight.get(source)
    if (current) return current
    const operation = this.refreshSource(source).finally(() => this.inFlight.delete(source))
    this.inFlight.set(source, operation)
    return operation
  }

  start(sources: () => EvidenceSourceId[]): void {
    if (this.timer) return
    this.timer = setInterval(() => {
      for (const source of sources()) void this.refresh(source)
    }, this.intervalMs)
    this.timer.unref()
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
  }
}
