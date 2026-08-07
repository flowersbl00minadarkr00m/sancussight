import { appendFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import {
  assertDescriptorEnvironment,
  bindReleaseRunDescriptor,
  type BoundReleaseRunDescriptor,
  type ReleaseRunDescriptorBinder,
} from '../../src/lib/release-run-descriptor.ts'
import { createPiTelemetryContext } from './pi-context.ts'
import { createRuntimeTelemetryEvent, type MetadataEventInput } from './runtime-telemetry-projection.ts'

interface ExtensionAPI {
  on(name: string, handler: (...arguments_: any[]) => unknown): void
}

export interface PiTelemetryOptions {
  descriptorPath?: string
  localAppDataRoot?: string
  environment?: NodeJS.ProcessEnv
  outputPath?: string
  binder?: ReleaseRunDescriptorBinder
  exposeIdentity?: (identity: Readonly<BoundReleaseRunDescriptor>) => void
}

export function registerSancusSightTelemetry(pi: ExtensionAPI, options: PiTelemetryOptions = {}): Readonly<BoundReleaseRunDescriptor> {
  const environment = options.environment ?? process.env
  const localAppDataRoot = options.localAppDataRoot ?? environment.LOCALAPPDATA
  const bindDescriptor = () => options.binder
    ? options.binder.bind(options.descriptorPath ?? environment.SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR, localAppDataRoot)
    : bindReleaseRunDescriptor(options.descriptorPath ?? environment.SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR, localAppDataRoot)
  const identity = bindDescriptor()
  assertDescriptorEnvironment(identity, environment)

  const environmentContext = createPiTelemetryContext()
  const context = {
    ...environmentContext,
    releaseRunId: identity.releaseRunId,
    targetId: identity.runtimeTargetId,
    providerVersion: environment.SANCUSSIGHT_PI_VERSION || 'unknown',
    qualification: 'operational' as const,
    transport: 'jsonl' as const,
  }
  const outputPath = options.outputPath ?? join(
    localAppDataRoot || process.cwd(),
    'SancusSight',
    'operations',
    'exports',
    'runtime-telemetry',
    'runtime-telemetry.jsonl',
  )
  const outputDirectory = dirname(outputPath)
  let sessionId = 'pi-ephemeral-session'

  ;(options.exposeIdentity ?? exposeStartupIdentity)(identity)

  const emit = async (input: Omit<MetadataEventInput, 'runtime' | 'provider' | 'sessionId'> & { sessionId?: string }) => {
    const currentIdentity = bindDescriptor()
    assertDescriptorEnvironment(currentIdentity, environment)
    const event = createRuntimeTelemetryEvent({ ...input, eventId: input.eventId ?? randomUUID(), sessionId: input.sessionId ?? sessionId, runtime: 'pi', provider: 'pi-extension' }, context)
    await mkdir(outputDirectory, { recursive: true })
    await appendFile(outputPath, `${JSON.stringify(event)}\n`, 'utf8')
  }

  pi.on('session_start', async (event, ctx) => {
    sessionId = ctx.sessionManager.getSessionId() || 'pi-ephemeral-session'
    await emit({ eventType: `session.${event.reason}`, outcome: 'observed' })
  })
  pi.on('session_shutdown', async event => { await emit({ eventType: `session.${event.reason}`, outcome: 'observed' }) })
  pi.on('agent_start', async () => { await emit({ eventType: 'agent.started', outcome: 'observed' }) })
  pi.on('agent_end', async () => { await emit({ eventType: 'agent.ended', outcome: 'succeeded' }) })
  pi.on('agent_settled', async () => { await emit({ eventType: 'agent.settled', outcome: 'succeeded' }) })
  pi.on('turn_start', async event => { await emit({ eventType: 'turn.started', eventId: `turn-${sessionId}-${event.turnIndex}-start`, outcome: 'observed' }) })
  pi.on('turn_end', async event => { await emit({ eventType: 'turn.ended', eventId: `turn-${sessionId}-${event.turnIndex}-end`, outcome: 'succeeded' }) })
  pi.on('tool_call', async event => { await emit({ eventType: 'tool.called', eventId: event.toolCallId, toolName: event.toolName, approvalState: 'unknown', outcome: 'observed' }) })
  pi.on('tool_result', async event => { await emit({ eventType: 'tool.completed', eventId: `${event.toolCallId}-result`, toolName: event.toolName, outcome: event.isError ? 'failed' : 'succeeded' }) })
  return identity
}

export default function sancusSightTelemetry(pi: ExtensionAPI): Readonly<BoundReleaseRunDescriptor> | undefined {
  // Only enable telemetry when pi is running inside a SancusSight release run.
  // Outside one (e.g. normal interactive use) there is no release-run descriptor,
  // so registering would throw RELEASE_DESCRIPTOR_PATH_REQUIRED and fail startup.
  if (!process.env.SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR?.trim()) {
    return undefined
  }
  return registerSancusSightTelemetry(pi)
}

function exposeStartupIdentity(identity: Readonly<BoundReleaseRunDescriptor>): void {
  process.stdout.write(`${JSON.stringify({
    type: 'sancussight-release-run-identity',
    schemaVersion: identity.schemaVersion,
    releaseRunId: identity.releaseRunId,
    startedAt: identity.startedAt,
    runtimeTargetId: identity.runtimeTargetId,
    purpose: identity.purpose,
  })}\n`)
}
