import { appendFile, mkdir } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  assertDescriptorEnvironment,
  bindReleaseRunDescriptor,
  type BoundReleaseRunDescriptor,
  type ReleaseRunDescriptorBinder,
} from '../../src/lib/release-run-descriptor.ts'
import { projectOtlpLogs } from './runtime-telemetry-projection.ts'

const MAX_BODY_BYTES = 1024 * 1024
const PORT = 43120

export interface OtlpBridgeOptions {
  descriptorPath?: string
  localAppDataRoot?: string
  environment?: NodeJS.ProcessEnv
  outputPath?: string
  port?: number
  binder?: ReleaseRunDescriptorBinder
  exposeIdentity?: (identity: Readonly<BoundReleaseRunDescriptor>) => void
}

export interface StartedOtlpBridge {
  server: Server
  identity: Readonly<BoundReleaseRunDescriptor>
  outputPath: string
}

export function startOtlpBridge(options: OtlpBridgeOptions = {}): StartedOtlpBridge {
  const environment = options.environment ?? process.env
  const localAppDataRoot = options.localAppDataRoot ?? environment.LOCALAPPDATA
  const bindDescriptor = () => options.binder
    ? options.binder.bind(options.descriptorPath ?? environment.SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR, localAppDataRoot)
    : bindReleaseRunDescriptor(options.descriptorPath ?? environment.SANCUSSIGHT_RELEASE_RUN_DESCRIPTOR, localAppDataRoot)
  const identity = bindDescriptor()
  assertDescriptorEnvironment(identity, environment)

  const exposeIdentity = options.exposeIdentity ?? exposeStartupIdentity
  exposeIdentity(identity)

  const outputPath = options.outputPath ?? join(
    localAppDataRoot || process.cwd(),
    'SancusSight',
    'operations',
    'exports',
    'runtime-telemetry',
    'runtime-telemetry.jsonl',
  )
  const outputDirectory = dirname(outputPath)
  const server = createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/logs') { response.writeHead(404).end(); return }
    try {
      const currentIdentity = bindDescriptor()
      assertDescriptorEnvironment(currentIdentity, environment)
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of request) {
        const buffer = Buffer.from(chunk)
        size += buffer.length
        if (size > MAX_BODY_BYTES) throw new Error('OTLP payload exceeds the fixed limit.')
        chunks.push(buffer)
      }
      const events = projectOtlpLogs(JSON.parse(Buffer.concat(chunks).toString('utf8')), {
        releaseRunId: identity.releaseRunId,
        targetId: identity.runtimeTargetId,
        providerVersion: 'unknown',
        qualification: 'operational',
      })
      await mkdir(outputDirectory, { recursive: true })
      if (events.length) await appendFile(outputPath, `${events.map(event => JSON.stringify(event)).join('\n')}\n`, 'utf8')
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ partialSuccess: {} }))
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Runtime telemetry projection failed.')
      response.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'runtime-telemetry-rejected' }))
    }
  })
  if (options.port === undefined) server.listen(PORT, '127.0.0.1')
  else server.listen(options.port, '127.0.0.1')
  return { server, identity, outputPath }
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

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    startOtlpBridge()
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : 'RELEASE_DESCRIPTOR_STARTUP_FAILED'}\n`)
    process.exitCode = 1
  }
}
