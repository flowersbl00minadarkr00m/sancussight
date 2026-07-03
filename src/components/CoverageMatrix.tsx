import type { Asset, Registry } from "../domain";
import { THRESHOLDS, daysBetween } from "../domain";
import { Card, Eyebrow } from "./ui.tsx";

const KIND_ORDER: Asset["kind"][] = ["context", "skill", "workflow", "control", "evaluation"];

function cell(asset: Asset, platform: string, today: string) {
  if (asset.kind === "workflow") {
    if (asset.primaryProvider === platform)
      return { glyph: "PRI", title: "Primary provider", color: "var(--color-navy)" };
    if (asset.fallbackProvider === platform)
      return { glyph: "FBK", title: "Fallback provider", color: "var(--color-moss)" };
    return { glyph: "·", title: "Not applicable", color: "var(--color-line-strong)" };
  }
  const entry = asset.coverage.find((c) => c.platform === platform);
  if (!entry) return { glyph: "✕", title: "Not shared", color: "var(--color-rust)" };
  if (!entry.lastVerified)
    return { glyph: "?", title: "Shared, never verified", color: "var(--color-amber)" };
  const age = daysBetween(entry.lastVerified, today);
  if (age > THRESHOLDS.staleVerifyDays)
    return { glyph: "!", title: `Verified ${age}d ago (stale)`, color: "var(--color-amber)" };
  return { glyph: "✓", title: `Verified ${age}d ago`, color: "var(--color-moss)" };
}

export function CoverageMatrix({
  registry,
  today,
  selectedId,
  onSelect,
}: {
  registry: Registry;
  today: string;
  selectedId?: string;
  onSelect: (assetId: string) => void;
}) {
  const assets = [...registry.assets].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name),
  );

  return (
    <Card className="overflow-x-auto">
      <Eyebrow>Coverage matrix — ✓ verified · ! stale · ? unverified · ✕ not shared</Eyebrow>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-(--color-line-strong) py-2 pr-4 text-left font-mono text-[0.65rem] tracking-widest text-(--color-muted)">
              ASSET
            </th>
            <th className="border-b border-(--color-line-strong) py-2 pr-4 text-left font-mono text-[0.65rem] tracking-widest text-(--color-muted)">
              KIND
            </th>
            {registry.platforms.map((p) => (
              <th
                key={p}
                className="border-b border-(--color-line-strong) px-2 py-2 text-center font-mono text-[0.65rem] tracking-widest text-(--color-muted)"
              >
                {p.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="cursor-pointer border-b border-(--color-line) hover:bg-(--color-card-strong)"
              style={selectedId === asset.id ? { background: "var(--color-card-strong)", outline: "1px solid var(--color-navy)" } : undefined}
              onClick={() => onSelect(asset.id)}
            >
              <td className="py-2 pr-4 font-semibold text-(--color-navy)">{asset.name}</td>
              <td className="py-2 pr-4 font-mono text-[0.68rem] text-(--color-muted)">{asset.kind}</td>
              {registry.platforms.map((p) => {
                const c = cell(asset, p, today);
                return (
                  <td key={p} className="px-2 py-2 text-center font-mono text-[0.75rem]" title={c.title}>
                    <span style={{ color: c.color }}>{c.glyph}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
