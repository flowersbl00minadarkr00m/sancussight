import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

export interface LocalSession {
  id: string
  csrfToken: string
  createdAt: number
}

const SESSION_COOKIE = 'sancussight_local_session'
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

export class SessionStore {
  private readonly sessions = new Map<string, LocalSession>()

  issue(response: ServerResponse): LocalSession {
    this.prune()
    const session = { id: token(), csrfToken: token(), createdAt: Date.now() }
    this.sessions.set(session.id, session)
    if (this.sessions.size > 256) this.sessions.delete(this.sessions.keys().next().value!)
    response.setHeader('Set-Cookie', `${SESSION_COOKIE}=${session.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`)
    return session
  }

  read(request: IncomingMessage): LocalSession | undefined {
    const value = parseCookies(request.headers.cookie)[SESSION_COOKIE]
    return value ? this.sessions.get(value) : undefined
  }

  validateMutation(request: IncomingMessage, expectedOrigin: string): { ok: true } | { ok: false; code: string } {
    if (request.headers.origin !== expectedOrigin) return { ok: false, code: 'origin-rejected' }
    const session = this.read(request)
    if (!session) return { ok: false, code: 'session-required' }
    const csrf = request.headers['x-sancussight-csrf']
    if (typeof csrf !== 'string' || !equalToken(csrf, session.csrfToken)) return { ok: false, code: 'csrf-rejected' }
    return { ok: true }
  }

  private prune(): void {
    const cutoff = Date.now() - SESSION_MAX_AGE_SECONDS * 1000
    for (const [id, session] of this.sessions) if (session.createdAt < cutoff) this.sessions.delete(id)
  }
}

export function expectedOrigin(port: number): string {
  return `http://127.0.0.1:${port}`
}

export function isExpectedHost(host: string | undefined, port: number): boolean {
  return host === `127.0.0.1:${port}` || host === `localhost:${port}` || host === `[::1]:${port}`
}

export function applySecurityHeaders(response: ServerResponse): void {
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('Cache-Control', 'no-store')
}

function parseCookies(value: string | undefined): Record<string, string> {
  if (!value) return {}
  return Object.fromEntries(value.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((part) => part.length === 2))
}

function token(): string {
  return randomBytes(32).toString('base64url')
}

function equalToken(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}
