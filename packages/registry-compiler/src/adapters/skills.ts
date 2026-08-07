import type { DiscoveryContext, DiscoveryResult } from '../contracts.ts'
import { discoverFixedInventory } from './common.ts'

export function discoverSkills(context: DiscoveryContext, manifestPath = 'inventories/skills.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'skills-manifest',
    sourceType: 'skills',
    kind: 'skill',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}

export function discoverPlugins(context: DiscoveryContext, manifestPath = 'inventories/plugins.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'plugins-manifest',
    sourceType: 'plugins',
    kind: 'plugin',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}
