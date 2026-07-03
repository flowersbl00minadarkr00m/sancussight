import type { Asset, Signal } from "../domain";
import { Card, Eyebrow, StatusChip } from "./ui.tsx";

export function AssetDetail({
  asset,
  signals,
  today,
  onVerify,
  onReview,
  onDrill,
  onClose,
}: {
  asset: Asset;
  signals: Signal[];
  today: string;
  onVerify: (assetId: string, platform: string) => void;
  onReview: (assetId: string) => void;
  onDrill: (assetId: string) => void;
  onClose: () => void;
}) {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Eyebrow>
            {asset.kind} · {asset.format} · {asset.sensitivity}
          </Eyebrow>
          <h2 className="font-serif m-0 text-xl text-(--color-navy)">{asset.name}</h2>
          <div className="font-mono text-[0.68rem] text-(--color-muted)">
            {asset.location} · owner: {asset.owner ?? "unowned"}
            {asset.lastReviewed ? ` · reviewed ${asset.lastReviewed}` : " · never reviewed"}
          </div>
        </div>
        <button className="btn" onClick={onClose}>
          CLOSE
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button className="btn" onClick={() => onReview(asset.id)}>
          RECORD REVIEW TODAY
        </button>
        {asset.kind === "workflow" ? (
          <button className="btn" onClick={() => onDrill(asset.id)}>
            RECORD SUBSTITUTION DRILL TODAY
          </button>
        ) : (
          asset.coverage.map((c) => (
            <button key={c.platform} className="btn" onClick={() => onVerify(asset.id, c.platform)}>
              VERIFIED ON {c.platform.toUpperCase()} TODAY
            </button>
          ))
        )}
      </div>

      {asset.acceptedRisk && (
        <div className="mb-3 rounded-sm border border-(--color-accept) bg-(--color-accept-soft) p-2 text-[0.8rem]">
          <span className="font-mono text-[0.65rem] tracking-widest text-(--color-accept)">ACCEPTED RISK </span>
          {asset.acceptedRisk.note} — {asset.acceptedRisk.owner}, expires {asset.acceptedRisk.expires}
        </div>
      )}

      <Eyebrow>Signals — condition · finding · evidence · owner · action</Eyebrow>
      <ul className="divide-y divide-(--color-line)">
        {signals.map((s) => (
          <li key={s.id} className="py-2">
            <div className="flex items-center gap-2">
              <StatusChip status={s.status} />
              <span className="text-sm font-semibold">{s.condition}</span>
            </div>
            <div className="mt-1 text-[0.8rem]">{s.finding}</div>
            <div className="font-mono text-[0.65rem] text-(--color-muted)">
              evidence: {s.evidence} · checked {today} · owner: {s.owner}
            </div>
            {s.action && (
              <div className="font-mono text-[0.68rem] text-(--color-rust)">→ {s.action}</div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
