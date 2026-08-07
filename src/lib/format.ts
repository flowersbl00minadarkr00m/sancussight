// Shared presentation formatting. These helpers never invent a value: an
// absent input returns an explicit absence label, never a render-time default.

export const ABSENT_FIELD = '—'

/**
 * Formats a recorded timestamp as `2026-07-11 · 09:14 UTC`.
 *
 * UTC is used deliberately so the same recorded fact reads identically
 * wherever it is displayed. An unparsable value is returned verbatim rather
 * than replaced with a fabricated date.
 */
export function formatRecordedTimestamp(value: string | undefined, absent = ABSENT_FIELD): string {
  if (!value) return absent
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) return value
  const iso = parsed.toISOString()
  return `${iso.slice(0, 10)} · ${iso.slice(11, 16)} UTC`
}
