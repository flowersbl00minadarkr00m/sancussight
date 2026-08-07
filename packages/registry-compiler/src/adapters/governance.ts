import type { AssetKind, DiscoveryContext, DiscoveryResult, SourceType } from '../contracts.ts'
import { discoverFixedInventory } from './common.ts'

function discoverGovernanceFamily(context: DiscoveryContext, sourceType: SourceType, kind: AssetKind, manifestPath: string, adapterId: string): DiscoveryResult {
  return discoverFixedInventory(context, { adapterId, sourceType, kind, defaultManifestPath: manifestPath }, manifestPath)
}

export function discoverControls(context: DiscoveryContext, manifestPath = 'inventories/controls.json'): DiscoveryResult {
  return discoverGovernanceFamily(context, 'controls', 'control', manifestPath, 'controls-manifest')
}

export function discoverEvaluations(context: DiscoveryContext, manifestPath = 'inventories/evaluations.json'): DiscoveryResult {
  return discoverGovernanceFamily(context, 'evaluations', 'evaluation', manifestPath, 'evaluations-manifest')
}

export function discoverEvidenceContracts(context: DiscoveryContext, manifestPath = 'inventories/evidence-contracts.json'): DiscoveryResult {
  return discoverGovernanceFamily(context, 'evidence-contracts', 'evidence-contract', manifestPath, 'evidence-contracts-manifest')
}

export function discoverAdapters(context: DiscoveryContext, manifestPath = 'inventories/adapters.json'): DiscoveryResult {
  return discoverGovernanceFamily(context, 'adapters', 'adapter', manifestPath, 'adapters-manifest')
}
