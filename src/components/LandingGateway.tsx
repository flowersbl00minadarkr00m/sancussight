import type { ConnectionNotice } from '../types'
import { BrandLockup } from './BrandLockup'
import { ConnectionNoticeBanner } from './ConnectionNotice'

interface Props {
  onConnect: () => void
  persistentAccessSupported: boolean
  notice?: ConnectionNotice
}

export function LandingGateway({ onConnect, persistentAccessSupported, notice }: Props) {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-content">
          <p className="landing-kicker">Read-only AI evidence workspace</p>
          <h1 id="landing-title" className="landing-title">
            <BrandLockup />
          </h1>
          <p className="landing-promise">
            See what your AI environment depends on, what remains portable, and what needs attention—without running upstream tools here.
          </p>

          <div className="landing-actions" aria-label="Choose how to enter the workspace">
            <article className="landing-action landing-action-sample">
              <strong>Explore sample</strong>
              <p>Synthetic</p>
              <span>Demonstration data only, clearly labeled throughout.</span>
              <a className="btn btn-primary btn-large" href="#demo">Explore sample</a>
            </article>

            <article className="landing-action landing-action-existing">
              <strong>Open existing registry</strong>
              <p>User-selected file or snapshot</p>
              <span>
                {persistentAccessSupported
                  ? 'Choose one registry file. SancusSight validates it before replacing the current workspace.'
                  : 'Choose a registry snapshot. Later source changes require another import.'}
              </span>
              <button type="button" className="btn btn-light btn-large" onClick={onConnect}>
                Open existing registry
              </button>
            </article>

            <details className="landing-action landing-action-compiler">
              <summary>
                <strong>Build with local compiler</strong>
                <p>Compiler-created registry</p>
                <span>Run the checked-in compiler locally, review its proposed output, then confirm it yourself.</span>
              </summary>
              <div className="landing-compiler-guidance">
                <code>npx sancussight-registry compile --root "C:\path\to\approved\metadata-root"</code>
                <p>
                  The compiler runs on your machine and opens a local review step. Review and confirm the proposed registry there, then use <strong>Open existing registry</strong> above to open the resulting registry through the existing file or snapshot path.
                </p>
                <p>This hosted page never executes the compiler or uploads your metadata.</p>
              </div>
            </details>
          </div>

          <ConnectionNoticeBanner notice={notice} className="landing-notice" />
        </div>
      </section>

      <section className="trust-strip" aria-label="Trust properties">
        <div><strong>Local-only</strong><span>Registry data stays in this browser.</span></div>
        <div><strong>Deterministic</strong><span>Every status traces to a recorded condition.</span></div>
        <div><strong>Exportable</strong><span>Your evidence remains inspectable and portable.</span></div>
      </section>
    </main>
  )
}
