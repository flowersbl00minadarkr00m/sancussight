import { assertNoProhibitedKeys } from '../contracts.ts'
import {
  assertRegistryImportable,
  type LocalRegistry,
} from './local.ts'

const ABSOLUTE_USER_PATH = /(?:^|["/])(?:[A-Za-z]:[\\/]|Users[\\/]|home[\\/])/i

export function assertPortableRegistrySafe(registry: LocalRegistry): void {
  assertRegistryImportable(registry)
  assertNoProhibitedKeys(registry)
  const serialized = JSON.stringify(registry)
  if (ABSOLUTE_USER_PATH.test(serialized)) throw new Error('Portable registry contains an exact user or home path')
  if (/private\s*key|credential|secret|token|prompt|response|reasoning|command[_-]?arguments?/i.test(serialized)) {
    throw new Error('Portable registry contains a prohibited value')
  }
}

export function serializePortableRegistry(registry: LocalRegistry): string {
  assertPortableRegistrySafe(registry)
  return JSON.stringify(registry, null, 2)
}
