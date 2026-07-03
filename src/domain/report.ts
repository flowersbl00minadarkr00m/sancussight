// Privacy-safe share card. Aggregates statuses and verdicts only —
// deliberately excludes asset names, locations, owners and platform-by-asset
// detail so the card can be posted publicly without inventorying the stack
// for an attacker.

import type { Registry, Signal } from "./types.ts";
import { DIMENSION_LABELS } from "./types.ts";
import { rollupByDimension } from "./checks.ts";
import { runExitTest, workflowsOf } from "./exitTest.ts";

export function shareCard(registry: Registry, signals: Signal[], today: string): string {
  const rollups = rollupByDimension(signals);
  const lines: string[] = [];

  lines.push(`# Portability posture — ${today}`);
  lines.push("");
  lines.push(
    `${registry.assets.length} assets registered across ${registry.platforms.length} approved platforms.`,
  );
  lines.push("");
  lines.push("| Dimension | Pass | Warn | Fail | Accepted | Unknown |");
  lines.push("|---|---|---|---|---|---|");
  for (const r of rollups) {
    lines.push(
      `| ${DIMENSION_LABELS[r.dimension]} | ${r.pass} | ${r.warn} | ${r.fail} | ${r.accepted} | ${r.unknown} |`,
    );
  }

  lines.push("");
  lines.push("## Exit tests (workflow names redacted)");
  const workflows = workflowsOf(registry);
  workflows.forEach((wf, i) => {
    const target = wf.fallbackProvider ?? registry.platforms.find((p) => p !== wf.primaryProvider);
    if (!target) return;
    const result = runExitTest(registry, wf.id, target, today);
    if (result) {
      lines.push(`- Workflow ${String.fromCharCode(65 + i)} → fallback platform: **${result.verdict}**`);
    }
  });

  lines.push("");
  lines.push(
    "_Statuses reflect deterministic checks of registry metadata (formats, coverage, verification dates, fallbacks, owners) — not model behavior, security posture or a compliance opinion._",
  );
  lines.push("_Generated locally by SancusSight. No asset content leaves the browser._");
  return lines.join("\n");
}
