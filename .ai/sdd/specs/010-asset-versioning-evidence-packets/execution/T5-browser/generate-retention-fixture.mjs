import { writeFileSync } from 'node:fs'

const hash = 'b'.repeat(64)
const versions = Array.from({ length: 50 }, (_, index) => ({
  schemaVersion: 1,
  id: `av1_${index.toString(16).padStart(32, '0')}`,
  recordedAt: new Date(Date.UTC(2026, 6, 23, 0, index)).toISOString(),
  sourceRefHashes: [hash],
  verificationRefs: [],
  snapshot: {
    format: 'markdown',
    sharedByDesign: true,
    registryState: 'active',
    supportedVersion: String(index),
    coverage: [{ platform: 'alpha' }],
    providerDependencies: [],
    dependencyIds: [],
  },
}))

const registry = {
  schemaVersion: 2,
  platforms: ['alpha'],
  updatedAt: '2026-07-24T11:15:00.000Z',
  assets: [{
    id: 'sim-retention',
    name: 'Simulated retention fixture',
    kind: 'context',
    format: 'markdown',
    location: 'fixture/retention',
    owner: 'tester',
    sensitivity: 'internal',
    sharedByDesign: true,
    coverage: [{ platform: 'alpha' }],
    providerDependencies: [],
    evidence: [],
    supportedVersion: '50',
    versions,
    versionAliases: [],
    currentVersionId: versions.at(-1).id,
  }],
  provenance: {
    mode: 'local',
    sourceUpdatedAt: '2026-07-24T11:15:00.000Z',
  },
}

writeFileSync(new URL('./simulated-retention.json', import.meta.url), `${JSON.stringify(registry, null, 2)}\n`)
