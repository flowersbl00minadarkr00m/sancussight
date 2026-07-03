import { useState } from "react";
import type { ExitTestItem, Registry } from "../domain";
import { runExitTest, workflowsOf } from "../domain";
import { Card, Eyebrow } from "./ui.tsx";

const ITEM_STYLE: Record<ExitTestItem["status"], { glyph: string; color: string }> = {
  ok: { glyph: "✓", color: "var(--color-moss)" },
  unverified: { glyph: "!", color: "var(--color-amber)" },
  missing: { glyph: "✕", color: "var(--color-rust)" },
  locked: { glyph: "⚿", color: "var(--color-rust)" },
};

const VERDICT_STYLE = {
  survives: { color: "var(--color-moss)", bg: "var(--color-moss-soft)", note: "Every dependency is portable and verified on the target." },
  degrades: { color: "var(--color-amber)", bg: "var(--color-amber-soft)", note: "The workflow would run, but on unverified or stale ground." },
  breaks: { color: "var(--color-rust)", bg: "var(--color-rust-soft)", note: "At least one dependency does not survive the move." },
} as const;

export function ExitTestPanel({ registry, today }: { registry: Registry; today: string }) {
  const workflows = workflowsOf(registry);
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "");
  const workflow = workflows.find((w) => w.id === workflowId);
  const targets = registry.platforms.filter((p) => p !== workflow?.primaryProvider);
  const [target, setTarget] = useState("");
  const effectiveTarget = targets.includes(target) ? target : (workflow?.fallbackProvider ?? targets[0] ?? "");

  const result = workflowId && effectiveTarget ? runExitTest(registry, workflowId, effectiveTarget, today) : undefined;

  return (
    <Card>
      <Eyebrow>Exit test — what breaks if this workflow must move tomorrow?</Eyebrow>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          className="font-mono rounded-sm border border-(--color-line-strong) bg-(--color-card-strong) px-2 py-1.5 text-[0.75rem]"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
        >
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} (primary: {w.primaryProvider ?? "—"})
            </option>
          ))}
        </select>
        <span className="font-mono text-[0.7rem] text-(--color-muted)">→ moves to</span>
        <select
          className="font-mono rounded-sm border border-(--color-line-strong) bg-(--color-card-strong) px-2 py-1.5 text-[0.75rem]"
          value={effectiveTarget}
          onChange={(e) => setTarget(e.target.value)}
        >
          {targets.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <>
          <div
            className="mb-3 rounded-sm border p-3"
            style={{
              background: VERDICT_STYLE[result.verdict].bg,
              borderColor: VERDICT_STYLE[result.verdict].color,
            }}
          >
            <span className="font-serif text-lg font-semibold" style={{ color: VERDICT_STYLE[result.verdict].color }}>
              {result.verdict.toUpperCase()}
            </span>
            <span className="ml-2 text-[0.8rem] text-(--color-ink)">{VERDICT_STYLE[result.verdict].note}</span>
          </div>
          <ul className="divide-y divide-(--color-line)">
            {result.items.map((item) => (
              <li key={`${item.assetId}-${item.note}`} className="flex items-baseline gap-3 py-2">
                <span className="font-mono w-4 text-center" style={{ color: ITEM_STYLE[item.status].color }}>
                  {ITEM_STYLE[item.status].glyph}
                </span>
                <span className="min-w-40 text-sm font-semibold">{item.assetName}</span>
                <span className="text-[0.8rem] text-(--color-muted)">{item.note}</span>
              </li>
            ))}
            {result.items.length === 0 && (
              <li className="py-2 text-sm text-(--color-muted)">
                This workflow declares no dependencies — either it is trivially portable or the registry is incomplete.
              </li>
            )}
          </ul>
          <p className="mt-3 border-t border-(--color-line) pt-2 text-[0.7rem] text-(--color-muted)">
            The exit test checks the registered conditions of portability (formats, coverage, verification,
            fallbacks). Passing it does not guarantee equivalent model behavior on the target platform.
          </p>
        </>
      )}
    </Card>
  );
}
