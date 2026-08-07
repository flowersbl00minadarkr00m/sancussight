import type { DiscoveryContext, DiscoveryResult } from '../contracts.ts'
import { discoverFixedInventory } from './common.ts'

export function discoverAgentConfigs(context: DiscoveryContext, manifestPath = 'inventories/agent-configs.json'): DiscoveryResult {
  return discoverFixedInventory(context, {
    adapterId: 'agent-config-manifest',
    sourceType: 'agent-configs',
    kind: 'agent-config',
    defaultManifestPath: manifestPath,
  }, manifestPath)
}
