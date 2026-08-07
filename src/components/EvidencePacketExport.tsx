import { useState } from 'react'
import type { EvidencePacketV1 } from '../types'
import {
  browserSha256,
  downloadEvidencePacket,
} from '../lib/evidence-packet'

interface Props {
  buildPacket: () => Promise<EvidencePacketV1>
  label?: string
  note: string
}

export function EvidencePacketExport({
  buildPacket,
  label = 'Export Evidence Packet',
  note,
}: Props) {
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState('')
  const [failed, setFailed] = useState(false)

  async function exportPacket() {
    setPending(true)
    setFailed(false)
    setStatus('Preparing and validating the Evidence Packet.')
    try {
      const packet = await buildPacket()
      const result = await downloadEvidencePacket(packet, browserSha256)
      if (!result.ok) {
        setFailed(true)
        setStatus(`Export failed. No download was claimed. ${result.error}`)
        return
      }
      setStatus(`Evidence Packet downloaded as ${result.filename}.`)
    } catch (error) {
      setFailed(true)
      setStatus(`Export failed. No download was claimed. ${errorMessage(error)}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="evidence-packet-export">
      <button type="button" className="btn" disabled={pending} onClick={exportPacket}>
        {pending ? 'Export pending...' : label}
      </button>
      <p className="evidence-packet-note">{note}</p>
      <p
        className={failed ? 'evidence-packet-status evidence-packet-status-failed' : 'evidence-packet-status'}
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  )
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Evidence Packet export is unavailable.'
}
