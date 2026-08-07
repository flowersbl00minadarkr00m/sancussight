/// <reference types="node" />

import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const RELEASE_RUN_DESCRIPTOR_SCHEMA_VERSION = 1 as const
export const RELEASE_RUN_DESCRIPTOR_PURPOSE = 'a002-t16' as const
export const RELEASE_RUN_RUNTIME_TARGET_ID = 'sancussight-local-runtimes' as const
export const RELEASE_RUN_WINDOW_MS = 30 * 60_000
export const RELEASE_RUN_DESCRIPTOR_ENV = 'SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR'

const RELEASE_RUN_ID_PATTERN = /^[A-Za-z0-9._-]{1,160}$/
const CANONICAL_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const FIELD_NAMES = ['schemaVersion', 'releaseRunId', 'startedAt', 'runtimeTargetId', 'purpose'] as const

export interface ReleaseRunDescriptorV1 {
  schemaVersion: typeof RELEASE_RUN_DESCRIPTOR_SCHEMA_VERSION
  releaseRunId: string
  startedAt: string
  runtimeTargetId: typeof RELEASE_RUN_RUNTIME_TARGET_ID
  purpose: typeof RELEASE_RUN_DESCRIPTOR_PURPOSE
}

export interface BoundReleaseRunDescriptor extends ReleaseRunDescriptorV1 {
  descriptorPath: string
}

interface DescriptorSnapshot {
  binding: Readonly<BoundReleaseRunDescriptor>
  contentHash: string
  fileIdentity: string
}

export interface ReleaseRunDescriptorBinder {
  bind(descriptorPath?: string, localAppDataRoot?: string): Readonly<BoundReleaseRunDescriptor>
  current(): Readonly<BoundReleaseRunDescriptor> | undefined
}

export function resolveReleaseRunDescriptorPath(releaseRunId: string, localAppDataRoot = process.env.LOCALAPPDATA): string {
  assertReleaseRunId(releaseRunId)
  if (!localAppDataRoot?.trim()) throw new Error('RELEASE_DESCRIPTOR_LOCALAPPDATA_REQUIRED')
  return resolve(localAppDataRoot, 'SancusSight', 'operations', 'runs', releaseRunId, 'release-run.json')
}

export function parseReleaseRunDescriptorText(text: string): Readonly<ReleaseRunDescriptorV1> {
  if (text.charCodeAt(0) === 0xfeff) throw new Error('RELEASE_DESCRIPTOR_BOM_FORBIDDEN')

  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('RELEASE_DESCRIPTOR_JSON_INVALID')
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('RELEASE_DESCRIPTOR_OBJECT_REQUIRED')

  const raw = value as Record<string, unknown>
  const keys = Object.keys(raw)
  if (keys.length !== FIELD_NAMES.length || FIELD_NAMES.some(field => !Object.hasOwn(raw, field))) {
    throw new Error('RELEASE_DESCRIPTOR_FIELDS_INVALID')
  }
  if (keys.some(key => !(FIELD_NAMES as readonly string[]).includes(key))) throw new Error('RELEASE_DESCRIPTOR_UNKNOWN_FIELD')
  for (const field of FIELD_NAMES) {
    const occurrences = text.match(new RegExp(`"${field}"\\s*:`, 'g'))?.length ?? 0
    if (occurrences !== 1) throw new Error('RELEASE_DESCRIPTOR_DUPLICATE_FIELD')
  }

  if (raw.schemaVersion !== RELEASE_RUN_DESCRIPTOR_SCHEMA_VERSION) throw new Error('RELEASE_DESCRIPTOR_SCHEMA_VERSION_INVALID')
  if (typeof raw.releaseRunId !== 'string') throw new Error('RELEASE_DESCRIPTOR_RUN_ID_INVALID')
  assertReleaseRunId(raw.releaseRunId)
  if (typeof raw.startedAt !== 'string' || !isCanonicalUtc(raw.startedAt)) throw new Error('RELEASE_DESCRIPTOR_STARTED_AT_INVALID')
  if (raw.runtimeTargetId !== RELEASE_RUN_RUNTIME_TARGET_ID) throw new Error('RELEASE_DESCRIPTOR_RUNTIME_TARGET_INVALID')
  if (raw.purpose !== RELEASE_RUN_DESCRIPTOR_PURPOSE) throw new Error('RELEASE_DESCRIPTOR_PURPOSE_INVALID')

  return Object.freeze({
    schemaVersion: RELEASE_RUN_DESCRIPTOR_SCHEMA_VERSION,
    releaseRunId: raw.releaseRunId,
    startedAt: raw.startedAt,
    runtimeTargetId: RELEASE_RUN_RUNTIME_TARGET_ID,
    purpose: RELEASE_RUN_DESCRIPTOR_PURPOSE,
  })
}

