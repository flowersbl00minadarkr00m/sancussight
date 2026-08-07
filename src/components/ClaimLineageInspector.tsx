import type {
  ClaimEdgeState,
  ClaimLineage,
  ClaimLineageNode,
  ClaimTruthClass,
} from '../lib/claim-lineage'

const RELATIONSHIP_EXPLANATIONS: Record<ClaimEdgeState, string> = {
  verified: 'Deterministically bound to the named recorded input and rule; not independent proof of the external fact.',
  missing: 'A required accepted input or evidence reference is absent.',
  inferred: 'Suggested by metadata without an exact accepted reference.',
  stale: 'Retained evidence whose source or freshness is no longer current.',
  conflicting: 'Bounded accepted observations make incompatible claims.',
}

export function ClaimLineageInspector({ lineage }: { lineage: ClaimLineage }) {
  const edgesBySource = new Map<string, ClaimLineage['edges']>()
  for (const edge of lineage.edges) {
    const sourceEdges = [...(edgesBySource.get(edge.from) ?? [])]
    sourceEdges.push(edge)
    edgesBySource.set(edge.from, sourceEdges)
  }

  return (
    <div className="claim-lineage-inspector">
      <p className="claim-lineage-bounded">
        Shortest relevant path / bounded to {lineage.maxNodes} nodes
      </p>

      {lineage.nodes.length > 0 ? (
        <ol className="claim-lineage-list">
          {lineage.nodes.map(node => (
            <LineageStep
              key={node.id}
              node={node}
              relationships={edgesBySource.get(node.id) ?? []}
            />
          ))}
        </ol>
      ) : (
        <p className="check-state check-state-uncataloged">
          No cataloged lineage path is available. SancusSight has not invented a rule or relationship.
        </p>
      )}

      {lineage.gaps.length > 0 && (
        <section className="claim-lineage-gaps" aria-labelledby="claim-lineage-gaps-heading">
          <h4 id="claim-lineage-gaps-heading">Explicit gaps</h4>
          <ul>
            {lineage.gaps.map((gap, index) => (
              <li key={`${gap.kind}-${gap.state}-${index}`}>
                <strong>{relationshipLabel(gap.state)} {humanize(gap.kind)}</strong>
                <span>{gap.explanation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="claim-relationship-key" aria-labelledby="claim-relationship-key-heading">
        <h4 id="claim-relationship-key-heading">Relationship states</h4>
        <ul>
          {(Object.keys(RELATIONSHIP_EXPLANATIONS) as ClaimEdgeState[]).map(state => (
            <li key={state}>
              <strong>{relationshipLabel(state)}</strong>
              <span>{RELATIONSHIP_EXPLANATIONS[state]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function LineageStep({
  node,
  relationships,
}: {
  node: ClaimLineageNode
  relationships: ClaimLineage['edges']
}) {
  return (
    <li>
      <div className="claim-lineage-node">
        <div className="claim-lineage-node-heading">
          <span>{humanize(node.kind)}</span>
          <strong>{truthClassLabel(node.truthClass)}</strong>
        </div>
        <p>{node.label}</p>
        {node.reference && <code>{node.reference}</code>}
      </div>
      {relationships.map((relationship) => (
        <div
          key={relationship.id}
          className={`claim-lineage-edge claim-edge-${relationship.state}`}
        >
          <strong>{relationshipLabel(relationship.state)} relationship</strong>
          <span>{relationship.explanation}</span>
        </div>
      ))}
    </li>
  )
}

function truthClassLabel(truthClass: ClaimTruthClass): string {
  switch (truthClass) {
    case 'recorded-fact': return 'Recorded fact'
    case 'deterministic-finding': return 'Deterministic finding'
    case 'human-decision': return 'Human decision'
    case 'missing-evidence': return 'Missing evidence'
  }
}

function relationshipLabel(state: ClaimEdgeState): string {
  return state.charAt(0).toUpperCase() + state.slice(1)
}

function humanize(value: string): string {
  return value.replace(/-/g, ' ')
}
