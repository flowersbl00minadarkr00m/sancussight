import { useRef } from "react";

export function TopBar({
  assetCount,
  platformCount,
  onExport,
  onImport,
  onShare,
  onReset,
}: {
  assetCount: number;
  platformCount: number;
  onExport: () => void;
  onImport: (json: string) => void;
  onShare: () => void;
  onReset: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <header className="mb-4 border-b-2 border-(--color-navy) pb-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif m-0 text-3xl tracking-tight text-(--color-navy)">SancusSight</h1>
          <p className="m-0 text-[0.85rem] text-(--color-muted)">
            Trust made observable — a local registry of what your AI stack depends on, what is shared, and what is
            rented. <span className="font-mono text-[0.7rem]">{assetCount} assets · {platformCount} platforms · data never leaves this browser</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={onShare}>
            SHARE CARD
          </button>
          <button className="btn" onClick={onExport}>
            EXPORT JSON
          </button>
          <button className="btn" onClick={() => fileInput.current?.click()}>
            IMPORT JSON
          </button>
          <button className="btn" onClick={onReset}>
            RESET TO DEMO
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then(onImport);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </header>
  );
}
