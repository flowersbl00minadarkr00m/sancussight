import type { Asset, Signal, SignalStatus } from '../types.ts'
import { CHECKS_CONFIG } from '../types.ts'

export const CATALOG_MISSING_VALUE = '__missing__' as const

export const CATALOG_FACET_KEYS = [
  'owner',
  'kind',
  'lifecycle',
  'portability',
  'provider',
  'evidenceFreshness',
] as const

export type CatalogFacetKey = typeof CATALOG_FACET_KEYS[number]
export type CatalogFacetValueSource = 'recorded' | 'deterministic' | 'missing'

export interface CatalogFacetValue {
  value: string
  label: string
  count: number
  source: CatalogFacetValueSource
}

export interface CatalogFacetIndex {
  key: CatalogFacetKey
  label: string
  availability: 'available' | 'unavailable'
  values: readonly CatalogFacetValue[]
  missingCount: number
}

export interface AssetCatalogEntry {
  asset: Asset
  searchText: string
  facetValues: Readonly<Record<CatalogFacetKey, readonly string[]>>
}

export interface AssetCatalogIndex {
  entries: readonly AssetCatalogEntry[]
  facets: Readonly<Record<CatalogFacetKey, CatalogFacetIndex>>
}

export interface CatalogCriteria {
  search?: string
  facets?: Partial<Record<CatalogFacetKey, readonly string[]>>
}

export interface AssetCatalogQueryResult {
  entries: readonly AssetCatalogEntry[]
  totalCount: number
  resultCount: number
  activeCriteriaCount: number
  activeCriteriaSummary: string
  resultSummary: string
  canClearCriteria: boolean
  selectedAssetOutsideResults: boolean
}

const FACET_LABELS: Record<CatalogFacetKey, string> = {
  owner: 'Owner',
  kind: 'Kind',
  lifecycle: 'Lifecycle',
  portability: 'Portability',
  provider: 'Provider',
  evidenceFreshness: 'Evidence freshness',
}

const STATUS_PRIORITY: Record<SignalStatus, number> = {
  fail: 0,
  warn: 1,
  unknown: 2,
  accepted: 3,
  pass: 4,
}

function normalizedText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function deterministicValues(values: readonly (string | undefined)[]): string[] {
  const unique = new Map<string, string>()
  for (const raw of values) {
    const value = raw?.trim()
    if (!value) continue
    const key = normalizedText(value)
    const existing = unique.get(key)
    if (!existing || value.localeCompare(existing, 'en') < 0) unique.set(key, value)
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b, 'en'))
}

function isRegistryState(value: unknown): value is NonNullable<Asset['registryState']> {
  return value === 'active' || value === 'archived' || value === 'missing'
}

function worstSignalStatus(signals: readonly Signal[]): SignalStatus | undefined {
  let worst: SignalStatus | undefined
  for (const signal of signals) {
    if (!worst || STATUS_PRIORITY[signal.status] < STATUS_PRIORITY[worst]) worst = signal.status
  }
  return worst
}

function validTimestamp(value: string | undefined): number | undefined {
  if (!value) return undefined
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : undefined
}

function evidenceFreshness(
  asset: Asset,
  signals: readonly Signal[],
  today: string,
): 'current' | 'stale' | undefined {
  const timestamps = [
    ...asset.evidence.map(point => validTimestamp(point.date)),
    ...asset.coverage.map(entry => validTimestamp(entry.lastVerified)),
    ...signals
      .filter(signal => signal.dimension === 'evidence')
      .map(signal => validTimestamp(signal.observedAt)),
  ].filter((timestamp): timestamp is number => timestamp !== undefined)

  if (timestamps.length === 0) return undefined
  const todayTimestamp = validTimestamp(today)
  if (todayTimestamp === undefined) return undefined
  const latestTimestamp = Math.max(...timestamps)
  const ageDays = Math.floor((todayTimestamp - latestTimestamp) / 86_400_000)
  return ageDays <= CHECKS_CONFIG.staleVerifyDays ? 'current' : 'stale'
}

function providerValues(asset: Asset): string[] {
  return deterministicValues([
    asset.primaryProvider,
    asset.fallbackProvider,
    ...asset.providerDependencies.flatMap(dependency => [dependency.provider, dependency.fallback]),
    ...asset.coverage.map(entry => entry.platform),
  ])
}

function valuesOrMissing(values: readonly string[]): string[] {
  return values.length > 0 ? [...values] : [CATALOG_MISSING_VALUE]
}

function entryFor(asset: Asset, signals: readonly Signal[], today: string): AssetCatalogEntry {
  const assetSignals = signals.filter(signal => signal.assetId === asset.id)
  const providers = providerValues(asset)
  const portability = worstSignalStatus(assetSignals)
  const freshness = evidenceFreshness(asset, assetSignals, today)
  const lifecycle = isRegistryState(asset.registryState) ? asset.registryState : undefined
  const owner = deterministicValues([asset.owner])
  const kind = deterministicValues([asset.kind])

  const facetValues: Record<CatalogFacetKey, readonly string[]> = {
    owner: valuesOrMissing(owner),
    kind: valuesOrMissing(kind),
    lifecycle: valuesOrMissing(lifecycle ? [lifecycle] : []),
    portability: valuesOrMissing(portability ? [portability] : []),
    provider: valuesOrMissing(providers),
    evidenceFreshness: valuesOrMissing(freshness ? [freshness] : []),
  }

  const searchText = deterministicValues([
    asset.name,
    asset.kind,
    asset.owner,
    asset.stableId,
    asset.format,
    asset.location,
    ...providers,
  ]).map(normalizedText).join('\n')

  return { asset, searchText, facetValues }
}

