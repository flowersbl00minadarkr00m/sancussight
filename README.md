# SancusSight

SancusSight is a local-first AI governance registry for portability, continuity, control coverage, ownership, and evidence freshness. It reports deterministic checks of recorded facts—not a compliance opinion or a security guarantee.

[**Live demo**](https://sancussight.vercel.app) · [Operations guide](operations/README.md) · [Registry compiler](packages/registry-compiler/README.md) · [License](LICENSE)

## Series context

SancusSight is the proof object for [*The Elastic Mindset*](https://henryflowers45.substack.com/p/the-elastic-mindset) ([LinkedIn post](https://www.linkedin.com/posts/henry-flowers_5-the-elastic-mindset-a-growth-mindset-ugcPost-7486523019910139904-IbXT/)), part of the *Looping in the Human* series.

![SancusSight overview using a fictional demo registry](docs/assets/hero.png)

## What it does

- Inventories AI assets as metadata without ingesting prompts, credentials, or context bodies
- Shows portability and continuity coverage across platforms
- Traces every finding to evidence, an owner, and a required action
- Runs deterministic checks and workflow exit tests without model calls
- Surfaces stale evidence, accepted-risk expiry, and missing fallbacks
- Imports approved evidence from compatible tools without replacing their enforcement
- Exports a local registry and a privacy-minimized share card
- Offers a review-first compiler for building a starter registry from approved metadata roots

## Quick start

Requires Node.js 24 or newer.

```bash
npm ci
npm run dev
```

The browser starts with an obviously fictional registry and stores changes locally. Run the verification suite with:

```bash
npm test
npm run build
```

## Operating modes

### Hosted mode

The static Vite app uses browser storage, manual evidence snapshots, deterministic checks, exit tests, and JSON export. It does not probe localhost, scan your computer, or connect to a collector automatically.

### Local collector mode

The optional Node companion serves the frontend and `/api/v1` from `127.0.0.1:43117`. It reads only sources you explicitly configure and writes only to its own data directory.

```bash
npm run build
npm run collector:start
```

The collector has no generic filesystem, command, subprocess, scanner, or source-write endpoint. API mutations require an allowed Host, exact same Origin, an HttpOnly SameSite session, and a per-session CSRF token. Full setup and rollback details are in the [operations guide](operations/README.md).

## Local registry compiler

The standalone compiler proposes a starter registry from explicitly approved roots, opens a one-time loopback review, and writes local plus sanitized portable outputs only after confirmation.

```powershell
npx sancussight-registry compile --root "C:\path\to\approved\metadata-root"
```

It does not execute discovered commands, start tools, call MCP servers, or retain prompts, responses, credentials, private keys, or unrestricted workspace content. See the [compiler guide](packages/registry-compiler/README.md).

## Privacy and scope

- The hosted demo contains synthetic data and makes no model calls.
- Registry data can still describe sensitive systems; keep real registries private unless deliberately sanitized.
- Passing an exit test proves recorded portability conditions, not equivalent model behavior or compliance.
- Integrated security tools remain separately installed and operated; SancusSight governs their evidence but does not replace enforcement.

## License

[MIT](LICENSE)
