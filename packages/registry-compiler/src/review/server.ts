import { readFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'

import { assertNoProhibitedKeys } from '../contracts.ts'
import {
  ReviewSessionError,
  type ReviewSession,
} from './session.ts'

const MAX_BODY_BYTES = 64 * 1024
const UI_PATH = fileURLToPath(new URL('../../ui/review.html', import.meta.url))

export interface ReviewServerOptions {
  session: ReviewSession
  port?: number
  uiHtml?: string
  onConfirm?: (decisions: ReviewSession['decisions']) => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

export interface StartedReviewServer {
  server: Server
  token: string
  origin: string
  url: string
  close: () => Promise<void>
}

function send(response: ServerResponse, status: number, body: string, contentType = 'text/plain; charset=utf-8'): void {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': Buffer.byteLength(body),
  })
  response.end(body)
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, JSON.stringify(body), 'application/json; charset=utf-8')
}

function tokenFrom(requestUrl: URL): string {
  return requestUrl.searchParams.get('token') ?? ''
}

function requireSameOrigin(request: IncomingMessage, expectedOrigin: string): void {
  if (request.headers.origin !== expectedOrigin) {
    throw new ReviewSessionError('Origin is not allowed', 401)
  }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new ReviewSessionError('Request body is too large', 413)
    chunks.push(buffer)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new ReviewSessionError('Request body is not valid JSON', 400)
  }
}

function reviewHtml(custom?: string): string {
  if (custom) return custom
  try {
    return readFileSync(UI_PATH, 'utf8')
  } catch {
    return '<!doctype html><title>Review unavailable</title><p>The review asset is unavailable.</p>'
  }
}

export async function startReviewServer(options: ReviewServerOptions): Promise<StartedReviewServer> {
  const { session } = options
  const html = reviewHtml(options.uiHtml)
  let origin = ''
  const server = createServer((request, response) => {
    void (async () => {
      try {
        const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`)
        const token = tokenFrom(requestUrl)
        if (request.method === 'GET' && requestUrl.pathname === '/review') {
          session.read(token)
          send(response, 200, html, 'text/html; charset=utf-8')
          return
        }
        if (request.method === 'GET' && requestUrl.pathname === '/api/session') {
          const bundle = session.read(token)
          assertNoProhibitedKeys(bundle)
          sendJson(response, 200, bundle)
          return
        }
        if (request.method === 'POST' && requestUrl.pathname === '/api/confirm') {
          requireSameOrigin(request, origin)
          const body = await readJson(request)
          if (!body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).every(key => key === 'decisions')) {
            throw new ReviewSessionError('Confirm accepts decisions only', 400)
          }
          const decisions = session.confirm(token, (body as Record<string, unknown>).decisions)
          await options.onConfirm?.(decisions)
          sendJson(response, 200, { status: 'confirmed', decisions })
          return
        }
        if (request.method === 'POST' && requestUrl.pathname === '/api/cancel') {
          requireSameOrigin(request, origin)
          await readJson(request)
          session.cancel(token)
          await options.onCancel?.()
          sendJson(response, 200, { status: 'cancelled' })
          return
        }
        send(response, 404, 'Not found')
      } catch (error) {
        if (error instanceof ReviewSessionError) {
          sendJson(response, error.statusCode, { error: error.message })
          return
        }
        sendJson(response, 500, { error: 'Review server error' })
      }
    })()
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(options.port ?? 0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    await new Promise<void>(resolve => server.close(() => resolve()))
    throw new Error('Review server did not expose a loopback address')
  }
  origin = `http://127.0.0.1:${address.port}`
  return {
    server,
    token: session.token,
    origin,
    url: `${origin}/review?token=${encodeURIComponent(session.token)}`,
    close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
  }
}
