# SancusSight Registry Compiler

This package compiles a SancusSight registry from bounded local metadata on
Windows (Node.js 24+). It is read-only until a user confirms a grouped browser
review. It never executes discovered commands, launches upstream tools, calls
MCP servers, or accepts argument passthrough.

## Quick start

```powershell
npx sancussight-registry compile --root "C:\path\to\approved\metadata-root"
```

The compiler prints a loopback review URL and opens it unless `--no-open` is
provided. Confirmed output is written to the user-scoped SancusSight directory
unless `--local-out` and `--portable-out` are supplied. The local registry,
portable export, sidecar, skipped report, and bounded summary are written only
after confirmation.

```powershell
npx sancussight-registry validate --local-out "$env:LOCALAPPDATA\SancusSight\registry.json"
npx sancussight-registry refresh --root "C:\path\to\approved\metadata-root"
```

## Scope and privacy

Roots are explicit and read-only. The fixed adapters recognize the canonical
project registry plus known manifests for projects, skills, plugins, commands,
loops, workflows, MCPs, agent configurations, controls, evaluations, evidence
contracts, and adapters. They record names, identifiers, versions, providers,
platform labels, bounded references, and provenance—not file bodies.

Local output may retain exact paths needed to reconnect on the same machine.
Portable output replaces them with `root:*` and `project:*` aliases and removes
user/home paths and user names. Prompts, responses, reasoning, command bodies
and arguments, tool payloads, credentials, private keys, and ambiguous or
credential-adjacent records are excluded and appear only as safe skipped
categories. Disappeared assets are retained as `missing`; refresh never deletes
prior outputs automatically.

The first release is Windows-first. macOS/Linux adapter defaults and a
non-interactive automation mode remain deferred; `--no-open` is provided for
operators who want to open the printed loopback URL themselves.

## Exit codes

- `0` confirmed output or successful validation
- `2` usage or unsafe-option failure
- `4` cancelled or expired review
- `5` validation/output failure
- `6` confirmed output with one or more bounded discovery errors; inspect the skipped report and summary before retrying
