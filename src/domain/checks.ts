// Deterministic checks. Given a registry and a reference date, produce
// signals. No randomness, no network, no model calls: the same registry
// always yields the same signals, so anyone can reproduce a screenshot.

import type {
  Asset,
  Dimension,
  DimensionRollup,
  Registry,
  Signal,
  SignalStatus,
} from "./types.ts";
import { DIMENSIONS } from "./types.ts";

export const THRESHOLDS = {
  /** Days since a human last reviewed the asset before it counts as stale. */
  staleReviewDays: 45,
  /** Days since a per-platform verification test before coverage counts as stale. */
  staleVerifyDays: 30,
  /** Days since the last substitution drill before a workflow needs a new one. */
  drillDays: 90,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS);
}

function dimensionFor(asset: Asset): Dimension {
  switch (asset.kind) {
    case "context":
      return "context";
    case "skill":
      return "skills";
    case "workflow":
      return "continuity";
    case "control":
      return "controls";
    case "evaluation":
      return "evidence";
  }
}

interface RawSignal {
  key: string;
  status: SignalStatus;
  condition: string;
  finding: string;
  evidence: string;
  action?: string;
  dimension?: Dimension; // override the asset's home dimension
}

function riskAccepted(asset: Asset, today: string): boolean {
  return !!asset.acceptedRisk && Date.parse(asset.acceptedRisk.expires) >= Date.parse(today);
}

/** Accepted risk converts failures into owned, expiring exceptions — it never upgrades to pass. */
function applyAcceptedRisk(raw: RawSignal, asset: Asset, today: string): RawSignal {
  if (raw.status === "fail" && riskAccepted(asset, today)) {
    const risk = asset.acceptedRisk!;
    return {
      ...raw,
      status: "accepted",
      finding: `${raw.finding} — accepted by ${risk.owner} until ${risk.expires}: ${risk.note}`,
      action: `Re-decide or remediate before ${risk.expires}`,
    };
  }
  return raw;
}

