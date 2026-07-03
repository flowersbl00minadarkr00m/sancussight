import { useMemo, useState } from "react";
import type { Registry } from "./domain";
import {
  importRegistry,
  exportRegistry,
  loadRegistry,
  remediationQueue,
  resetRegistry,
  rollupByDimension,
  runChecks,
  saveRegistry,
  shareCard,
} from "./domain";
import { TopBar } from "./components/TopBar.tsx";
import { OverviewPanel } from "./components/OverviewPanel.tsx";
import { CoverageMatrix } from "./components/CoverageMatrix.tsx";
import { AssetDetail } from "./components/AssetDetail.tsx";
import { ExitTestPanel } from "./components/ExitTestPanel.tsx";
import { QueuePanel } from "./components/QueuePanel.tsx";
import { ShareCardModal } from "./components/ShareCardModal.tsx";

type Tab = "overview" | "registry" | "exit" | "queue";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "registry", label: "REGISTRY" },
  { id: "exit", label: "EXIT TEST" },
  { id: "queue", label: "QUEUE" },
];

export default function App() {
  const [registry, setRegistry] = useState<Registry>(() => loadRegistry());
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [shareOpen, setShareOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const signals = useMemo(() => runChecks(registry, today), [registry, today]);
  const rollups = useMemo(() => rollupByDimension(signals), [signals]);
  const queue = useMemo(() => remediationQueue(signals), [signals]);

  const selectedAsset = registry.assets.find((a) => a.id === selectedId);

  function update(next: Registry) {
    setRegistry(next);
    saveRegistry(next);
  }

  function patchAsset(assetId: string, patch: (a: Registry["assets"][number]) => Registry["assets"][number]) {
    update({
      ...registry,
      assets: registry.assets.map((a) => (a.id === assetId ? patch(a) : a)),
    });
  }

  function selectAsset(assetId: string) {
    setSelectedId(assetId);
    setTab("registry");
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <TopBar
        assetCount={registry.assets.length}
        platformCount={registry.platforms.length}
        onShare={() => setShareOpen(true)}
        onExport={() => {
          const blob = new Blob([exportRegistry(registry)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `sancussight-registry-${today}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onImport={(json) => {
          const imported = importRegistry(json);
          if (imported) {
            update(imported);
            setSelectedId(undefined);
          } else {
            window.alert("That file is not a valid SancusSight registry (expected { platforms: [], assets: [] }).");
          }
        }}
        onReset={() => {
          update(resetRegistry());
          setSelectedId(undefined);
        }}
      />

      <nav className="mb-4 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="btn"
            style={
              tab === t.id
                ? { background: "var(--color-navy)", borderColor: "var(--color-navy)", color: "#fdfcf8" }
                : undefined
            }
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "queue" && queue.length > 0 ? ` (${queue.length})` : ""}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <OverviewPanel
          rollups={rollups}
          flagged={queue.filter((s) => s.status === "fail" || s.status === "warn")}
          onSelectAsset={selectAsset}
        />
      )}

      {tab === "registry" && (
        <div className="space-y-4">
          <CoverageMatrix registry={registry} today={today} selectedId={selectedId} onSelect={setSelectedId} />
          {selectedAsset && (
            <AssetDetail
              asset={selectedAsset}
              signals={signals.filter((s) => s.assetId === selectedAsset.id)}
              today={today}
              onClose={() => setSelectedId(undefined)}
              onReview={(id) => patchAsset(id, (a) => ({ ...a, lastReviewed: today }))}
              onDrill={(id) => patchAsset(id, (a) => ({ ...a, lastSubstitutionDrill: today }))}
              onVerify={(id, platform) =>
                patchAsset(id, (a) => ({
                  ...a,
                  coverage: a.coverage.map((c) => (c.platform === platform ? { ...c, lastVerified: today } : c)),
                }))
              }
            />
          )}
        </div>
      )}

      {tab === "exit" && <ExitTestPanel registry={registry} today={today} />}

      {tab === "queue" && <QueuePanel queue={queue} onSelectAsset={selectAsset} />}

      {shareOpen && <ShareCardModal markdown={shareCard(registry, signals, today)} onClose={() => setShareOpen(false)} />}

      <footer className="mt-6 border-t border-(--color-line) pt-3 text-[0.7rem] text-(--color-muted)">
        SancusSight monitors the <em>conditions</em> of portability — formats, coverage, verification, fallbacks, owners —
        from metadata you control. It is not a compliance opinion, a security assessment or a continuity guarantee.
        Part of <span className="font-mono">Human Systems for an Agentic Age</span> — Henry Flowers.
      </footer>
    </div>
  );
}
