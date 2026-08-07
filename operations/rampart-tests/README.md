# Spec 005 RAMPART suite

This suite is intentionally bounded. It performs one read-only loopback status request against the SancusSight collector and retains only verdict metadata in its `Result`.

The second required target—an operator-used agentic workflow—is not represented by a generic command adapter. It must be added as a fixed, named adapter only after the operator selects that workflow for the active RAMPART exercise.

Official RAMPART JSON reports remain in a producer-owned directory outside SancusSight. `operations/lib/Export-RampartReport.ps1` projects them into `RampartOperationalReportV1` and drops turns, prompts, responses, tool calls, evaluator rationale, and arbitrary metadata.
