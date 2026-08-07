import type { SignalStatus } from '../types'
import { STATUS_STYLES } from '../types'

export function StatusBadge({ status }: { status: SignalStatus }) {
  const style = STATUS_STYLES[status]
  return (
    <span className={`status-badge status-badge-${status}`}>
      {style.label}
    </span>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}
