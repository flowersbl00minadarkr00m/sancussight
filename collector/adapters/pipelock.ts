import type { EvidenceVerification, PipelockVerificationV1 } from '../../src/types.ts'
import { ReadOnlyArtifactReader } from '../artifact-reader.ts'
import { contentHash, createEvidenceEnvelope, safeArtifactName } from '../envelope.ts'
import type { SourceCheckpoint } from '../evidence-store.ts'
import { checkpointFor, parseAdapterCursor, type AdapterCollection, type EvidenceAdapter } from './types.ts'
import { parseOperationalMetadata } from './operational.ts'

interface AuditPacketV0 {
  schema_version: string
  packet_id?: string
  generated_at: string
  run: { agent_identity: string; started_at: string; repository?: string; workflow?: string; run_id?: string; agent_exit_code?: number }
  policy: { policy_hashes: string[]; config_snapshot_sha256?: string }
  summary: { receipt_count: number; totals: Record<string, number>; layers?: Record<string, number> }
  verifier: { verdict: string; trusted: boolean; root_hash?: string }
  operational?: unknown
  sancussight?: { operational?: unknown }
}

export type PipelockVerifier = (artifactPath: string, packet: AuditPacketV0) => Promise<EvidenceVerification>
const ALLOWED_ATTRIBUTES = ['receiptCount', 'allowed', 'blocked', 'warned', 'policyHashCount', 'configSnapshotHash', 'repository', 'workflow', 'runId', 'agentExitCode', 'verifierId', 'verifierVersion', 'trustedSignerFingerprint', 'chainValid', 'signatureValid']

export class PipelockAdapter implements EvidenceAdapter {
  readonly id = 'pipelock' as const
  private readonly reader: ReadOnlyArtifactReader
  private readonly verifier: PipelockVerifier

  constructor(reader = new ReadOnlyArtifactReader(), verifier: PipelockVerifier = async () => 'unavailable') {
    this.reader = reader
    this.verifier = verifier
  }

  async validate(path: string): Promise<void> {
    const packets = await packetFiles(this.reader, path)
    if (!packets.length) throw new Error('Select a Pipelock Audit Packet location containing packet.json.')
    validatePacket(JSON.parse(await this.reader.readText(packets[0])))
  }

