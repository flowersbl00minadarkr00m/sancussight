import { Eyebrow, Card } from './Shared'

const DEFINITIONS = [
  {
    concept: 'Skills',
    description: 'Runbooks, scripts, tool integrations that agents execute to perform work.',
    shared: 'Open format (markdown/yaml/json), verified on 2+ approved platforms, named fallbacks for any provider-specific dependencies.',
    nonShared: 'Proprietary format, locked to one provider, no fallback dependency documented.',
    check: 'Can a different agent harness load and execute this skill without modification?',
    kind: 'skill',
  },
  {
    concept: 'Memory Architecture',
    description: 'Context packs, retrieval configurations, embedding specifications, shared-brain schemas.',
    shared: 'Exportable format (JSON), 2+ platform coverage, embedding model independence documented, round-trip import tested.',
    nonShared: 'Vendor-specific vector store, proprietary chunk format, no export path documented.',
    check: 'Can memory be exported and re-indexed on a different platform without data loss?',
    kind: 'context',
  },
  {
    concept: 'Prompt Templates',
    description: 'System prompts, instruction sets, persona configurations, brand voice guides.',
    shared: 'Plain text/markdown, no provider-specific syntax escaping, behavior tested on 2+ platforms.',
    nonShared: 'Vendor-specific instruction format (custom GPT config, Claude project instructions), syntax that only works on one provider.',
    check: 'Does the same prompt produce equivalent behavior across platforms?',
    kind: 'prompt-template',
  },
  {
    concept: 'Intent Context Files',
    description: 'AGENTS.md, CLAUDE.md, rules files — instructions that tell agents how to operate across sessions.',
    shared: 'Version-controlled text files in the working directory, read by all agents, no harness-specific trigger syntax.',
    nonShared: 'Embedded in a specific platform\'s project/config system, uses provider-specific directives.',
    check: 'Can any agent read and follow this file without translation?',
    kind: 'intent-context',
  },
  {
    concept: 'Specification Files',
    description: 'Eval fixtures, test cases, quality rubrics, expected outputs for verification.',
    shared: 'JSON/YAML fixtures, 2+ platform verification, graded outputs with scoring rubrics, version-controlled.',
    nonShared: 'Platform-specific evaluation format, ungraded outputs, stored in vendor tool only.',
    check: 'Can the same test be run and scored on a different platform with equivalent results?',
    kind: 'evaluation',
  },
  {
    concept: 'Ontology Contracts',
    description: 'Versioned object, link, action, schema, evidence, and adapter records shared across products.',
    shared: 'Stable ID, open format, named producer and consumers, version, review evidence, and explicit portability status.',
    nonShared: 'Display name used as identity, undocumented consumers, proprietary schema, or no export evidence.',
    check: 'Can another product resolve the same stable identity and contract after a rename or storage change?',
    kind: 'ontology-*',
  },
  {
    concept: 'Action Boundaries',
    description: 'Governance records for what an action may read, propose, or write.',
    shared: 'Authority, confirmation, reversibility, required controls, and evidence needs are explicit.',
    nonShared: 'Implicit write authority, no rollback path, or permissions inferred from registry presence.',
    check: 'Can a reviewer tell what authority exists without executing the action?',
    kind: 'ontology-action',
  },
  {
    concept: 'Candidate Trust Tools',
    description: 'External tools assessed as evidence or control sources before adoption.',
    shared: 'Source, license, trust boundary, data flow, evidence output, constraints, maintenance, and integration level are recorded.',
    nonShared: 'A tool name or repository link is treated as assurance without evidence or operating constraints.',
    check: 'Can SancusSight explain what the tool proves, what it does not prove, and why it is accepted or deferred?',
    kind: 'candidate-tool',
  },
  {
    concept: 'Integration Levels',
    description: 'Reference only, manual import, local adapter, bundled dependency, or replacement candidate.',
    shared: 'The relationship and maintenance burden are explicit; bundle readiness never implies approval.',
    nonShared: 'Tools are silently embedded or coupled to fast-changing internals.',
    check: 'Could the external tool change or be removed without corrupting the governance record?',
    kind: 'integration-level',
  },
]

export function Definitions() {
  return (
    <Card>
      <Eyebrow>Shared vs. non-shared — what each concept means for portability</Eyebrow>
      <p className="mb-4 text-sm text-(--color-muted)">
        The registry evaluates whether assets are <em>actually</em> portable (verified coverage, open formats, named fallbacks). But portability also has a <em>design intent</em> dimension: was this asset built to be shared, or is it inherently local? This table defines the boundary for each concept.
      </p>
      <div className="space-y-4">
        {DEFINITIONS.map(d => (
          <section key={d.concept} className="border-t border-(--color-line) py-3 first:border-t-0">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="font-serif text-lg text-(--color-navy) m-0">{d.concept}</h3>
              <span className="font-mono text-[0.72rem] text-(--color-muted)">kind: {d.kind}</span>
            </div>
            <p className="text-[0.8rem] text-(--color-muted) mb-2">{d.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="rounded-sm border border-(--color-moss) bg-(--color-moss-soft) p-2">
                <span className="font-mono text-[0.72rem] text-(--color-moss)">SHARED</span>
                <p className="text-[0.78rem] text-(--color-ink) mt-0.5">{d.shared}</p>
              </div>
              <div className="rounded-sm border border-(--color-rust) bg-(--color-rust-soft) p-2">
                <span className="font-mono text-[0.72rem] text-(--color-rust)">NON-SHARED</span>
                <p className="text-[0.78rem] text-(--color-ink) mt-0.5">{d.nonShared}</p>
              </div>
            </div>
            <div className="font-mono text-[0.72rem] text-(--color-muted)">
              <span className="text-(--color-navy) font-semibold">Portability check:</span> {d.check}
            </div>
          </section>
        ))}
      </div>
    </Card>
  )
}
