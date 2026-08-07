import { randomBytes, timingSafeEqual } from 'node:crypto'

import {
  assertNoProhibitedKeys,
  type AuthorizedRootSummary,
  type AssetProposal,
  type Diagnostic,
  type ReviewDecision,
  type SkippedItem,
} from '../contracts.ts'
import type { ProposalCollision } from '../proposals/merge.ts'
import type { RefreshDiff } from '../contracts.ts'

export interface ReviewBundle {
  runId: string
  roots: AuthorizedRootSummary[]
  proposals: AssetProposal[]
  skipped: SkippedItem[]
  diagnostics: Diagnostic[]
  collisions?: ProposalCollision[]
  refreshDiff?: RefreshDiff
}

export interface ReviewSessionOptions {
  now?: () => number
  ttlMs?: number
}

export class ReviewSessionError extends Error {
  readonly statusCode: 400 | 401 | 404 | 409 | 413

  constructor(message: string, statusCode: 400 | 401 | 404 | 409 | 413) {
    super(message)
    this.name = 'ReviewSessionError'
    this.statusCode = statusCode
  }
}

export interface ReviewSession {
  readonly token: string
  readonly createdAt: number
  readonly expiresAt: number
  readonly bundle: ReviewBundle
  readonly decisions: ReviewDecision[]
  isOpen(): boolean
  read(token: string): ReviewBundle
  validateDecisions(token: string, decisions: unknown): ReviewDecision[]
  confirm(token: string, decisions: unknown): ReviewDecision[]
  cancel(token: string): void
}

function secureTokenMatches(expected: string, candidate: string): boolean {
  const expectedBuffer = Buffer.from(expected)
  const candidateBuffer = Buffer.from(candidate)
  return expectedBuffer.length === candidateBuffer.length && timingSafeEqual(expectedBuffer, candidateBuffer)
}

function boundedText(value: unknown, max = 160): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max ? value.trim() : undefined
}

function validateDecision(value: unknown, knownIds: Set<string>): ReviewDecision {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ReviewSessionError('Review decision is malformed', 400)
  }
  const record = value as Record<string, unknown>
  const proposalId = boundedText(record.proposalId, 200)
  const decision = record.decision
  if (!proposalId || !knownIds.has(proposalId)) throw new ReviewSessionError('Review decision references an unknown proposal', 400)
  if (decision !== 'select' && decision !== 'exclude' && decision !== 'archive' && decision !== 'keep') {
    throw new ReviewSessionError('Review decision has an unsupported action', 400)
  }
  let overrides: ReviewDecision['overrides']
  if (record.overrides !== undefined) {
    if (!record.overrides || typeof record.overrides !== 'object' || Array.isArray(record.overrides)) {
      throw new ReviewSessionError('Review overrides are malformed', 400)
    }
    const source = record.overrides as Record<string, unknown>
    const keys = Object.keys(source)
    if (keys.some(key => !['displayName', 'owner', 'sensitivity', 'lifecycle'].includes(key))) {
      throw new ReviewSessionError('Review overrides contain an unsupported field', 400)
    }
    overrides = {
      displayName: source.displayName === undefined ? undefined : boundedText(source.displayName),
      owner: source.owner === undefined ? undefined : boundedText(source.owner),
      sensitivity: source.sensitivity === 'internal' || source.sensitivity === 'public' ? source.sensitivity : undefined,
      lifecycle: source.lifecycle === 'active' || source.lifecycle === 'draft' || source.lifecycle === 'deprecated' || source.lifecycle === 'archived' || source.lifecycle === 'missing' ? source.lifecycle : undefined,
    }
    if ('displayName' in source && overrides.displayName === undefined) throw new ReviewSessionError('Review overrides contain an invalid value', 400)
    if ('owner' in source && overrides.owner === undefined) throw new ReviewSessionError('Review overrides contain an invalid value', 400)
    if ('sensitivity' in source && overrides.sensitivity === undefined) throw new ReviewSessionError('Review overrides contain an invalid value', 400)
    if ('lifecycle' in source && overrides.lifecycle === undefined) throw new ReviewSessionError('Review overrides contain an invalid value', 400)
  }
  const result: ReviewDecision = { proposalId, decision, overrides }
  assertNoProhibitedKeys(result)
  return result
}

class ReviewSessionImpl implements ReviewSession {
  readonly token: string
  readonly createdAt: number
  readonly expiresAt: number
  readonly bundle: ReviewBundle
  readonly decisions: ReviewDecision[] = []
  private state: 'open' | 'confirmed' | 'cancelled' = 'open'
  private readonly clock: () => number

  constructor(bundle: ReviewBundle, options: ReviewSessionOptions = {}) {
    assertNoProhibitedKeys(bundle)
    this.clock = options.now ?? Date.now
    this.createdAt = this.clock()
    this.expiresAt = this.createdAt + (options.ttlMs ?? 5 * 60 * 1000)
    this.token = randomBytes(24).toString('base64url')
    this.bundle = bundle
  }

  isOpen(): boolean {
    return this.state === 'open' && this.clock() < this.expiresAt
  }

  private requireOpen(token: string): void {
    if (!secureTokenMatches(this.token, token)) throw new ReviewSessionError('Invalid review token', 401)
    if (this.state !== 'open') throw new ReviewSessionError('Review session is already closed', 409)
    if (this.clock() >= this.expiresAt) throw new ReviewSessionError('Review session expired', 409)
  }

  read(token: string): ReviewBundle {
    this.requireOpen(token)
    return this.bundle
  }

  validateDecisions(token: string, decisions: unknown): ReviewDecision[] {
    this.requireOpen(token)
    if (!Array.isArray(decisions) || decisions.length > this.bundle.proposals.length) {
      throw new ReviewSessionError('Review decisions must be a bounded array', 413)
    }
    const knownIds = new Set(this.bundle.proposals.map(proposal => proposal.proposalId))
    const parsed = decisions.map(item => validateDecision(item, knownIds))
    const uniqueIds = new Set(parsed.map(item => item.proposalId))
    if (uniqueIds.size !== parsed.length) throw new ReviewSessionError('Review decisions contain a duplicate proposal', 400)
    return parsed
  }

  confirm(token: string, decisions: unknown): ReviewDecision[] {
    const parsed = this.validateDecisions(token, decisions)
    this.decisions.splice(0, this.decisions.length, ...parsed)
    this.state = 'confirmed'
    return [...this.decisions]
  }

  cancel(token: string): void {
    this.requireOpen(token)
    this.state = 'cancelled'
  }
}

export function createReviewSession(bundle: ReviewBundle, options: ReviewSessionOptions = {}): ReviewSession {
  return new ReviewSessionImpl(bundle, options)
}
