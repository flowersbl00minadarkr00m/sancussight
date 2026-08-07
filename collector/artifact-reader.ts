import { readFile, readdir, stat } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'

const MAX_ARTIFACT_BYTES = 25 * 1024 * 1024
const MAX_DIRECTORY_ENTRIES = 500

export interface ArtifactMetadata {
  path: string
  name: string
  size: number
  mtimeMs: number
  identity: string
}

export class ReadOnlyArtifactReader {
  async inspect(path: string): Promise<ArtifactMetadata> {
    const resolved = resolve(path)
    const metadata = await stat(resolved)
    if (!metadata.isFile()) throw new Error('Expected an evidence file.')
    if (metadata.size > MAX_ARTIFACT_BYTES) throw new Error('Evidence artifact exceeds the 25 MB safety limit.')
    return {
      path: resolved,
      name: basename(resolved),
      size: metadata.size,
      mtimeMs: metadata.mtimeMs,
      identity: `${metadata.dev}:${metadata.ino}`,
    }
  }

  async readText(path: string): Promise<string> {
    const metadata = await this.inspect(path)
    return readFile(metadata.path, 'utf8')
  }

  async list(directory: string, predicate: (name: string) => boolean): Promise<string[]> {
    const resolved = resolve(directory)
    const metadata = await stat(resolved)
    if (metadata.isFile()) return predicate(basename(resolved)) ? [resolved] : []
    if (!metadata.isDirectory()) throw new Error('Expected an evidence directory.')
    const entries = await readdir(resolved, { withFileTypes: true })
    if (entries.length > MAX_DIRECTORY_ENTRIES) throw new Error('Evidence directory exceeds the 500-entry safety limit.')
    return entries.filter((entry) => entry.isFile() && predicate(entry.name)).map((entry) => join(resolved, entry.name)).sort()
  }

  async jsonFiles(directory: string): Promise<string[]> {
    return this.list(directory, (name) => extname(name).toLowerCase() === '.json')
  }
}
