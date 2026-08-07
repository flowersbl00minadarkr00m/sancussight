# Fixed operational lifecycle harness

The scripts in this directory are a bounded operator handoff around the five approved evidence producers. They validate the checked-in inventory and write sanitized run records under `%LOCALAPPDATA%\SancusSight\operations\runs`. They do not install, start, stop, execute, scan, supervise, or mutate an upstream producer.

Fixed entry points are:

- `preflight.ps1 [-SourceId <allowlisted source>] [-DryRun]`
- `install-user.ps1 -SourceId <allowlisted source>`
- `inspect.ps1 [-SourceId <allowlisted source>]`
- `export-source.ps1 -SourceId <allowlisted source> -InputPath <explicit artifact>`
- `run-release-gate.ps1 -InputPath <explicit release manifest>`
- `exercise-failures.ps1 -FailureCase <fixed release-matrix case> [-SourceId <allowlisted source>]`
- `report-release-progress.ps1 -ReleaseRunId <bounded token> -ProducerId <allowlisted source> -State <allowlisted state> -Stage <allowlisted stage> -MessageCode <allowlisted code> [-TargetId <bounded token>] [-StartedAt <run-start timestamp>] [-CompletedUnits <integer> -TotalUnits <positive integer>]`
- `rollback.ps1 -SourceId <allowlisted source> [-PreserveEvidence $true|$false]`
- `uninstall-user.ps1 -SourceId <allowlisted source> [-PreserveEvidence $true|$false]`

The inventory records lifecycle limits, evidence contracts, official URLs, and pinned versions. An empty pinned-version list is an intentional fail-closed state until the real operator-owned tool version is verified. Raw artifacts, credentials, private keys, unrestricted command output, prompts, and responses are never copied into run records.

The progress writer is a fixed, user-scoped heartbeat at `%LOCALAPPDATA%\SancusSight\operations\progress\current.json`. It reports only bounded state metadata; the collector reads it but cannot start, stop, or control a producer.

Pass the approved manifest's run-start timestamp as `StartedAt` on the first heartbeat so elapsed time and the 30-minute deadline are anchored to the run, not to a late status update. Omit unit counts when the producer cannot provide a truthful denominator; the UI then stays indeterminate.

## Claude/Praxen operator run

The release operator may run the approved Praxen behavior verifier through `scripts/run-spec005-praxen-behavior-verifier.ps1`. It defaults to Claude Haiku, loads only project settings plus the pinned Praxen plugin, disables session persistence, allows only `Read`, `Grep`, `Glob`, `Bash`, and `Write`, and denies worker-dispatch tools. This is operator-side upstream execution; it is not a SancusSight route or generic command API.

The runner owns the Step 9.9 draft structure through the paired repository
inputs `operations/praxen/draft-profile-v1.json` and
`operations/praxen/draft-skeleton-v1.md`. The pair supports only Praxen
`1.1.0` and manifest format `1`. Both SHA-256 values are pinned in the runner
and recorded in plan/result evidence. A missing, changed, malformed, or
unsupported profile/skeleton/plugin/manifest pairing fails before model or
converter promotion.

For each fresh attempt the runner copies the exact skeleton bytes to
`staging/draft-skeleton-v1.guidance.md`, marks the copy read-only, and verifies
its hash again after the labelled producer exits. The model writes one
separate final draft. The skeleton fixes the authored top-level order, static
subsection hierarchy, six-category guidance order, field markers, and explicit
rule/finding/positive/log insertion slots. It is guidance and validation input,
never converter input or operational evidence.

PowerShell validates only the byte-zero title; exact authored heading
hierarchy/order; declared dynamic rule/finding heading patterns and parents;
profile/skeleton identity; and forbidden unreplaced slots, sentinels, tabs,
fences, and structural comments. It does not validate field names or presence,
indentation, coercion, typed values, schema completeness, derived
`footer`/`stat_counts`, canonical JSON, or rendering. Those remain owned by the
unchanged pinned `manifest_to_findings.py`, schema validator, and `render.py`.
The runner passes the unchanged final draft to the converter and never repairs,
reorders, normalizes, fills, or synthesizes it.

Every target attempt uses a new non-reused directory with separate `staging`, `converter`, `canonical`, `rendered`, and `operational` areas plus a bounded `result.json`. Claude may write exactly one parser-grade Step 9.9 Markdown draft in `staging`; model-authored JSON, HTML, or TXT is rejected. The runner then:

1. invokes the pinned Praxen `manifest_to_findings.py`;
2. validates and retains the converter-created canonical schema-2.0 JSON;
3. invokes the pinned Praxen `render.py` and template for official HTML/TXT;
4. creates a separate operational projection whose `sancussight.runnerBinding` records the current run, target, Worker Remit hash, canonical content hash, producer timestamp, selected model, and exact Claude/Praxen/converter/renderer/runner versions.

The collector accepts operational Praxen evidence only when that binding matches the immutable canonical sibling. Historical canonical reports remain readable but cannot qualify as A-002 operational evidence without the runner binding. A retry requires a new `AttemptId` and explicit `-RetryApproved`; the runner never reuses an attempt directory.

