import type { DimensionRollup, Signal } from "../domain";
import { DIMENSION_LABELS } from "../domain";
import { Card, Eyebrow, StatusChip } from "./ui.tsx";

const CONDITIONS_TESTED: Record<string, string> = {
  context: "Open format · verified on 2+ platforms · fresh review · no hidden provider memory",
  skills: "Inspectable runbook · cross-platform verification · named dependencies",
  continuity: "Fallback provider approved · substitution drill current · dependencies portable",
  controls: "Policies shared and verified where agents run · reviewed on schedule",
  evidence: "Named owners · durable eval fixtures · exceptions expiring, not permanent",
};

export function OverviewPanel({
  rollups,
  flagged,
  onSelectAsset,
}: {
  rollups: DimensionRollup[];
  flagged: Signal[];
  onSelectAsset: (assetId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {rollups.map((r) => {
          const worst = r.fail > 0 ? "fail" : r.warn > 0 ? "warn" : r.unknown > 0 ? "unknown" : r.accepted > 0 ? "accepted" : "pass";
          return (
            <Card key={r.dimension}>
              <Eyebrow>{DIMENSION_LABELS[r.dimension]}</Eyebrow>
              <div className="mb-2 flex items-baseline gap-2">
                <StatusChip status={worst} />
              </div>
              <div className="font-mono text-[0.68rem] leading-5 text-(--color-muted)">
                <span className="text-(--color-moss)">{r.pass} pass</span>
                {" · "}
                <span className="text-(--color-amber)">{r.warn} warn</span>
                {" · "}
                <span className="text-(--color-rust)">{r.fail} fail</span>
                <br />
                <span className="text-(--color-accept)">{r.accepted} accepted</span>
                {" · "}
                <span className="text-(--color-slate)">{r.unknown} unknown</span>
              </div>
              <p className="mt-2 text-[0.68rem] leading-4 text-(--color-muted)">
                {CONDITIONS_TESTED[r.dimension]}
              </p>
            </Card>
          );
        })}
      </div>

      <Card>
        <Eyebrow>Open flags — every status traces to a tested condition</Eyebrow>
        {flagged.length === 0 ? (
          <p className="text-sm text-(--color-muted)">No open flags. Suspicious. Re-check your registry is honest.</p>
        ) : (
          <ul className="divide-y divide-(--color-line)">
            {flagged.map((s) => (
              <li key={s.id} className="flex items-start gap-3 py-2">
                <StatusChip status={s.status} />
                <div className="min-w-0">
                  <button
                    className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-semibold text-(--color-navy) underline decoration-(--color-line-strong) underline-offset-2 hover:decoration-(--color-navy)"
                    onClick={() => onSelectAsset(s.assetId)}
                  >
                    {s.assetName}
                  </button>
                  <div className="text-[0.8rem] text-(--color-ink)">{s.finding}</div>
                  {s.action && (
                    <div className="font-mono text-[0.68rem] text-(--color-muted)">→ {s.action} · owner: {s.owner}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