function checkAsset(asset: Asset, registry: Registry, today: string): RawSignal[] {
  const raws: RawSignal[] = [];
  const approved = new Set(registry.platforms);

  // 1. Format portability — applies to every asset.
  if (asset.format === "proprietary") {
    raws.push({
      key: "format",
      status: "fail",
      condition: "Canonical copy is stored in an open, exportable format",
      finding: `Canonical form is provider-proprietary (${asset.location})`,
      evidence: `Registry format field = proprietary`,
      action: "Export to an open format and make that copy canonical",
    });
  } else {
    raws.push({
      key: "format",
      status: "pass",
      condition: "Canonical copy is stored in an open, exportable format",
      finding: `Stored as ${asset.format} at ${asset.location}`,
      evidence: "Registry format field",
    });
  }

  // 2. Ownership — every asset needs a named owner.
  raws.push(
    asset.owner
      ? {
          key: "owner",
          status: "pass",
          condition: "Asset has a named owner",
          finding: `Owned by ${asset.owner}`,
          evidence: "Registry owner field",
          dimension: "evidence",
        }
      : {
          key: "owner",
          status: "fail",
          condition: "Asset has a named owner",
          finding: "No owner recorded — exceptions on this asset have nowhere to go",
          evidence: "Registry owner field is empty",
          action: "Assign an owner",
          dimension: "evidence",
        },
  );

  // 3. Review freshness.
  if (!asset.lastReviewed) {
    raws.push({
      key: "review",
      status: "unknown",
      condition: `Reviewed by a human within ${THRESHOLDS.staleReviewDays} days`,
      finding: "Never reviewed (no review date recorded)",
      evidence: "Registry lastReviewed field is empty",
      action: "Review the asset and record the date",
    });
  } else {
    const age = daysBetween(asset.lastReviewed, today);
    raws.push(
      age <= THRESHOLDS.staleReviewDays
        ? {
            key: "review",
            status: "pass",
            condition: `Reviewed by a human within ${THRESHOLDS.staleReviewDays} days`,
            finding: `Reviewed ${age} days ago`,
            evidence: `lastReviewed = ${asset.lastReviewed}`,
          }
        : {
            key: "review",
            status: "warn",
            condition: `Reviewed by a human within ${THRESHOLDS.staleReviewDays} days`,
            finding: `Stale — last reviewed ${age} days ago`,
            evidence: `lastReviewed = ${asset.lastReviewed}`,
            action: "Re-review; stale context silently degrades every agent that loads it",
          },
    );
  }

  // 4. Coverage breadth + verification (non-workflow assets).
  if (asset.kind !== "workflow") {
    const onApproved = asset.coverage.filter((c) => approved.has(c.platform));
    const verified = onApproved.filter((c) => !!c.lastVerified);
    if (verified.length >= 2) {
      const stale = verified.filter(
        (c) => daysBetween(c.lastVerified!, today) > THRESHOLDS.staleVerifyDays,
      );
      raws.push(
        stale.length === 0
          ? {
              key: "coverage",
              status: "pass",
              condition: "Shared and verified on 2+ approved platforms",
              finding: `Verified on ${verified.map((c) => c.platform).join(", ")}`,
              evidence: "Coverage entries with lastVerified dates",
            }
          : {
              key: "coverage",
              status: "warn",
              condition: "Shared and verified on 2+ approved platforms",
              finding: `Verified on ${verified.length} platforms but ${stale
                .map((c) => c.platform)
                .join(", ")} not re-verified in ${THRESHOLDS.staleVerifyDays} days`,
              evidence: "Coverage entries with lastVerified dates",
              action: "Re-run the import/retrieval test on the stale platforms",
            },
      );
    } else if (verified.length === 1) {
      raws.push({
        key: "coverage",
        status: "warn",
        condition: "Shared and verified on 2+ approved platforms",
        finding: `Only verified on ${verified[0].platform} — single-platform asset`,
        evidence: "Coverage entries with lastVerified dates",
        action: "Import and verify on a second approved platform",
      });
    } else {
      raws.push({
        key: "coverage",
        status: "fail",
        condition: "Shared and verified on 2+ approved platforms",
        finding:
          onApproved.length > 0
            ? "Shared but never verified anywhere — sharing without a retrieval test is a hope, not a control"
            : "Not shared with any approved platform",
        evidence: "Coverage entries",
        action: "Run an import/retrieval test on at least one approved platform",
      });
    }
  }

  // 5. Provider dependencies.
  for (const dep of asset.providerDependencies) {
    raws.push(
      dep.fallback
        ? {
            key: `dep-${dep.provider}-${dep.capability}`,
            status: "pass",
            condition: "Every provider-specific dependency names an approved fallback",
            finding: `Depends on ${dep.provider} (${dep.capability}); fallback: ${dep.fallback}`,
            evidence: "Registry providerDependencies",
          }
        : {
            key: `dep-${dep.provider}-${dep.capability}`,
            status: "fail",
            condition: "Every provider-specific dependency names an approved fallback",
            finding: `Locked to ${dep.provider}: ${dep.capability} has no fallback`,
            evidence: "Registry providerDependencies",
            action: `Name and test an alternative to ${dep.provider}'s ${dep.capability}`,
          },
    );
  }

  // 6. Workflow-specific checks.
  if (asset.kind === "workflow") {
    if (asset.primaryProvider && !asset.fallbackProvider) {
      raws.push({
        key: "concentration",
        status: "fail",
        condition: "Workflow has an approved fallback provider",
        finding: `Concentrated on ${asset.primaryProvider} with no fallback`,
        evidence: "Registry primaryProvider/fallbackProvider",
        action: "Approve and record a fallback provider",
      });
    } else if (asset.primaryProvider && asset.fallbackProvider) {
      raws.push({
        key: "concentration",
        status: "pass",
        condition: "Workflow has an approved fallback provider",
        finding: `Primary ${asset.primaryProvider}, fallback ${asset.fallbackProvider}`,
        evidence: "Registry primaryProvider/fallbackProvider",
      });
    }

    if (!asset.lastSubstitutionDrill) {
      raws.push({
        key: "drill",
        status: "warn",
        condition: `Substitution drill run within ${THRESHOLDS.drillDays} days`,
        finding: "Never drilled — the fallback is untested paper",
        evidence: "Registry lastSubstitutionDrill is empty",
        action: "Run the workflow once on the fallback provider and record the result",
      });
    } else {
      const age = daysBetween(asset.lastSubstitutionDrill, today);
      raws.push(
        age <= THRESHOLDS.drillDays
          ? {
              key: "drill",
              status: "pass",
              condition: `Substitution drill run within ${THRESHOLDS.drillDays} days`,
              finding: `Last drilled ${age} days ago`,
              evidence: `lastSubstitutionDrill = ${asset.lastSubstitutionDrill}`,
            }
          : {
              key: "drill",
              status: "warn",
              condition: `Substitution drill run within ${THRESHOLDS.drillDays} days`,
              finding: `Last drill was ${age} days ago`,
              evidence: `lastSubstitutionDrill = ${asset.lastSubstitutionDrill}`,
              action: "Re-run the substitution drill",
            },
      );
    }

    // Evidence presence: a workflow should point at least one evaluation asset
    // or carry evidence entries of its own.
    const evalAssets = (asset.dependsOn ?? [])
      .map((id) => registry.assets.find((a) => a.id === id))
      .filter((a): a is Asset => !!a && a.kind === "evaluation");
    if (evalAssets.length === 0 && asset.evidence.length === 0) {
      raws.push({
        key: "evidence",
        status: "warn",
        condition: "Workflow has durable evaluation evidence",
        finding: "No evaluation asset linked and no evidence recorded — outcomes exist only in chat history",
        evidence: "Registry dependsOn/evidence",
        action: "Export evaluation cases into a durable, versioned fixture",
        dimension: "evidence",
      });
    } else {
      const latest = [
        ...asset.evidence,
        ...evalAssets.flatMap((a) => a.evidence),
      ].sort((a, b) => b.date.localeCompare(a.date))[0];
      raws.push({
        key: "evidence",
        status: "pass",
        condition: "Workflow has durable evaluation evidence",
        finding: latest
          ? `Latest evidence: ${latest.label} (${latest.date})`
          : `Evaluation asset linked: ${evalAssets.map((a) => a.name).join(", ")}`,
        evidence: "Registry dependsOn/evidence",
        dimension: "evidence",
      });
    }
  }

  return raws.map((raw) => applyAcceptedRisk(raw, asset, today));
}

