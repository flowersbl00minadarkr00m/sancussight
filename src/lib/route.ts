export type AppRoute = 'landing' | 'demo' | 'workspace'

export function parseAppRoute(hash: string): AppRoute {
  const normalized = hash.trim().toLowerCase()
  if (normalized === '#demo') return 'demo'
  if (normalized === '#workspace') return 'workspace'
  return 'landing'
}

export const APP_HASH: Record<AppRoute, string> = {
  landing: '#landing',
  demo: '#demo',
  workspace: '#workspace',
}
