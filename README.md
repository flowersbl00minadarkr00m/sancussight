# SancusSight — trust made observable

**Sovereign infrastructure, sovereign data, sovereign models — none of it matters if you can't answer one question: *what breaks if your favorite model disappears tomorrow?*** SancusSight is a local-first registry of everything your AI stack depends on — context, skills, workflows, controls, evaluations — that continuously flags what is **not shared**, **not verified**, **not portable**, or **not owned**. It monitors the *conditions* of trust instead of declaring it.

Built as part of *Human Systems for an Agentic Age*. The claim it accompanies: sovereignty of trust is an operating capability you monitor, not a hosting decision you make once.

## What it does

- **Registry** — inventory your AI assets as metadata (name, kind, format, location, owner, sensitivity). *Content never enters the tool*: no prompts, no context bodies, no credentials — just the facts needed to test portability.
- **Coverage matrix** — assets × platforms, showing where each asset is shared, verified (with dates), stale, or absent.
- **Deterministic checks** — every asset is tested against explicit conditions: open format, verified on 2+ platforms, fresh human review, named owner, every provider-specific dependency has a fallback, workflows have drilled fallback providers and durable eval evidence. Same registry in, same signals out — no model calls, no randomness.
- **Exit test** — pick a workflow and a target platform: SancusSight walks the dependency tree and returns **survives / degrades / breaks**, item by item.
- **Remediation queue** — everything that demands a human, worst first, each with a required action and a named owner. Accepted risks are visible, owned, and expire.
- **Share card** — a privacy-safe aggregate (status counts + redacted exit verdicts) you can post publicly without publishing an inventory of your stack.

## The dashboard contract

No single opaque score. Every signal shows the exact **condition** tested, the **finding**, the **evidence** source, the **owner**, the check date, and the **required action**. A trust dashboard that can't show its work is exactly the false comfort it claims to prevent.

## Run it

```bash
npm install
npm run dev      # local, http://localhost:5175
npm test         # 26 domain tests
npm run build    # type-check + production build
```

Data lives in your browser's `localStorage` only. Export/import the registry as JSON to version it in git — which is itself the point.

## Deploy (Vercel)

Standard Vite static app: import the repo in Vercel, framework preset **Vite**, no environment variables, no server. The deployment ships with a synthetic demo registry so it is useful without any private data.

## What this is not

- Not a compliance opinion, security assessment, or continuity guarantee.
- Passing an exit test proves the *conditions* of portability (formats, coverage, verification, fallbacks) — it does not prove equivalent model behavior on the target platform.
- Provider agnosticism is a spectrum. Provider-specific dependencies can be rational — SancusSight makes their exit cost explicit and their acceptance owned and expiring, rather than pretending they don't exist.
- The registry itself is a sensitive inventory. It stays local by design; treat exports accordingly.

## Naming

"Trust Layer" is used commercially by iTmethods; this project deliberately uses its own name. **Sancus** is the Roman god of trust, oaths and good faith — *SancusSight* is sight over the conditions of trust: not a certification that your stack is trustworthy, but continuous visibility into whether the conditions supporting that trust actually hold.

## Architecture

```
src/
  domain/        # framework-agnostic: types, checks, exit test, report, storage, fixtures
    __tests__/   # vitest — checks, exit test, share-card privacy, round-trip
  components/    # UI, imports only from domain/
  App.tsx        # tabs, state, persistence wiring
```

The domain layer has no React imports and no `window` access outside `storage.ts` — the checks and exit test can be reused headless (e.g., as a CI step over a committed `registry.json`, which is the natural next step).
