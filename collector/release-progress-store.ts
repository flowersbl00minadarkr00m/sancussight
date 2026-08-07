import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { isProgressStale, validateReleaseProgressSnapshot, type ReleaseProgressRead } from '../src/lib/release-progress.ts'

const DEFAULT_PROGRESS_PATH = resolve(
  process.env.LOCALAPPDATA ?? homedir(),
  'SancusSight', 'operations', 'progress', 'current.json',
)

/** Read-only access to the fixed operator-side progress snapshot. */
export class ReleaseProgressStore {
  private readonly progressPath: string

  constructor(progressPath = DEFAULT_PROGRESS_PATH) {
    this.progressPath = progressPath
  }

  async read(now = new Date().toISOString()): Promise<ReleaseProgressRead> {
    let raw: unknown
    try {
      raw = JSON.parse(await readFile(this.progressPath, 'utf8')) as unknown
    } catch {
      return { stale: true, errors: ['progress:unavailable'] }
    }
    const validation = validateReleaseProgressSnapshot(raw)
    if (!validation.valid || !validation.snapshot) return { stale: true, errors: ['progress:invalid'] }
    const stale = isProgressStale(validation.snapshot, now)
    return { snapshot: validation.snapshot, stale, errors: stale ? ['progress:stale'] : [] }
  }
}

export { DEFAULT_PROGRESS_PATH }
