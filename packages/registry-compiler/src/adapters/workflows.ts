import type { DiscoveryContext, DiscoveryResult } from '../contracts.ts'
import { discoverFixedInventory } from './common.ts'

export function discoverCommands(context: DiscoveryContext, manifestPath = 'inventories/commands.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'commands-manifest',
    sourceType: 'commands',
    kind: 'command',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}

export function discoverLoops(context: DiscoveryContext, manifestPath = 'inventories/loops.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'loops-manifest',
    sourceType: 'loops',
    kind: 'loop',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}

export function discoverWorkflows(context: DiscoveryContext, manifestPath = 'inventories/workflows.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'workflows-manifest',
    sourceType: 'workflows',
    kind: 'workflow',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}
