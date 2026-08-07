import { resolveRuntimeTargetId } from './runtime-target.ts'

export function createPiTelemetryContext(environment: NodeJS.ProcessEnv = process.env) {
  const releaseRunId = environment.SANCUSSIGHT_RELEASE_RUN_ID || 'unqualified-pi-session'
  const providerVersion = environment.SANCUSSIGHT_PI_VERSION || 'unknown'
  return {
    releaseRunId,
    targetId: resolveRuntimeTargetId(environment.SANCUSSIGHT_RUNTIME_TARGET_ID),
    providerVersion,
    qualification: environment.SANCUSSIGHT_RELEASE_RUN_ID ? 'operational' as const : 'manual' as const,
    transport: 'jsonl' as const,
  }
}
