import { useEffect, useMemo, useState } from 'react'
import type { Asset } from '../types'
import {
  compareCurrentAssetVersions,
} from '../lib/asset-versions'
import {
  browserSha256,
  buildAssetVersionEvidencePacket,
} from '../lib/evidence-packet'
import { formatRecordedTimestamp } from '../lib/format'
import { EvidencePacketExport } from './EvidencePacketExport'

const ALIAS_SUGGESTIONS = ['preferred', 'fallback', 'testing', 'deprecated']

interface Props {
  asset: Asset
  onRecordVersion: () => Promise<'recorded' | 'deduplicated'>
  onAssignAlias: (name: string, versionId: string) => void
  onRemoveAlias: (name: string) => void
}

export function AssetVersionHistory({
  asset,
  onRecordVersion,
  onAssignAlias,
  onRemoveAlias,
}: Props) {
  const versions = asset.versions ?? []
  const currentVersionIndex = versions.findIndex(version => version.id === asset.currentVersionId)
  const currentVersion = currentVersionIndex >= 0 ? versions[currentVersionIndex] : undefined
  const previousVersion = currentVersionIndex > 0 ? versions[currentVersionIndex - 1] : undefined
  const [recordPending, setRecordPending] = useState(false)
  const [recordStatus, setRecordStatus] = useState('')
  const [aliasName, setAliasName] = useState('')
  const [aliasVersionId, setAliasVersionId] = useState(asset.currentVersionId ?? '')
  const [aliasStatus, setAliasStatus] = useState('')

  const comparison = useMemo(
    () => compareCurrentAssetVersions(asset),
    [asset],
  )

  useEffect(() => {
    setRecordStatus('')
    setAliasStatus('')
    setAliasName('')
    setAliasVersionId(asset.currentVersionId ?? '')
  }, [asset.id])

  useEffect(() => {
    if (asset.currentVersionId) setAliasVersionId(asset.currentVersionId)
  }, [asset.currentVersionId])

  async function recordCurrentVersion() {
    setRecordPending(true)
    setRecordStatus('Recording the current bounded portability state.')
    try {
      const result = await onRecordVersion()
      setRecordStatus(result === 'recorded'
        ? 'Current version recorded and selected.'
        : 'Already recorded. The equivalent current state did not change version history.')
    } catch (error) {
      setRecordStatus(`Version recording failed. The registry was not changed. ${errorMessage(error)}`)
    } finally {
      setRecordPending(false)
    }
  }

  function assignAlias() {
    try {
      onAssignAlias(aliasName, aliasVersionId)
      setAliasStatus(`Alias ${aliasName.trim()} now labels the selected recorded version.`)
      setAliasName('')
    } catch (error) {
      setAliasStatus(`Alias change failed. ${errorMessage(error)}`)
    }
  }

  function removeAlias(name: string) {
    try {
      onRemoveAlias(name)
      setAliasStatus(`Alias ${name} removed. Recorded version facts were not changed.`)
    } catch (error) {
      setAliasStatus(`Alias removal failed. ${errorMessage(error)}`)
    }
  }

  return (
    <div className="asset-version-history">
      <div className="asset-version-record">
        <button type="button" className="btn" disabled={recordPending} onClick={recordCurrentVersion}>
          {recordPending ? 'Recording version...' : 'Record current version'}
        </button>
        <p className="asset-version-status" role="status" aria-live="polite">{recordStatus}</p>
      </div>

      {versions.length === 0 ? (
        <p className="asset-version-empty"><strong>No recorded versions.</strong> Recording is explicit and creates no earlier history.</p>
      ) : (
        <>
          <ol className="asset-version-list" aria-label="Recorded asset versions, newest first">
            {[...versions].reverse().map(version => {
              const aliases = (asset.versionAliases ?? []).filter(alias => alias.versionId === version.id)
              const isCurrent = version.id === asset.currentVersionId
              return (
                <li key={version.id} aria-current={isCurrent ? 'true' : undefined}>
                  <div className="asset-version-row-heading">
                    <strong>
                      {version.qualification === 'portable-projection'
                        ? `${isCurrent ? 'Current ' : ''}portable projection`
                        : isCurrent ? 'Current recorded version' : 'Recorded version'}
                    </strong>
                    <time dateTime={version.recordedAt}>{formatTimestamp(version.recordedAt)}</time>
                  </div>
                  <code>{version.id}</code>
                  {version.qualification === 'portable-projection' && (
                    <small>
                      Privacy-sanitized derivative of <code>{version.derivedFromVersionId}</code>;
                      not the original recorded facts.
                    </small>
                  )}
                  <div className="asset-version-aliases">
                    <span>Aliases (labels only):</span>
                    {aliases.length === 0 ? <em>None</em> : aliases.map(alias => (
                      <span className="asset-version-alias" key={alias.name}>
                        {alias.name}
                        <button type="button" onClick={() => removeAlias(alias.name)} aria-label={`Remove alias ${alias.name}`}>
                          Remove
                        </button>
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="asset-version-alias-controls">
            <p><strong>Version aliases are labels only.</strong> They are not evidence, environments, lifecycle stages, or approval truth.</p>
            <label>
              Alias label
              <input
                type="text"
                value={aliasName}
                maxLength={64}
                list="asset-version-alias-suggestions"
                placeholder="For example, preferred"
                onChange={event => setAliasName(event.target.value)}
              />
            </label>
            <datalist id="asset-version-alias-suggestions">
              {ALIAS_SUGGESTIONS.map(suggestion => <option key={suggestion} value={suggestion} />)}
            </datalist>
            <label>
              Recorded version
              <select value={aliasVersionId} onChange={event => setAliasVersionId(event.target.value)}>
                {[...versions].reverse().map(version => (
                  <option key={version.id} value={version.id}>
                    {version.id}{version.id === asset.currentVersionId ? ' — current' : ''}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn"
              disabled={!aliasName.trim() || !aliasVersionId}
              onClick={assignAlias}
            >
              Add or move alias
            </button>
            <p className="asset-version-status" role="status" aria-live="polite">{aliasStatus}</p>
          </div>

          <section className="asset-version-comparison" aria-labelledby="asset-version-comparison-heading">
            <h4 id="asset-version-comparison-heading">Current versus previous recorded version</h4>
            {comparison.state === 'no-previous-version' ? (
              <p><strong>No previous version recorded.</strong> Comparison becomes available after a distinct second recording.</p>
            ) : comparison.state === 'unavailable-too-many-changes' ? (
              <p>
                <strong>Comparison unavailable.</strong>{' '}
                {comparison.totalMeaningfulItems} meaningful changes exceed the 100-item truthfulness limit.
                No partial comparison is shown.
              </p>
            ) : (
              <>
                {comparison.truncated && (
                  <p>
                    All {comparison.totalMeaningfulItems} meaningful changes are shown;
                    {' '}{comparison.omittedUnchangedCount} unchanged context items were omitted.
                  </p>
                )}
                <ul>
                  {comparison.items.map(item => (
                    <li key={item.key}>
                      <strong>{item.state}: {item.label}</strong>
                      <span>Previous: {item.previous}</span>
                      <span>Current: {item.current}</span>
                      <small>Basis: {basisLabel(item.basis)}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {currentVersion && (
            <EvidencePacketExport
              note="Downloads a validated local packet for the current recorded version. It does not export the registry or raw evidence."
              buildPacket={() => buildAssetVersionEvidencePacket({
                assetId: asset.stableId ?? asset.id,
                assetKind: asset.kind,
                version: currentVersion,
                ...(previousVersion ? { previousVersion } : {}),
                exportedAt: new Date().toISOString(),
              }, browserSha256)}
            />
          )}
        </>
      )}
    </div>
  )
}

function basisLabel(basis: 'recorded-fact' | 'deterministic-check'): string {
  return basis === 'recorded-fact' ? 'recorded fact' : 'deterministic check'
}

function formatTimestamp(value: string): string {
  return formatRecordedTimestamp(value, value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'The requested version action is unavailable.'
}
