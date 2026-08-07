import type { DiscoveryContext, DiscoveryResult } from '../contracts.ts'
import { discoverFixedInventory } from './common.ts'

export function discoverMcps(context: DiscoveryContext, manifestPath = 'inventories/mcps.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'mcp-manifest',
    sourceType: 'mcps',
    kind: 'mcp',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}
