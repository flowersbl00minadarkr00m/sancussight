import { useState } from 'react'
import type { CanonicalRef, GovernanceBinding, HumanDecisionPayload } from '../../domain/governance/model'
import type { GovernanceRow } from './types'
import { RecommendationDetail } from './RecommendationDetail'

export function GovernanceDetail({ row, onClose, onOpenLineage, onRecordDecision, onConfirmBinding, bindingTarget }: { row: GovernanceRow; onClose: () => void; onOpenLineage: (id: string) => void; onRecordDecision?: (input: HumanDecisionPayload) => Promise<void>; onConfirmBinding?: (input: Omit<GovernanceBinding, 'id'>) => Promise<void>; bindingTarget?: CanonicalRef }) {
  const [compose, setCompose] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const actionId = 'actionId' in row && row.actionId ? row.actionId : undefined
  const policy = 'policyId' in row ? row.policyId : undefined
  const eventId = row.eventIds[0]
  return <aside className="governance-detail" aria-label="Governance detail" aria-live="polite">
    <div className="governance-detail-heading"><div><span className="eyebrow">INSPECTED CLAIM</span><h2>{row.title}</h2></div><button type="button" className="text-command" onClick={onClose}>CLOSE</button></div>
    <p className="governance-detail-id">{row.kind} · {row.id}</p>
    <dl className="governance-detail-grid">
      <div><dt>Assertion</dt><dd>{row.truth.assertion}</dd></div><div><dt>Authority</dt><dd>{row.truth.authority}</dd></div>
      <div><dt>Qualification</dt><dd>{row.qualification}</dd></div><div><dt>Verification</dt><dd>{row.verification}</dd></div>
      <div><dt>Source</dt><dd>{row.sourceIds.join(', ')}</dd></div><div><dt>Observed</dt><dd>{new Date(row.observedAt).toLocaleString()}</dd></div>
      <div><dt>Parser</dt><dd>{row.provenance[0]?.parserId ?? 'unavailable'} / {row.provenance[0]?.parserVersion ?? 'unavailable'}</dd></div><div><dt>Contract</dt><dd>{row.provenance[0]?.contractVersion ?? 'unavailable'}</dd></div>
    </dl>
    <section className="governance-detail-section"><h3>Gaps and lineage</h3><p>{row.gapCodes.length ? row.gapCodes.join(' · ') : 'No projected gap for this row.'}</p><button type="button" className="btn btn-secondary" onClick={() => onOpenLineage(actionId ?? row.id)}>INSPECT LINEAGE</button></section>
    {'enforcementProven' in row && <RecommendationDetail row={row} />}
    {actionId && onRecordDecision && <section className="governance-detail-section"><h3>Accountable decision</h3><p>Record a bounded, expiring human decision. This changes only SancusSight governance state.</p><button type="button" className="btn btn-secondary" onClick={() => setCompose(open => !open)}>{compose ? 'CLOSE DECISION FORM' : 'RECORD DECISION'}</button>{compose && <DecisionForm actionId={actionId} policyId={policy ?? 'policy-unresolved'} evidenceRef={eventId} onSubmit={async input => { setSaving(true); setMessage(''); try { await onRecordDecision(input); setMessage('Decision appended to local governance history.'); setCompose(false) } catch { setMessage('Decision was not recorded. Verify the local collector session and bounded references.') } finally { setSaving(false) } }} saving={saving} />}</section>}
    {'asset' in row && onConfirmBinding && bindingTarget && <BindingComposer from={row.asset} to={bindingTarget} evidenceRef={eventId} onSubmit={async input => { setSaving(true); setMessage(''); try { await onConfirmBinding(input); setMessage('Binding appended to local governance history.') } catch { setMessage('Binding was not recorded. Verify both entity references and the local collector session.') } finally { setSaving(false) } }} saving={saving} />}
    {message && <p className="governance-form-message" role="status">{message}</p>}
  </aside>
}

function BindingComposer({ from, to, evidenceRef, onSubmit, saving }: { from: CanonicalRef; to: CanonicalRef; evidenceRef: string; onSubmit: (input: Omit<GovernanceBinding, 'id'>) => Promise<void>; saving: boolean }) {
  const [scopeHash, setScopeHash] = useState('')
  const [confirmedBy, setConfirmedBy] = useState('operator')
  return <section className="governance-detail-section"><h3>Confirmed binding</h3><p>Confirm only the two visible entity references. This changes SancusSight lineage state, not either producer.</p><form className="governance-decision-form" onSubmit={event => { event.preventDefault(); void onSubmit({ from, to, scopeHash, confirmedAt: new Date().toISOString(), confirmedBy, evidenceRefs: [evidenceRef] }) }}><label>Scope hash<input required pattern="[a-f0-9]{64}" value={scopeHash} onChange={event => setScopeHash(event.target.value)} placeholder="64 lowercase hex characters" /></label><label>Confirmed by<input required maxLength={160} value={confirmedBy} onChange={event => setConfirmedBy(event.target.value)} /></label><button type="submit" className="btn btn-secondary" disabled={saving}>{saving ? 'CONFIRMING…' : 'CONFIRM BINDING'}</button></form></section>
}

function DecisionForm({ actionId, policyId, evidenceRef, onSubmit, saving }: { actionId: string; policyId: string; evidenceRef: string; onSubmit: (input: HumanDecisionPayload) => Promise<void>; saving: boolean }) {
  const [decision, setDecision] = useState<HumanDecisionPayload['decision']>('approve')
  const [scopeHash, setScopeHash] = useState('')
  const [rationale, setRationale] = useState('')
  const [decidedBy, setDecidedBy] = useState('operator')
  const [expiresAt, setExpiresAt] = useState('')
  return <form className="governance-decision-form" onSubmit={event => { event.preventDefault(); void onSubmit({ decision, actionId, policyId, policyVersion: '1', scopeHash, rationale, decidedBy, effectiveAt: new Date().toISOString(), ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}), evidenceRefs: [evidenceRef] }) }}>
    <label>Decision<select value={decision} onChange={event => setDecision(event.target.value as HumanDecisionPayload['decision'])}><option value="approve">Approve</option><option value="reject">Reject</option><option value="override">Override</option><option value="exception">Exception</option><option value="revoke">Revoke</option></select></label>
    <label>Scope hash<input required pattern="[a-f0-9]{64}" value={scopeHash} onChange={event => setScopeHash(event.target.value)} placeholder="64 lowercase hex characters" /></label>
    <label>Rationale<textarea required maxLength={320} value={rationale} onChange={event => setRationale(event.target.value)} /></label>
    <label>Decision maker<input required maxLength={160} value={decidedBy} onChange={event => setDecidedBy(event.target.value)} /></label>
    <label>Expiry (optional)<input type="datetime-local" value={expiresAt} onChange={event => setExpiresAt(event.target.value)} /></label>
    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'RECORDING…' : 'APPEND DECISION'}</button>
  </form>
}
