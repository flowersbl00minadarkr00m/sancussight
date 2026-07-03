import { describe, expect, it } from "vitest";
import type { Asset, Registry } from "../types.ts";
import { runExitTest } from "../exitTest.ts";

const TODAY = "2026-07-03";

function asset(overrides: Partial<Asset>): Asset {
  return {
    id: "dep1",
    name: "Dependency",
    kind: "context",
    format: "markdown",
    location: "vault/dep.md",
    owner: "owner",
    sensitivity: "internal",
    lastReviewed: "2026-07-01",
    coverage: [{ platform: "codex", lastVerified: "2026-07-01" }],
    providerDependencies: [],
    evidence: [],
    ...overrides,
  };
}

function workflow(overrides: Partial<Asset>): Asset {
  return asset({
    id: "wf1",
    name: "Workflow",
    kind: "workflow",
    coverage: [],
    dependsOn: ["dep1"],
    primaryProvider: "claude",
    fallbackProvider: "codex",
    ...overrides,
  });
}

function registry(assets: Asset[]): Registry {
  return { platforms: ["claude", "codex", "chatgpt"], assets, updatedAt: TODAY };
}

describe("runExitTest", () => {
  it("survives when every dependency is verified on the target", () => {
    const result = runExitTest(registry([asset({}), workflow({})]), "wf1", "codex", TODAY);
    expect(result?.verdict).toBe("survives");
    expect(result?.items[0].status).toBe("ok");
  });

  it("degrades when a dependency is shared but unverified or stale on the target", () => {
    const unverified = runExitTest(
      registry([asset({ coverage: [{ platform: "codex" }] }), workflow({})]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(unverified?.verdict).toBe("degrades");

    const stale = runExitTest(
      registry([asset({ coverage: [{ platform: "codex", lastVerified: "2026-03-01" }] }), workflow({})]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(stale?.verdict).toBe("degrades");
    expect(stale?.items[0].status).toBe("unverified");
  });

  it("breaks when a dependency is not shared with the target", () => {
    const result = runExitTest(
      registry([asset({ coverage: [{ platform: "claude", lastVerified: "2026-07-01" }] }), workflow({})]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(result?.verdict).toBe("breaks");
    expect(result?.items[0].status).toBe("missing");
  });

  it("breaks on a dependency locked to the provider being left", () => {
    const result = runExitTest(
      registry([
        asset({
          providerDependencies: [{ provider: "claude", capability: "private connector" }],
        }),
        workflow({}),
      ]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(result?.verdict).toBe("breaks");
    expect(result?.items[0].status).toBe("locked");
  });

  it("does not treat a locked dependency as locked when it names a fallback", () => {
    const result = runExitTest(
      registry([
        asset({
          providerDependencies: [
            { provider: "claude", capability: "private connector", fallback: "open adapter" },
          ],
        }),
        workflow({}),
      ]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(result?.verdict).toBe("survives");
  });

  it("breaks on proprietary-format dependencies regardless of coverage", () => {
    const result = runExitTest(
      registry([
        asset({ format: "proprietary", coverage: [{ platform: "codex", lastVerified: "2026-07-01" }] }),
        workflow({}),
      ]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(result?.verdict).toBe("breaks");
    expect(result?.items[0].status).toBe("locked");
  });

  it("counts the workflow's own locked provider dependency", () => {
    const result = runExitTest(
      registry([
        asset({}),
        workflow({ providerDependencies: [{ provider: "claude", capability: "retrieval connector" }] }),
      ]),
      "wf1",
      "codex",
      TODAY,
    );
    expect(result?.verdict).toBe("breaks");
    expect(result?.items[0].assetName).toContain("workflow itself");
  });

  it("returns undefined for a non-workflow id", () => {
    expect(runExitTest(registry([asset({})]), "dep1", "codex", TODAY)).toBeUndefined();
  });
});
