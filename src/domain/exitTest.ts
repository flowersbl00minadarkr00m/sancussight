// The exit test: "what breaks if this workflow has to run on a different
// platform tomorrow?" A deterministic walk over the workflow's dependencies —
// no model behavior is simulated; this tests the *conditions* of portability,
// which is all a registry honestly can test.

import type { Asset, ExitTestItem, ExitTestResult, ExitVerdict, Registry } from "./types.ts";
import { THRESHOLDS, daysBetween } from "./checks.ts";

function testAssetOn(
  asset: Asset,
  targetPlatform: string,
  leavingProvider: string | undefined,
  today: string,
): ExitTestItem {
  // A dependency locked to the provider being left breaks the move outright.
  const locked = asset.providerDependencies.find(
    (d) => d.provider === leavingProvider && !d.fallback,
  );
  if (locked) {
    return {
      assetId: asset.id,
      assetName: asset.name,
      status: "locked",
      note: `Depends on ${locked.provider}'s ${locked.capability} with no fallback`,
    };
  }

  if (asset.format === "proprietary") {
    return {
      assetId: asset.id,
      assetName: asset.name,
      status: "locked",
      note: "Canonical copy is provider-proprietary; nothing portable to move",
    };
  }

  const entry = asset.coverage.find((c) => c.platform === targetPlatform);
  if (!entry) {
    return {
      assetId: asset.id,
      assetName: asset.name,
      status: "missing",
      note: `Not shared with ${targetPlatform}`,
    };
  }
  if (!entry.lastVerified) {
    return {
      assetId: asset.id,
      assetName: asset.name,
      status: "unverified",
      note: `Shared with ${targetPlatform} but never verified there`,
    };
  }
  const age = daysBetween(entry.lastVerified, today);
  if (age > THRESHOLDS.staleVerifyDays) {
    return {
      assetId: asset.id,
      assetName: asset.name,
      status: "unverified",
      note: `Last verified on ${targetPlatform} ${age} days ago (stale)`,
    };
  }
  return {
    assetId: asset.id,
    assetName: asset.name,
    status: "ok",
    note: `Verified on ${targetPlatform} ${age} days ago`,
  };
}

export function runExitTest(
  registry: Registry,
  workflowId: string,
  targetPlatform: string,
  today: string,
): ExitTestResult | undefined {
  const workflow = registry.assets.find((a) => a.id === workflowId && a.kind === "workflow");
  if (!workflow) return undefined;

  const deps = (workflow.dependsOn ?? [])
    .map((id) => registry.assets.find((a) => a.id === id))
    .filter((a): a is Asset => !!a);

  const items = deps.map((dep) =>
    testAssetOn(dep, targetPlatform, workflow.primaryProvider, today),
  );

  // The workflow's own provider dependencies count too.
  const ownLock = workflow.providerDependencies.find(
    (d) => d.provider === workflow.primaryProvider && !d.fallback,
  );
  if (ownLock) {
    items.unshift({
      assetId: workflow.id,
      assetName: `${workflow.name} (workflow itself)`,
      status: "locked",
      note: `Depends on ${ownLock.provider}'s ${ownLock.capability} with no fallback`,
    });
  }

  const verdict: ExitVerdict = items.some((i) => i.status === "locked" || i.status === "missing")
    ? "breaks"
    : items.some((i) => i.status === "unverified")
      ? "degrades"
      : "survives";

  return {
    workflowId: workflow.id,
    workflowName: workflow.name,
    targetPlatform,
    verdict,
    items,
  };
}

export function workflowsOf(registry: Registry): Asset[] {
  return registry.assets.filter((a) => a.kind === "workflow");
}
