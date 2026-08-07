import type { AssetFindingGroup, Signal, SignalStatus } from '../types.ts'

const STATUS_PRIORITY: Record<SignalStatus, number> = {
  fail: 0,
  warn: 1,
  unknown: 2,
  accepted: 3,
  pass: 4,
}

export function groupFlaggedByAsset(signals: Signal[]): AssetFindingGroup[] {
  const groups = new Map<string, AssetFindingGroup>()

  for (const signal of signals) {
    if (signal.status === 'pass') continue
    const current = groups.get(signal.assetId)
    if (!current) {
      groups.set(signal.assetId, {
        assetId: signal.assetId,
        assetName: signal.assetName,
        worstStatus: signal.status,
        findingCount: 1,
        signals: [signal],
      })
      continue
    }

    current.signals.push(signal)
    current.findingCount += 1
    if (STATUS_PRIORITY[signal.status] < STATUS_PRIORITY[current.worstStatus]) {
      current.worstStatus = signal.status
    }
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      signals: [...group.signals].sort((a, b) =>
        STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || a.id.localeCompare(b.id)
      ),
    }))
    .sort((a, b) =>
      STATUS_PRIORITY[a.worstStatus] - STATUS_PRIORITY[b.worstStatus] || a.assetName.localeCompare(b.assetName)
    )
}
