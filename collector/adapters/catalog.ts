export { EVIDENCE_ADAPTER_CATALOG as ADAPTER_CATALOG } from '../../src/lib/evidence-catalog.ts'
export type { AdapterCatalogEntry } from '../../src/types.ts'

export const GOVERNANCE_ADAPTER_CATALOG = [
  { id: 'findmnemo', displayName: 'FindMnemo', evidenceType: 'Observed-work and WorkEvent 1.0.0', boundary: 'Read-only intent and handoff context' },
  { id: 'flowsensa', displayName: 'FlowSensa', evidenceType: 'Versioned workflow projection', boundary: 'Read-only workflow/process context' },
  { id: 'runtime-inventory', displayName: 'Runtime inventory', evidenceType: 'Allowlisted local snapshot', boundary: 'Explicit snapshot only; no machine enumeration' },
] as const
