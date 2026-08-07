# Review R2: Feature 012 Findings Follow-up

> Requirements: @requirements.md
> Design: @design.md
> Tasks: @tasks.md#R2
> Pass: R2
> Current authority status: `implementation:in-progress`

## Review Boundary

- **Trigger:** follow-up to the two R1 Standards findings.
- **In scope:** `R1-STANDARDS-001`, `R1-STANDARDS-002`, the C1 fixes, C2/C3 evidence, and direct fix-caused regressions.
- **Preserved:** R1's comprehensive green Spec verdict.
- **Excluded:** unrelated requirements or implementation, predecessor reopening, Feature 013+, providers/Pi, deployment mutation, and Spec 005/T16R5/T16/A-002.
- **Authority effect:** none. This is a reviewer recommendation; the orchestrator owns reconciliation.

## Prior Finding Disposition

| Finding | R2 disposition | Evidence |
| --- | --- | --- |
| `R1-STANDARDS-001` | **Unresolved — blocking** | The verifier rejects missing/extra inputs inside its enumerated root/`src`/`public` universe and proves clean/adversarial equality, but an isolated build-affecting Vite config helper outside that universe is accepted and unobserved while the verifier reports PASS. |
| `R1-STANDARDS-002` | **Resolved** | `App` owns typed `pending | settled` supplementary feedback; `SourceWriteStrip` reads only `feedback.operationPhase`; no user-visible-copy parsing remains. |

## Standards Axis

### Passing evidence

- Tailwind candidate discovery uses `source(none)` with only `index.html` and `src/`, excluding Feature test sources.
- Two clean builds are byte-identical, and a hostile repository-local `output/**/.resize` candidate leaves all six bundle files unchanged.
- The current declared 92-input set and 77 observed bundled project modules close successfully.
- An isolated negative probe correctly rejected an undeclared `src/r2-undeclared-input.ts` and a missing `public/favicon.svg`, both with exit code 1.
- The typed pending phase removes copy coupling without adding a second durable truth model, save owner, persistence path, or user/maintainer choice.
- No direct fix-caused browser, predecessor, source/lock/static, hosted-byte, or runtime regression was observed.

### `R1-STANDARDS-001` remains open

`discoverDeclaredInputUniverse()` enumerates only selected root files plus `src/` and `public/` (`scripts/verify-feature012-build-inputs.ts:138-156`). The capture plugin is supplied to `vite.build()` only after Vite has already loaded and bundled `vite.config.ts` (`scripts/verify-feature012-build-inputs.ts:173-190, 226-233`).

An isolated scratch copy added:

```text
config/r2-build-helper.ts
vite.config.ts -> import { r2BuildBase } from './config/r2-build-helper'
vite.config.ts -> base: r2BuildBase
```

The helper changed a production build setting to `/r2-hidden-config-input/`, yet:

```text
BUILD_AFFECTING_CONFIG_HELPER_PROBE exit=0
verdict: PASS
declaredBuildInputs: 92
observedBundledInputs: 77
baselineBuildsByteIdentical: true
adversarialOutsideBoundaryIgnored: true
```

This is a direct regression in the attempted `R1-STANDARDS-001` correction: the declared boundary is not complete for project-local modules loaded by Vite configuration. Byte equality proves repeatability for the incomplete set, not closure over all build-affecting inputs.

**Bounded correction:** include and fail closed over project-local Vite-config dependency closure (and equivalent build-config helpers) before the build starts, then rerun the same missing/extra, observed-module, clean-build, hostile-candidate, source/lock/static, deployment identity, canonical-byte, and hosted-browser evidence. Do not alter product behavior.

### Coherence and simplification

- The explicit typed phase extends the existing supplementary feedback object and removes the copy-inference special case; it adds no unnecessary durable state.
- The build verifier is one coherent mechanism, but its current discovery and observation seams cover different module-loading phases. Extending that mechanism to config dependency closure is preferable to another parallel manifest.
- No unjustified user decision burden was added. The remaining burden is maintainer-facing: config helpers can silently escape continuity evidence.

## Spec Axis

**Pass within R2 scope.** R1's comprehensive Spec verdict remains green. The C1 changes preserve the sole `sourceController.save(session)` path, existing confirmation and controller semantics, durable `RegistrySession`/`ConnectionState` truth, visible copy, and the approved disclosure behavior. The unresolved issue is Standards/evidence continuity only; no product runtime Spec regression was observed.

## Fresh Verification

| Order | Command | Result |
| ---: | --- | --- |
| 1 | `npm run test:feature012` | Pass — 9/9 |
| 2 | `npm run test:feature011` | Pass — 31/31 |
| 3 | `npm run test:feature010` | Pass — 31/31 |
| 4 | `npm run test:feature009` | Pass — 24/24 |
| 5 | `npm run test:feature008` | Pass — 6/6 |
| 6 | `npm run test:collector` | Pass — 92/92 |
| 7 | `npm run test:registry-compiler` | Pass — 28/28 |
| 8 | `npm run verify:core` | Pass |
| 9 | `npm run build` | Pass — 1,846 modules; six files |
| 10 | `npm run verify:feature012-build-inputs` | Pass — 92 declared, 77 observed, two clean builds identical, hostile `.resize` ignored |
| 11 | `git diff --check` | Pass |

The existing Vite large-chunk warning is non-failing and outside this R2 boundary.

## Fresh Production and Hosted Continuity

- Vercel independently reports project `prj_1xc7VvasBFMzWSvURoWxJkOcuwrJ`, team `team_Y7ueoZZnBOfX63cjuG9R9SYG`, latest production deployment `dpl_FEPZQPnJBA54eB26VNyWPTSzxDQn`, state `READY`, and canonical domain `sancussight.vercel.app`.
- All 92 C3 source/config/lock baseline entries still match their recorded byte counts and SHA-256 values.
- Fresh retrieval of all six canonical hosted files returned HTTP 200 and exact C3 byte/hash equality.
- Vercel reports no runtime errors in the preceding 24 hours.
- Fresh installed-Chrome inspection confirmed the canonical landing page, explicit demo truth, no demo save action, one selected Passport with six native disclosures and approved default states, the one-link footer, zero console warnings/errors, and six static canonical requests. A 320-pixel viewport resize also completed successfully.

## Verdict

**Needs fixes within the bounded Standards scope.**

- Spec axis: Pass, preserving R1.
- Standards axis: `R1-STANDARDS-002` resolved; `R1-STANDARDS-001` remains blocking.
- Overall Feature 012 authority status: unchanged; orchestrator reconciliation required.

