import type { EvidenceSourceId } from '../../src/types.ts'
import { AgentBeaconAdapter } from './agent-beacon.ts'
import { PipelockAdapter } from './pipelock.ts'
import { PraxenAdapter } from './praxen.ts'
import type { EvidenceAdapter } from './types.ts'
import type { GovernanceAdapter } from './governance-types.ts'
import { FindMnemoAdapter } from './findmnemo.ts'
import { FlowSensaAdapter } from './flowsensa.ts'
import { RuntimeInventoryAdapter } from './runtime-inventory.ts'
import { RampartAdapter } from './rampart.ts'
import { AIMapAdapter } from './aimap.ts'
import { RuntimeTelemetryAdapter } from './runtime-telemetry.ts'

export function createInitialAdapters(): Map<EvidenceSourceId, EvidenceAdapter> {
  return new Map<EvidenceSourceId, EvidenceAdapter>([
    ['agent-beacon', new AgentBeaconAdapter()],
    ['runtime-telemetry', new RuntimeTelemetryAdapter()],
    ['praxen', new PraxenAdapter()],
    ['pipelock', new PipelockAdapter()],
    ['rampart', new RampartAdapter()],
    ['aimap', new AIMapAdapter()],
  ])
}

export function createInitialGovernanceAdapters(): Map<string, GovernanceAdapter> {
  return new Map<string, GovernanceAdapter>([
    ['findmnemo', new FindMnemoAdapter()],
    ['flowsensa', new FlowSensaAdapter()],
    ['runtime-inventory', new RuntimeInventoryAdapter()],
  ])
}
