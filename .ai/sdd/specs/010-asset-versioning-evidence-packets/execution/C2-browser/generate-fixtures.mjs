import { writeFileSync } from 'node:fs'

import {
  computeAssetVersionId,
} from '../../../../../../src/lib/asset-versions.ts'
import {
  serializeConfirmedProposals,
} from '../../../../../../packages/registry-compiler/src/output/local.ts'

const outputRoot = new URL('./', import.meta.url)
const hashA = 'a'.repeat(64)
const hashB = 'b'.repeat(64)

async function version(recordedAt, snapshot, verificationRefs = []) {
  const withoutId = {
    schemaVersion: 1,
    recordedAt,
    sourceRefHashes: [hashA],
    verificationRefs,
    snapshot,
  }
  return {
    ...withoutId,
    id: await computeAssetVersionId(withoutId, sha256),
  }
}

function snapshot(overrides = {}) {
  return {
    format: 'markdown',
    sharedByDesign: true,
    registryState: 'active',
    supportedVersion: '2',
    coverage: [],
    providerDependencies: [],
    dependencyIds: [],
    ...overrides,
  }
}

function registryFor(name, assetId, previous, current) {
  return {
    schemaVersion: 2,
    platforms: ['codex'],
    updatedAt: '2026-07-24T12:20:00.000Z',
    assets: [{
      id: assetId,
      stableId: `sancussight:asset:${assetId}:v1`,
      name,
      kind: 'context',
      format: current.snapshot.format,
      location: `fixture/${assetId}`,
      owner: 'c2-fixture',
      sensitivity: 'internal',
      sharedByDesign: current.snapshot.sharedByDesign,
      coverage: current.snapshot.coverage.map(entry => ({ ...entry })),
      providerDependencies: current.snapshot.providerDependencies.map(entry => ({ ...entry })),
      evidence: [],
      supportedVersion: current.snapshot.supportedVersion,
      dependsOn: [...current.snapshot.dependencyIds],
      versions: [previous, current],
      versionAliases: [{ name: 'preferred', versionId: current.id }],
      currentVersionId: current.id,
    }],
    provenance: {
      mode: 'local',
      sourceUpdatedAt: '2026-07-24T12:20:00.000Z',
    },
  }
}

const unchangedCoverage = Array.from({ length: 100 }, (_, index) => ({
  platform: `platform-${index.toString().padStart(3, '0')}`,
}))
const readyPrevious = await version(
  '2026-07-24T09:00:00.000Z',
  snapshot({ coverage: unchangedCoverage }),
  [{
    checkId: 'check.late',
    resultId: 'result',
    status: 'pass',
    evaluatedAt: '2026-07-24T08:59:00.000Z',
    safeEvidenceHash: hashB,
  }],
)
const readyCurrent = await version(
  '2026-07-24T10:00:00.000Z',
  snapshot({ coverage: unchangedCoverage }),
  [{
    checkId: 'check.late',
    resultId: 'result',
    status: 'fail',
    evaluatedAt: '2026-07-24T09:59:00.000Z',
    safeEvidenceHash: hashB,
  }],
)
const changedFirst = registryFor(
  'C2 changed-first truncation fixture',
  'c2-changed-first',
  readyPrevious,
  readyCurrent,
)

const unavailablePrevious = await version(
  '2026-07-24T09:00:00.000Z',
  snapshot(),
)
const unavailableCurrent = await version(
  '2026-07-24T10:00:00.000Z',
  snapshot({
    dependencyIds: Array.from({ length: 101 }, (_, index) => (
      `dependency-${index.toString().padStart(3, '0')}`
    )),
  }),
)
const unavailable = registryFor(
  'C2 unavailable comparison fixture',
  'c2-unavailable',
  unavailablePrevious,
  unavailableCurrent,
)

const forged = structuredClone(changedFirst)
forged.assets[0].versions[1].id = `av1_${'f'.repeat(32)}`
forged.assets[0].versionAliases[0].versionId = forged.assets[0].versions[1].id
forged.assets[0].currentVersionId = forged.assets[0].versions[1].id

