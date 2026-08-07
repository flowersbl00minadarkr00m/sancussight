import { assertNoProhibitedKeys, type Diagnostic, type SkippedItem } from '../contracts.ts'
import type { RunSummary, SkippedReport } from './local.ts'

export function serializeSkippedReport(report: SkippedReport): string {
  assertNoProhibitedKeys(report)
  return JSON.stringify(report, null, 2)
}

export function serializeRunSummary(summary: RunSummary): string {
  assertNoProhibitedKeys(summary)
  return JSON.stringify(summary, null, 2)
}

export function boundedDiagnostic(code: string, message: string, severity: Diagnostic['severity'] = 'warning'): Diagnostic {
  const diagnostic = { code, message, severity }
  assertNoProhibitedKeys(diagnostic)
  return diagnostic
}

export function boundedSkipped(sourceType: SkippedItem['sourceType'], boundedIdentifier: string, category: SkippedItem['category'], guidance: string): SkippedItem {
  const item = { sourceType, boundedIdentifier: boundedIdentifier.slice(0, 80), category, guidance }
  assertNoProhibitedKeys(item)
  return item
}
