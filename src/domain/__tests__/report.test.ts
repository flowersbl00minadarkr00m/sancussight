import { describe, expect, it } from "vitest";
import { demoRegistry } from "../fixtures.ts";
import { runChecks } from "../checks.ts";
import { shareCard } from "../report.ts";
import { importRegistry, exportRegistry } from "../storage.ts";

const TODAY = new Date().toISOString().slice(0, 10);

describe("shareCard", () => {
  it("aggregates without leaking asset names, locations or owners", () => {
    const registry = demoRegistry();
    const card = shareCard(registry, runChecks(registry, TODAY), TODAY);

    for (const asset of registry.assets) {
      expect(card).not.toContain(asset.name);
      expect(card).not.toContain(asset.location);
    }
    expect(card).not.toContain("finance systems");
    expect(card).toContain("Portability posture");
    expect(card).toContain("Exit tests");
  });
});

describe("registry export/import round trip", () => {
  it("round-trips the demo registry", () => {
    const registry = demoRegistry();
    const imported = importRegistry(exportRegistry(registry));
    expect(imported?.assets.length).toBe(registry.assets.length);
    expect(imported?.platforms).toEqual(registry.platforms);
  });

  it("rejects malformed json and wrong shapes", () => {
    expect(importRegistry("not json")).toBeUndefined();
    expect(importRegistry(JSON.stringify({ nope: true }))).toBeUndefined();
  });
});

describe("demo registry", () => {
  it("exercises every signal status so the demo dashboard is honest", () => {
    const registry = demoRegistry();
    const statuses = new Set(runChecks(registry, TODAY).map((s) => s.status));
    expect(statuses.has("pass")).toBe(true);
    expect(statuses.has("warn")).toBe(true);
    expect(statuses.has("fail")).toBe(true);
    expect(statuses.has("accepted")).toBe(true);
    expect(statuses.has("unknown")).toBe(true);
  });
});
