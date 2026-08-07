import { useEffect, useState } from 'react'
import { Card, Eyebrow } from './Shared'

interface Props {
  markdown: string
  onClose: () => void
}

export function ShareCard({ markdown, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="share-backdrop" onClick={onClose}>
      <div
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Share posture card"
        onClick={event => event.stopPropagation()}
      >
        <Card>
          <div className="share-dialog-heading">
            <Eyebrow>Share card - aggregate posture only</Eyebrow>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigator.clipboard.writeText(markdown).then(() => setCopied(true))}
              >
                {copied ? 'Copied' : 'Copy markdown'}
              </button>
              <button type="button" className="btn" onClick={onClose}>Close</button>
            </div>
          </div>
          <pre className="share-markdown">{markdown}</pre>
          <p className="share-note">Names, paths, and owners are excluded so a public trust summary does not become an inventory of your stack.</p>
        </Card>
      </div>
    </div>
  )
}
