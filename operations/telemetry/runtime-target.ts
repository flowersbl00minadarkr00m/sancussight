export const DEFAULT_RUNTIME_TARGET_ID = 'local-ai-runtime'

export function resolveRuntimeTargetId(value = process.env.SANCUSSIGHT_RUNTIME_TARGET_ID): string {
  return value || DEFAULT_RUNTIME_TARGET_ID
}