export function readReleaseRunDescriptor(
  descriptorPath = process.env[RELEASE_RUN_DESCRIPTOR_ENV],
  localAppDataRoot = process.env.LOCALAPPDATA,
): { descriptor: Readonly<ReleaseRunDescriptorV1>; descriptorPath: string; contentHash: string; fileIdentity: string } {
  if (!descriptorPath?.trim()) throw new Error('RELEASE_DESCRIPTOR_PATH_REQUIRED')
  const resolvedPath = resolve(descriptorPath)
  const bytes = readFileSync(resolvedPath)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    throw new Error('RELEASE_DESCRIPTOR_BOM_FORBIDDEN')
  }
  const descriptor = parseReleaseRunDescriptorText(bytes.toString('utf8'))
  const expectedPath = resolveReleaseRunDescriptorPath(descriptor.releaseRunId, localAppDataRoot)
  if (!samePath(resolvedPath, expectedPath)) throw new Error('RELEASE_DESCRIPTOR_PATH_MISMATCH')
  const stats = statSync(resolvedPath)
  if (!stats.isFile()) throw new Error('RELEASE_DESCRIPTOR_FILE_REQUIRED')
  return {
    descriptor,
    descriptorPath: resolvedPath,
    contentHash: createHash('sha256').update(bytes).digest('hex'),
    fileIdentity: [stats.dev, stats.ino, stats.size, stats.birthtimeMs, stats.ctimeMs, stats.mtimeMs].join(':'),
  }
}

export function createReleaseRunDescriptorBinder(): ReleaseRunDescriptorBinder {
  let snapshot: DescriptorSnapshot | undefined
  return {
    bind(descriptorPath, localAppDataRoot) {
      const next = readReleaseRunDescriptor(descriptorPath, localAppDataRoot)
      const binding = Object.freeze({ ...next.descriptor, descriptorPath: next.descriptorPath })
      if (!snapshot) {
        snapshot = { binding, contentHash: next.contentHash, fileIdentity: next.fileIdentity }
        return snapshot.binding
      }
      if (
        !samePath(snapshot.binding.descriptorPath, next.descriptorPath)
        || snapshot.contentHash !== next.contentHash
        || snapshot.fileIdentity !== next.fileIdentity
      ) {
        throw new Error('RELEASE_DESCRIPTOR_REBIND_FORBIDDEN')
      }
      return snapshot.binding
    },
    current() {
      return snapshot?.binding
    },
  }
}

const processBinder = createReleaseRunDescriptorBinder()

export function bindReleaseRunDescriptor(
  descriptorPath = process.env[RELEASE_RUN_DESCRIPTOR_ENV],
  localAppDataRoot = process.env.LOCALAPPDATA,
): Readonly<BoundReleaseRunDescriptor> {
  return processBinder.bind(descriptorPath, localAppDataRoot)
}

export function assertDescriptorEnvironment(
  descriptor: ReleaseRunDescriptorV1,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const environmentRunId = environment.SANCUSSIGHT_RELEASE_RUN_ID
  const environmentTargetId = environment.SANCUSSIGHT_RUNTIME_TARGET_ID
  if (environmentRunId !== undefined && environmentRunId !== descriptor.releaseRunId) {
    throw new Error('RELEASE_DESCRIPTOR_ENV_RUN_MISMATCH')
  }
  if (environmentTargetId !== undefined && environmentTargetId !== descriptor.runtimeTargetId) {
    throw new Error('RELEASE_DESCRIPTOR_ENV_TARGET_MISMATCH')
  }
}

export function assertObservationWithinReleaseRun(
  descriptor: ReleaseRunDescriptorV1,
  observedAt: string,
  evaluatedAt: string,
): void {
  if (!isCanonicalUtc(observedAt) || !isCanonicalUtc(evaluatedAt)) throw new Error('RELEASE_DESCRIPTOR_OBSERVATION_TIME_INVALID')
  const startedMs = Date.parse(descriptor.startedAt)
  const observedMs = Date.parse(observedAt)
  const evaluatedMs = Date.parse(evaluatedAt)
  if (observedMs < startedMs) throw new Error('RELEASE_DESCRIPTOR_OBSERVATION_PRE_RUN')
  if (observedMs > evaluatedMs) throw new Error('RELEASE_DESCRIPTOR_OBSERVATION_FUTURE')
  if (observedMs - startedMs > RELEASE_RUN_WINDOW_MS) throw new Error('RELEASE_DESCRIPTOR_OBSERVATION_AFTER_DEADLINE')
  if (evaluatedMs - startedMs > RELEASE_RUN_WINDOW_MS) throw new Error('RELEASE_DESCRIPTOR_EVALUATION_AFTER_DEADLINE')
}

export function descriptorRunRoot(descriptor: BoundReleaseRunDescriptor): string {
  return dirname(descriptor.descriptorPath)
}

function assertReleaseRunId(value: string): void {
  if (!RELEASE_RUN_ID_PATTERN.test(value)) throw new Error('RELEASE_DESCRIPTOR_RUN_ID_INVALID')
}

function isCanonicalUtc(value: string): boolean {
  if (!CANONICAL_UTC_PATTERN.test(value)) return false
  const milliseconds = Date.parse(value)
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value
}

function samePath(left: string, right: string): boolean {
  return process.platform === 'win32'
    ? resolve(left).toLocaleLowerCase('en-US') === resolve(right).toLocaleLowerCase('en-US')
    : resolve(left) === resolve(right)
}
