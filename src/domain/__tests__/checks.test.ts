import { describe, expect, it } from "vitest";
import type { Asset, Registry } from "../types.ts";
import { remediationQueue, rollupByDimension, runChecks } from "../checks.ts";

const TODAY = "2026-07-03";

function makeAsset(overrides: Partial<Asset>): Asset {
  return {
    id: "a1",
    name: "Test asset",
    kind: "context",
    format: "markdown",
    location: "vault/test.md",
    owner: "owner",
    sensitivity: "internal",
    lastReviewed: "2026-07-01",
    coverage: [
      { platform: "claude", lastVerified: "2026-07-01" },
      { platform: "codex", lastVerified: "2026-07-01" },
    ],
    providerDependencies: [],
    evidence: [],
    ...overrides,
  };
}

function makeRegistry(assets: Asset[]): Registry {
  return { platforms: ["claude", "codex", "chatgpt"], assets, updatedAt: TODAY };
}

function signalFor(registry: Registry, assetId: string, key: string) {
  return runChecks(registry, TODAY).find((s) => s.id === `${assetId}:${key}`);
}

describe("format portability", () => {
  it("passes open formats and fails proprietary ones", () => {
    const open = makeRegistry([makeAsset({})]);
    expect(signalFor(open, "a1", "format")?.status).toBe("pass");

    const closed = makeRegistry([makeAsset({ format: "proprietary" })]);
    const signal = signalFor(closed, "a1", "format");
    expect(signal?.status).toBe("fail");
    expect(signal?.action).toBeTruthy();
  });

  it("converts a failure into an owned exception while accepted risk is unexpired", () => {
    const accepted = makeRegistry([
      makeAsset({
        format: "proprietary",
        acceptedRisk: { note: "worth it", owner: "owner", expires: "2026-12-31" },
      }),
    ]);
    expect(signalFor(accepted, "a1", "format")?.status).toBe("accepted");

    const expired = makeRegistry([
      makeAsset({
        format: "proprietary",
        acceptedRisk: { note: "worth it", owner: "owner", expires: "2026-01-01" },
      }),
    ]);
    expect(signalFor(expired, "a1", "format")?.status).toBe("fail");
  });
});

describe("coverage", () => {
  it("passes when verified on two approved platforms recently", () => {
    expect(signalFor(makeRegistry([makeAsset({})]), "a1", "coverage")?.status).toBe("pass");
  });

  it("warns on single-platform assets", () => {
    const reg = makeRegistry([
      makeAsset({ coverage: [{ platform: "claude", lastVerified: "2026-07-01" }] }),
    ]);
    expect(signalFor(reg, "a1", "coverage")?.status).toBe("warn");
  });

  it("fails when shared but never verified", () => {
    const reg = makeRegistry([
      makeAsset({ coverage: [{ platform: "claude" }, { platform: "codex" }] }),
    ]);
    const s = signalFor(reg, "a1", "coverage");
    expect(s?.status).toBe("fail");
    expect(s?.finding).toContain("never verified");
  });

  it("warns when a verification is stale", () => {
    const reg = makeRegistry([
      makeAsset({
        coverage: [
          { platform: "claude", lastVerified: "2026-07-01" },
          { platform: "codex", lastVerified: "2026-04-01" },
        ],
      }),
    ]);
    expect(signalFor(reg, "a1", "coverage")?.status).toBe("warn");
  });
});

describe("ownership and review", () => {
  it("fails unowned assets and routes the signal to the evidence dimension", () => {
    const s = signalFor(makeRegistry([makeAsset({ owner: undefined })]), "a1", "owner");
    expect(s?.status).toBe("fail");
    expect(s?.dimension).toBe("evidence");
    expect(s?.owner).toBe("unowned");
  });

  it("marks never-reviewed assets unknown and stale reviews warn", () => {
    expect(
      signalFor(makeRegistry([makeAsset({ lastReviewed: undefined })]), "a1", "review")?.status,
    ).toBe("unknown");
    expect(
      signalFor(makeRegistry([makeAsset({ lastReviewed: "2026-01-01" })]), "a1", "review")?.status,
    ).toBe("warn");
  });
});

describe("provider dependencies", () => {
  it("fails a dependency without fallback and passes one with a named fallback", () => {
    const reg = makeRegistry([
      makeAsset({
        providerDependencies: [
          { provider: "claude", capability: "private connector" },
          { provider: "chatgpt", capability: "notebook", fallback: "vault export" },
        ],
      }),
    ]);
    const signals = runChecks(reg, TODAY);
    expect(signals.find((s) => s.id === "a1:dep-claude-private connector")?.status).toBe("fail");
    expect(signals.find((s) => s.id === "a1:dep-chatgpt-notebook")?.status).toBe("pass");
  });
});

describe("workflow continuity", () => {
  const workflow = (overrides: Partial<Asset>) =>
    makeAsset({
      id: "wf1",
      kind: "workflow",
      coverage: [],
      primaryProvider: "claude",
      fallbackProvider: "codex",
      lastSubstitutionDrill: "2026-06-20",
      dependsOn: [],
      ...overrides,
    });

  it("fails provider concentration without fallback", () => {
    const reg = makeRegistry([workflow({ fallbackProvider: undefined })]);
    expect(signalFor(reg, "wf1", "concentration")?.status).toBe("fail");
  });

  it("warns when a workflow has never been drilled", () => {
    const reg = makeRegistry([workflow({ lastSubstitutionDrill: undefined })]);
    const s = signalFor(reg, "wf1", "drill");
    expect(s?.status).toBe("warn");
    expect(s?.finding).toContain("Never drilled");
  });

  it("warns when evaluation evidence is missing and passes when an eval asset is linked", () => {
    const noEvidence = makeRegistry([workflow({})]);
    expect(signalFor(noEvidence, "wf1", "evidence")?.status).toBe("warn");

    const evalAsset = makeAsset({ id: "ev1", kind: "evaluation", evidence: [{ label: "v1", date: "2026-06-01" }] });
    const withEvidence = makeRegistry([evalAsset, workflow({ dependsOn: ["ev1"] })]);
    expect(signalFor(withEvidence, "wf1", "evidence")?.status).toBe("pass");
  });
});

describe("rollup and queue", () => {
  it("counts every signal exactly once across dimensions", () => {
    const reg = makeRegistry([makeAsset({}), makeAsset({ id: "a2", kind: "skill" })]);
    const signals = runChecks(reg, TODAY);
    const total = rollupByDimension(signals).reduce(
      (n, r) => n + r.pass + r.warn + r.fail + r.accepted + r.unknown,
      0,
    );
    expect(total).toBe(signals.length);
  });

  it("puts failures first in the remediation queue and excludes passes", () => {
    const reg = makeRegistry([
      makeAsset({ format: "proprietary", lastReviewed: "2026-01-01" }),
    ]);
    const queue = remediationQueue(runChecks(reg, TODAY));
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].status).toBe("fail");
    expect(queue.every((s) => s.status !== "pass")).toBe(true);
  });
});
