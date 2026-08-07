# Feature 011 Standards Research

> Supporting evidence only. This note does not approve a product contract or
> claim conformance.
> Researched: 2026-07-24

## OpenLineage

- Official overview: https://openlineage.io/docs/
- Official API model: https://openlineage.io/apidocs/openapi/
- Official facet guidance: https://openlineage.io/docs/spec/facets/
- Observed contract: OpenLineage identifies run, job, and dataset entities and
  carries extensible facets. Core events include an event time, producer,
  schema URL, and typed entity payload.
- SancusSight implication: accept only a bounded, version-identified subset of
  core metadata. Hash external entity identifiers and URLs before retention;
  reject or explicitly omit facets instead of treating arbitrary facet content
  as safe evidence.

## OpenTelemetry

- Semantic conventions: https://opentelemetry.io/docs/specs/semconv/
- Sensitive-data guidance:
  https://opentelemetry.io/docs/security/handling-sensitive-data/
- Observed contract: semantic conventions define common attribute names and
  types, but convention groups have independent stability levels. The official
  guidance places responsibility for data minimization and sensitive-data
  handling on the implementer.
- SancusSight implication: version every alignment profile, expose stability,
  and retain only fixed metadata attributes already accepted by SancusSight.
  Alignment is not generic OTLP ingestion or an OpenTelemetry compliance claim.

## OpenInference

- Specification: https://arize-ai.github.io/openinference/spec/
- Semantic conventions:
  https://arize-ai.github.io/openinference/spec/semantic_conventions.html
- Observed contract: OpenInference builds on OpenTelemetry and requires
  `openinference.span.kind`; its broader attribute vocabulary can include
  prompts, responses, tool arguments, documents, images, reasoning, and other
  content-bearing values.
- SancusSight implication: map only a small metadata-only subset such as span
  kind, operation class, provider class, status, and safe hashed references.
  Prohibit all content-bearing attributes even when they are valid
  OpenInference.

## in-toto Attestation Framework

- Official framework specification:
  https://github.com/in-toto/attestation/blob/main/spec/README.md
- Observed contract: the framework separates predicate, Statement, Envelope,
  and Bundle layers. The Statement v1 `_type` is
  `https://in-toto.io/Statement/v1`; authentication belongs to the envelope
  layer.
- SancusSight implication: an optional unsigned Statement v1 wrapper can bind a
  Feature 010 Evidence Packet digest to a versioned SancusSight custom
  predicate. It must be labeled unsigned and unverified, must not call itself
  an authenticated attestation, and must introduce no key, signature,
  transparency log, or external verifier.

## Policy Preview Boundary

The roadmap authorizes research only. Feature 011 may document a future
read-only policy-input projection, example decisions, missing-data behavior,
and enforcement hazards. It does not add a policy engine, policy language,
remote evaluator, enforcement result, or upstream mutation.

