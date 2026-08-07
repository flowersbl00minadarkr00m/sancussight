import type { ConnectionNotice } from '../types'

interface Props {
  notice?: ConnectionNotice
  className?: string
}

export function ConnectionNoticeBanner({ notice, className = '' }: Props) {
  if (!notice) return null
  return (
    <div
      className={`connection-notice connection-notice-${notice.tone} ${className}`}
      role={notice.tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {notice.message}
    </div>
  )
}
