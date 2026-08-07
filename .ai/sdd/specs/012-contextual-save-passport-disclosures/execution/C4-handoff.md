# Feature 012 C4 Worker Handoff

> Supporting control-plane evidence only. Ready-for-review is a recommendation;
> the tracking owner alone reconciles completion and may open C5.

## Identity and Scope

- **Task:** C4 — Build-config dependency closure
- **Worker:** fresh visible top-level task
  `019f95a9-02d1-7fa0-9849-d3f702d8040a`
- **Tracking owner / return target:**
  `019f914a-b672-77b1-837f-0c866b6421bb`
- **Acknowledgment:**
  `sancussight-012-C4-acknowledged-20260724-01`, delivered before
  implementation
- **Ready event:** `sancussight-012-C4-ready-20260724-01`
- **Finding corrected:** unresolved `R1-STANDARDS-001` only
- **Excluded and untouched by C4:** product/UI/runtime, package lock, Vite
  config, deployment, shared tracking, C5+, Feature 013+, providers/Pi,
  commits/pushes, and Spec 005/T16R5/T16/A-002

## Changed Files

- `scripts/verify-feature012-build-inputs.ts`
- `src/lib/__tests__/feature012-build-input-boundary.test.mjs`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C4.md`
- `.ai/sdd/specs/012-contextual-save-passport-disclosures/execution/C4-handoff.md`

`package.json`, `package-lock.json`, and `vite.config.ts` retain their
pre-existing shared dirty state and were not edited by C4.

## Result

- The existing verifier uses Vite's config loader before production builds to
  discover the direct and transitive project-local dependency closure of
  `vite.config.ts`.
- That closure is merged into the existing exact declared-input universe.
  Undeclared helpers fail through the existing missing/extra assertion; no
  second manifest exists.
- Every declared input is individually SHA-256 hashed and contributes to one
  deterministic declared-input digest.
- The focused test reproduces the exact R2 helper changing Vite `base`, adds a
  transitive helper, proves both are discovered and fail when undeclared, and
  proves transitive byte changes alter the corresponding declared-input hash.
- Existing root/`src`/`public` rejection, observed application-module closure,
  two clean byte-identical builds, hostile outside-boundary `.resize`
  immunity, cleanup, and product behavior remain intact.

## Fresh Verification

| Command | Exit | Summary |
|---|---:|---|
| `npm run test:feature012` | 0 | 10/10 |
| `npm run test:feature011` | 0 | 31/31 |
| `npm run test:feature010` | 0 | 31/31 |
| `npm run test:feature009` | 0 | 24/24 |
| `npm run test:feature008` | 0 | 6/6 |
| `npm run test:collector` | 0 | 92/92 |
| `npm run test:registry-compiler` | 0 | 28/28 |
| `npm run verify:core` | 0 | core assertions passed |
| `npm run build` | 0 | 1,846 modules; six output files |
| `npm run verify:feature012-build-inputs` | 0 | 92 declared, digest `982c9724122b05dff2094007ea6933ac6d57eee566c2783ae0621852d5903d9b`, 77 observed, deterministic/adversarial checks passed |
| scoped whitespace verification | 0 | no whitespace errors |

The existing Vite large-chunk warning is non-failing and unchanged. Temporary
config-test directories and the hostile adversarial candidate were removed.

## Recommendation

Freshly reconcile C4 against the approved ticket and bounded R2 finding. If
the tracking owner agrees, authoritatively complete C4 and only then open C5.