`scripts/run-spec005-t16-remediation.ps1` coordinates the two approved targets for remediation verification. A producer failure writes a `partial` result naming the target and reason, pauses before further release stages, requires operator direction, and never invokes the release-bundle builder. An explicitly approved exception remains `exception`, `releaseEligible: false`, and non-clean. This remediation harness does not authorize or run T16/A-002 production evidence.

Profile upgrades require a separately approved change that first inspects the
new pinned Praxen SKILL/converter grammar, updates the profile and skeleton as
one pair, recalculates both runner-pinned SHA-256 values, and extends labelled
structural and converter-owned regressions. Changing only one file or accepting
an unpinned version is unsupported. Rollback may restore the prior A-003
staging behavior, but it cannot promote historical output, qualify a partial
attempt, mutate `current-release.json`, or claim release readiness.

T16R2 verification is fixture-only. It may invoke the unchanged pinned
converter and renderer against labelled temporary drafts, but it must not
invoke Claude, Codex, Pi, a provider canary, a Praxen behavior-verifier session,
an operational A-002 run, a retry/exception, or Playwright release acceptance.

Validate the invocation without starting Claude with:

```powershell
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-claude-haiku.ps1
```

Run the deterministic fixture-only boundary regression with:

```powershell
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-praxen-boundary.ps1
```

The regression labels all generated data as T16R fixture evidence, uses the real pinned converter and renderer, exercises fail-closed negative paths, proves partial-state bundle refusal, and deletes its isolated temporary data. It never writes A-002 operational evidence.

## T16 pre-token and local-readiness controls

`scripts/invoke-spec005-t16-pretoken.ps1` is the repository-owned T16 provider
access boundary. It is an operator-side script, not an `operations/` lifecycle
command and not a collector route.

When `-ProjectRoot` is omitted, both the pre-token launcher and local-readiness
checker derive the canonical project root from their own `$PSCommandPath`
after parameter binding. Their behavior does not depend on the caller's
working directory.

The launcher resolves only `claude`, `codex`, and `pi` with `Get-Command` from
the canonical child directory. Claude and Codex require one unambiguous native
`.exe` record and run through Windows PowerShell `-Command`; Pi requires one
unambiguous `.ps1` record and runs through Windows PowerShell `-File`. Aliases,
functions, unsupported extensions, missing records, duplicate accepted
records, missing paths, and inconsistent `Path`/`Source` records fail closed.

The provider argument vectors are fixed in the script. Every child receives
`SANCUSSIGHT_RUNTIME_TARGET_ID=sancussight-local-runtimes`, uses the canonical
project as its working directory, and receives closed standard input.
Standard output and error are read privately with explicit byte limits and a
fixed timeout. The result retains only process/length/timeout/overflow,
encoding, BOM, authentication, exact-marker, target, working-directory,
command-type, host-mode, and path-hash facts. It never returns a provider
response body or error body.

Marker validation rejects a leading UTF-8 BOM, decodes strict UTF-8,
normalizes only `CRLF` and `CR` to `LF`, trims only outer ASCII space, tab, and
line-feed characters, and then compares case-sensitively with the
provider-specific punctuation-free token. Authentication or authorization
language fails before a marker can qualify. Punctuation, prose, fences,
case drift, Unicode whitespace, overflow, timeout, nonzero exit, or any
launcher error also fails before token creation.

Inspect the fixed plan without invoking a provider:

```powershell
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/invoke-spec005-t16-pretoken.ps1 -PlanOnly
```

`-FixtureMode` is reserved for the checked-in regression. It replaces the
command search path with explicit temporary fixture directories, requires all
resolved providers to remain inside those directories, and cannot be combined
with ordinary resolution.

`scripts/verify-spec005-t16-local-readiness.ps1` is a separate read-only,
non-provider prerequisite inspector. It verifies:

- the fixed inventory, telemetry, Praxen, Pipelock, RAMPART, AIMap, matrix,
  collector, builder, and pre-token entrypoints;
- the six pinned inventory records and HTTPS upstream identities;
- both approved Worker Remit files against their paired SHA-256 values;
- canonical `SANCUSSIGHT_DATA_DIR` selection, equal-value legacy alias
  compatibility, directory existence, and separation from the repository;
- the fixed collector `43117`, OTLP `43120`, and AIMap `11434` loopback
  configuration; and
- expected pre-run listener state: collector and AIMap listening on loopback,
  OTLP available for the descriptor-bound fresh process.

The readiness script reads listener metadata only. It does not connect to a
port, execute or authenticate to a provider, install/start/stop anything,
create a token or run, or change release state. Its result contains bounded
roles, hashes, counts, source selection, and port states rather than retained
file contents or provider data.

Run the fake-provider and isolated readiness regressions with:

```powershell
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-pretoken.ps1
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/test-spec005-t16-local-readiness.ps1
```

These tests create only temporary fake `.exe`/`.ps1` providers and loopback
listeners. They do not invoke Claude, Codex, Pi, a canary, a release token/run,
the failure matrix, producer capture, bundle/current-release promotion, or
Playwright.