export function runChecks(registry: Registry, today: string): Signal[] {
  const signals: Signal[] = [];
  for (const asset of registry.assets) {
    for (const raw of checkAsset(asset, registry, today)) {
      signals.push({
        id: `${asset.id}:${raw.key}`,
        dimension: raw.dimension ?? dimensionFor(asset),
        assetId: asset.id,
        assetName: asset.name,
        status: raw.status,
        condition: raw.condition,
        finding: raw.finding,
        evidence: raw.evidence,
        owner: asset.owner ?? "unowned",
        action: raw.action,
      });
    }
  }
  return signals;
}

export function rollupByDimension(signals: Signal[]): DimensionRollup[] {
  return DIMENSIONS.map((dimension) => {
    const of = signals.filter((s) => s.dimension === dimension);
    return {
      dimension,
      pass: of.filter((s) => s.status === "pass").length,
      warn: of.filter((s) => s.status === "warn").length,
      fail: of.filter((s) => s.status === "fail").length,
      accepted: of.filter((s) => s.status === "accepted").length,
      unknown: of.filter((s) => s.status === "unknown").length,
    };
  });
}

/** The remediation queue: everything that demands a human, worst first. */
export function remediationQueue(signals: Signal[]): Signal[] {
  const order: Record<SignalStatus, number> = { fail: 0, warn: 1, unknown: 2, accepted: 3, pass: 4 };
  return signals
    .filter((s) => s.status !== "pass")
    .sort((a, b) => order[a.status] - order[b.status] || a.assetName.localeCompare(b.assetName));
}
