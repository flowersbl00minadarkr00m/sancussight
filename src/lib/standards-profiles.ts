import type {
  InteroperabilityProfileId,
  InteroperabilityProfileV1,
} from '../types.ts'

const profiles: InteroperabilityProfileV1[] = [
  {
    schemaVersion: 1,
    id: 'openlineage-run-event-core-1.0.5',
    projectionVersion: 1,
    upstreamName: 'OpenLineage',
    upstreamVersion: '1.0.5',
    upstreamProfile: 'RunEvent core',
    stability: 'stable',
    sourceUrl: 'https://openlineage.io/spec/1-0-5/OpenLineage.json',
    acceptedInputKind: 'local-json-or-jsonl',
    limitation: 'Metadata-only RunEvent core preview; facets are omitted and the result is not verified SancusSight evidence.',
  },
  {
    schemaVersion: 1,
    id: 'otel-genai-metadata-preview-1',
    projectionVersion: 1,
    upstreamName: 'OpenTelemetry Semantic Conventions',
    upstreamVersion: '1.41.1',
    upstreamProfile: 'Generative AI metadata subset',
    stability: 'development',
    sourceUrl: 'https://github.com/open-telemetry/semantic-conventions/tree/v1.41.1/docs/gen-ai',
    acceptedInputKind: 'accepted-runtime-metadata',
    limitation: 'Metadata alignment preview only; no spans, OTLP payloads, content attributes, or conformance claim.',
  },
  {
    schemaVersion: 1,
    id: 'openinference-metadata-preview-1',
    projectionVersion: 1,
    upstreamName: 'OpenInference',
    upstreamVersion: '2.5.0',
    upstreamProfile: 'Semantic conventions metadata subset',
    stability: 'experimental',
    sourceUrl: 'https://www.npmjs.com/package/@arizeai/openinference-semantic-conventions/v/2.5.0',
    acceptedInputKind: 'accepted-runtime-metadata',
    limitation: 'Metadata alignment preview only; prompts, responses, reasoning, tool payloads, documents, images, and URLs are omitted.',
  },
  {
    schemaVersion: 1,
    id: 'sancussight-in-toto-statement-1',
    projectionVersion: 1,
    upstreamName: 'in-toto Attestation Framework',
    upstreamVersion: 'Statement v1',
    upstreamProfile: 'Unsigned Statement with SancusSight predicate v1',
    stability: 'stable',
    sourceUrl: 'https://github.com/in-toto/attestation/blob/v1.2.0/spec/v1/statement.md',
    acceptedInputKind: 'validated-evidence-packet',
    limitation: 'Unsigned Statement projection only; no DSSE envelope, signer identity, or external verification.',
  },
]

for (const profile of profiles) Object.freeze(profile)

export const INTEROPERABILITY_PROFILES: readonly InteroperabilityProfileV1[] =
  Object.freeze(profiles)

const profilesById = new Map<InteroperabilityProfileId, InteroperabilityProfileV1>(
  INTEROPERABILITY_PROFILES.map(profile => [profile.id, profile]),
)

export function getInteroperabilityProfile(
  id: string,
): InteroperabilityProfileV1 | undefined {
  return profilesById.get(id as InteroperabilityProfileId)
}