function facetValueSource(key: CatalogFacetKey, value: string): CatalogFacetValueSource {
  if (value === CATALOG_MISSING_VALUE) return 'missing'
  return key === 'portability' || key === 'evidenceFreshness' ? 'deterministic' : 'recorded'
}

function facetValueLabel(value: string): string {
  return value === CATALOG_MISSING_VALUE ? 'Missing / unavailable' : value
}

function buildFacet(key: CatalogFacetKey, entries: readonly AssetCatalogEntry[]): CatalogFacetIndex {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    for (const value of new Set(entry.facetValues[key])) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }

  const missingCount = counts.get(CATALOG_MISSING_VALUE) ?? 0
  const recordedValues = [...counts.keys()]
    .filter(value => value !== CATALOG_MISSING_VALUE)
    .sort((a, b) => a.localeCompare(b, 'en'))
  const orderedValues = missingCount > 0
    ? [CATALOG_MISSING_VALUE, ...recordedValues]
    : recordedValues

  return {
    key,
    label: FACET_LABELS[key],
    availability: recordedValues.length > 0 ? 'available' : 'unavailable',
    values: orderedValues.map(value => ({
      value,
      label: facetValueLabel(value),
      count: counts.get(value) ?? 0,
      source: facetValueSource(key, value),
    })),
    missingCount,
  }
}

export function buildAssetCatalogIndex(
  assets: readonly Asset[],
  signals: readonly Signal[],
  today: string,
): AssetCatalogIndex {
  const entries = assets.map(asset => entryFor(asset, signals, today))
  const facets = Object.fromEntries(
    CATALOG_FACET_KEYS.map(key => [key, buildFacet(key, entries)]),
  ) as Record<CatalogFacetKey, CatalogFacetIndex>
  return { entries, facets }
}

function normalizedCriteria(criteria: CatalogCriteria): {
  search: string
  facets: Partial<Record<CatalogFacetKey, readonly string[]>>
} {
  const facets: Partial<Record<CatalogFacetKey, readonly string[]>> = {}
  for (const key of CATALOG_FACET_KEYS) {
    const values = deterministicValues(criteria.facets?.[key] ?? [])
    if (values.length > 0) facets[key] = values
  }
  return {
    search: normalizedText(criteria.search ?? ''),
    facets,
  }
}

function matchesFacets(
  entry: AssetCatalogEntry,
  facets: Partial<Record<CatalogFacetKey, readonly string[]>>,
): boolean {
  return CATALOG_FACET_KEYS.every(key => {
    const selected = facets[key]
    if (!selected || selected.length === 0) return true
    return selected.some(value => entry.facetValues[key].includes(value))
  })
}

function describeActiveCriteria(
  search: string,
  facets: Partial<Record<CatalogFacetKey, readonly string[]>>,
): string {
  const descriptions: string[] = []
  if (search) descriptions.push(`Search: “${search}”`)
  for (const key of CATALOG_FACET_KEYS) {
    const values = facets[key]
    if (!values || values.length === 0) continue
    descriptions.push(`${FACET_LABELS[key]}: ${values.map(facetValueLabel).join(' or ')}`)
  }
  return descriptions.length > 0 ? descriptions.join(' · ') : 'No active criteria'
}

function describeResults(resultCount: number, totalCount: number, hasCriteria: boolean): string {
  if (totalCount === 0) return 'No assets in catalog'
  if (resultCount === 0 && hasCriteria) return `No assets match the active criteria (0 of ${totalCount})`
  if (!hasCriteria) return `${totalCount} ${totalCount === 1 ? 'asset' : 'assets'}`
  return `${resultCount} of ${totalCount} assets`
}

export function queryAssetCatalog(
  index: AssetCatalogIndex,
  criteria: CatalogCriteria,
  selectedAssetId?: string,
): AssetCatalogQueryResult {
  const normalized = normalizedCriteria(criteria)
  const entries = index.entries.filter(entry =>
    (!normalized.search || entry.searchText.includes(normalized.search))
    && matchesFacets(entry, normalized.facets)
  )
  const activeFacetValueCount = CATALOG_FACET_KEYS.reduce(
    (count, key) => count + (normalized.facets[key]?.length ?? 0),
    0,
  )
  const activeCriteriaCount = activeFacetValueCount + (normalized.search ? 1 : 0)
  const selectedExists = selectedAssetId
    ? index.entries.some(entry => entry.asset.id === selectedAssetId)
    : false
  const selectedAssetOutsideResults = selectedExists
    && !entries.some(entry => entry.asset.id === selectedAssetId)

  return {
    entries,
    totalCount: index.entries.length,
    resultCount: entries.length,
    activeCriteriaCount,
    activeCriteriaSummary: describeActiveCriteria(normalized.search, normalized.facets),
    resultSummary: describeResults(entries.length, index.entries.length, activeCriteriaCount > 0),
    canClearCriteria: activeCriteriaCount > 0,
    selectedAssetOutsideResults,
  }
}