const impossibleDate = structuredClone(changedFirst)
impossibleDate.assets[0].versions[1].snapshot.coverage[0].lastVerified = '2026-02-30'

const selected = proposal('portable')
const seed = serializeConfirmedProposals(
  [selected],
  [decision(selected.proposalId)],
  { runId: 'c2-seed', now: '2026-07-23T12:00:00.000Z' },
).local
const compilerVersionWithoutId = {
  schemaVersion: 1,
  recordedAt: '2026-07-23T11:00:00.000Z',
  sourceRefHashes: ['1'.repeat(64)],
  verificationRefs: [{
    checkId: 'check:portable',
    resultId: 'result:one',
    status: 'pass',
    evaluatedAt: '2026-07-23T10:30:00.000Z',
    safeEvidenceHash: '2'.repeat(64),
  }],
  snapshot: {
    format: 'json',
    sharedByDesign: true,
    registryState: 'active',
    supportedVersion: '1.0',
    coverage: [{ platform: 'linux' }, { platform: 'windows', lastVerified: '2026-07-23' }],
    providerDependencies: [{
      provider: 'C:\\Users\\henry\\secret-provider',
      capability: 'prompt capability',
      fallback: 'henry@example.com',
    }],
    dependencyIds: ['dependency:portable'],
  },
}
const compilerVersion = {
  ...compilerVersionWithoutId,
  id: await computeAssetVersionId(compilerVersionWithoutId, sha256),
}
seed.assets[0].versions = [compilerVersion]
seed.assets[0].versionAliases = [{ name: 'preferred', versionId: compilerVersion.id }]
seed.assets[0].currentVersionId = compilerVersion.id
const portable = serializeConfirmedProposals(
  [selected],
  [decision(selected.proposalId)],
  { runId: 'c2-refresh', now: '2026-07-24T10:00:00.000Z', previousRegistry: seed },
).portable

for (const [file, value] of [
  ['changed-first.json', changedFirst],
  ['unavailable.json', unavailable],
  ['forged-identity.json', forged],
  ['impossible-date.json', impossibleDate],
  ['portable-derivative.json', portable],
]) {
  writeFileSync(new URL(file, outputRoot), `${JSON.stringify(value, null, 2)}\n`)
}

console.log(JSON.stringify({
  changedFirst: {
    previousVersionId: readyPrevious.id,
    currentVersionId: readyCurrent.id,
  },
  unavailable: {
    previousVersionId: unavailablePrevious.id,
    currentVersionId: unavailableCurrent.id,
  },
  portable: {
    sourceVersionId: compilerVersion.id,
    derivedVersionId: portable.assets[0].versions?.[0]?.id,
    qualification: portable.assets[0].versions?.[0]?.qualification,
    derivedFromVersionId: portable.assets[0].versions?.[0]?.derivedFromVersionId,
    aliasTarget: portable.assets[0].versionAliases?.[0]?.versionId,
    currentVersionId: portable.assets[0].currentVersionId,
  },
}))

async function sha256(input) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

function proposal(id) {
  return {
    proposalId: `skill:${id}`,
    identityKey: `skill:stable:${id}`,
    identityConfidence: 'high',
    kind: 'skill',
    displayName: `${id} skill`,
    stableId: `skill:${id}`,
    format: 'json',
    lifecycle: 'active',
    sensitivity: 'internal',
    platforms: ['linux', 'windows'],
    locations: [{
      rootId: 'workspace',
      relativePath: `skills/${id}.json`,
      localPath: `C:/Users/local/.sancussight/skills/${id}.json`,
      portableAlias: `project:skill-${id}`,
    }],
    provenance: [{
      sourceType: 'skills',
      sourceId: id,
      adapterId: 'skills-manifest',
      adapterVersion: '1.0.0',
      rootId: 'workspace',
      platform: 'windows',
      relativePath: 'skills.json',
      observedAt: '2026-07-23T10:00:00.000Z',
    }],
    selectedByDefault: true,
    warnings: [],
  }
}

function decision(proposalId) {
  return { proposalId, decision: 'select' }
}