  async collect(path: string, checkpoint: SourceCheckpoint | undefined, importedAt: string): Promise<AdapterCollection> {
    const previous = parseAdapterCursor(checkpoint)
    const next = { version: 1 as const, artifacts: { ...previous.artifacts } }
    const accepted = []
    const rejected = []
    for (const packetPath of await packetFiles(this.reader, path)) {
      const metadata = await this.reader.inspect(packetPath)
      const prior = previous.artifacts[metadata.name]
      if (prior?.size === metadata.size && prior.mtimeMs === metadata.mtimeMs && prior.identity === metadata.identity) continue
      const text = await this.reader.readText(packetPath)
      const hash = contentHash(text)
      try {
        const packet = validatePacket(JSON.parse(text))
        const fixedVerification = await readFixedVerification(this.reader, path, metadata.name, hash)
        const verification = fixedVerification
          ? fixedVerification.verdict === 'valid' && fixedVerification.chainValid && fixedVerification.signatureValid ? 'verified' : 'failed'
          : packet.verifier.verdict === 'valid' ? await this.verifier(packetPath, packet) : 'failed'
        if (verification === 'failed') {
          rejected.push({ id: hash, source: this.id, artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt, errorCode: 'pipelock-verification-failed', guidance: 'Verify the Audit Packet with a trusted pinned Pipelock public key.', verification })
          continue
        }
        const suppliedOperational = parseOperationalMetadata(fixedVerification?.operational ?? packet.operational ?? packet.sancussight?.operational)
        const operational = suppliedOperational && suppliedOperational.qualification === 'operational' && (packet.summary.totals.allow ?? 0) > 0 && (packet.summary.totals.block ?? 0) > 0
          ? suppliedOperational
          : undefined
        accepted.push(createEvidenceEnvelope({
          source: this.id, evidenceKind: 'audit-packet', observedAt: packet.generated_at, importedAt,
          subject: { externalId: packet.run.agent_identity, type: 'workflow' },
          outcome: (packet.summary.totals.block ?? 0) > 0 || packet.run.agent_exit_code ? 'warn' : 'pass',
          summary: `Pipelock recorded ${packet.summary.receipt_count} mediated actions with ${packet.summary.totals.block ?? 0} blocked.`,
          provenance: { artifactName: metadata.name, artifactContentHash: hash, sourceRecordId: packet.packet_id ?? packet.verifier.root_hash, parserId: 'pipelock-audit-packet', parserVersion: '0.0.0', verification },
          attributes: { receiptCount: packet.summary.receipt_count, allowed: packet.summary.totals.allow ?? 0, blocked: packet.summary.totals.block ?? 0, warned: packet.summary.totals.warn ?? 0, policyHashCount: packet.policy.policy_hashes.length, configSnapshotHash: packet.policy.config_snapshot_sha256, repository: packet.run.repository, workflow: packet.run.workflow, runId: packet.run.run_id, agentExitCode: packet.run.agent_exit_code, ...(fixedVerification ? { verifierId: fixedVerification.verifierId, verifierVersion: fixedVerification.verifierVersion, trustedSignerFingerprint: fixedVerification.trustedSignerFingerprint, chainValid: fixedVerification.chainValid, signatureValid: fixedVerification.signatureValid } : {}) },
          allowedAttributeKeys: ALLOWED_ATTRIBUTES,
          ...(operational ? { operational } : {}),
        }))
        next.artifacts[metadata.name] = { size: metadata.size, mtimeMs: metadata.mtimeMs, identity: metadata.identity, contentHash: hash }
      } catch {
        rejected.push({ id: hash, source: this.id, artifactName: safeArtifactName(metadata.name), rejectedAt: importedAt, errorCode: 'unsupported-pipelock-packet', guidance: 'Provide a Pipelock Audit Packet with schema_version pipelock.audit_packet.v0.' })
      }
    }
    return { accepted, rejected, checkpoint: checkpointFor(this.id, next, importedAt), lag: 0 }
  }
}

async function readFixedVerification(reader: ReadOnlyArtifactReader, directory: string, packetName: string, packetHash: string): Promise<PipelockVerificationV1 | undefined> {
  const names = new Set(['verification.json', `${packetName}.verification.json`])
  const files = await reader.list(directory, (name) => names.has(name))
  if (!files.length) return undefined
  const value = JSON.parse(await reader.readText(files[0])) as unknown
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Pipelock verification artifact.')
  const verification = value as Partial<PipelockVerificationV1>
  if (verification.schemaVersion !== 1 || verification.packetContentHash !== packetHash || !['valid', 'invalid'].includes(String(verification.verdict)) || typeof verification.chainValid !== 'boolean' || typeof verification.signatureValid !== 'boolean' || !/^[a-f0-9]{64}$/.test(String(verification.trustedSignerFingerprint)) || typeof verification.verifierId !== 'string' || typeof verification.verifierVersion !== 'string' || !verification.observedAt || Number.isNaN(Date.parse(verification.observedAt)) || (verification.operational !== undefined && !parseOperationalMetadata(verification.operational))) throw new Error('Invalid Pipelock verification artifact.')
  return verification as PipelockVerificationV1
}

async function packetFiles(reader: ReadOnlyArtifactReader, path: string): Promise<string[]> {
  return reader.list(path, (name) => name === 'packet.json' || name.endsWith('.audit-packet.json'))
}

function validatePacket(value: unknown): AuditPacketV0 {
  if (!value || typeof value !== 'object') throw new Error('Invalid Pipelock packet.')
  const packet = value as AuditPacketV0
  if (packet.schema_version !== 'pipelock.audit_packet.v0' || !packet.generated_at || !packet.run?.agent_identity || !packet.summary?.totals || !packet.verifier || !Array.isArray(packet.policy?.policy_hashes)) throw new Error('Unsupported Pipelock packet.')
  return packet
}
