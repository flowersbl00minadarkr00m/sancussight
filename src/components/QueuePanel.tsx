import type { Signal } from "../domain";
import { Card, Eyebrow, StatusChip } from "./ui.tsx";

export function QueuePanel({
  queue,
  onSelectAsset,
}: {
  queue: Signal[];
  onSelectAsset: (assetId: string) => void;
}) {
  return (
    <Card>
      <Eyebrow>Remediation queue — {queue.length} item(s), worst first. An unowned queue is theater.</Eyebrow>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {["STATUS", "ASSET", "FINDING", "REQUIRED ACTION", "OWNER"].map((h) => (
              <th
                key={h}
                className="border-b border-(--color-line-strong) py-2 pr-3 text-left font-mono text-[0.65rem] tracking-widest text-(--color-muted)"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {queue.map((s) => (
            <tr key={s.id} className="border-b border-(--color-line) align-top">
              <td className="py-2 pr-3">
                <StatusChip status={s.status} />
              </td>
              <td className="py-2 pr-3">
                <button
                  className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-semibold text-(--color-navy) underline decoration-(--color-line-strong) underline-offset-2 hover:decoration-(--color-navy)"
                  onClick={() => onSelectAsset(s.assetId)}
                >
                  {s.assetName}
                </button>
              </td>
              <td className="py-2 pr-3 text-[0.8rem]">{s.finding}</td>
              <td className="py-2 pr-3 text-[0.8rem]">{s.action ?? "—"}</td>
              <td
                className="font-mono py-2 text-[0.7rem]"
                style={s.owner === "unowned" ? { color: "var(--color-rust)" } : undefined}
              >
                {s.owner}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
