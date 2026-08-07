interface Props {
  className?: string
}

export function BrandLockup({ className = '' }: Props) {
  return (
    <span className={`brand-lockup ${className}`.trim()}>
      <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path d="M38 18H31C20.5 18 12 26.5 12 37v26c0 10.5 8.5 19 19 19h7" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="butt" />
        <path d="M62 18h7c10.5 0 19 8.5 19 19v26c0 10.5-8.5 19-19 19h-7" fill="none" stroke="var(--color-amber)" strokeWidth="12" strokeLinecap="butt" />
        <rect x="45" y="45" width="10" height="10" rx="2" fill="var(--color-amber)" />
      </svg>
      <span className="brand-wordmark"><span>Sancus</span>Sight</span>
    </span>
  )
}
