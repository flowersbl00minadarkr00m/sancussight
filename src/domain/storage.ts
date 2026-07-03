// localStorage persistence, defensive by convention: unknown shapes merge
// onto known-good defaults, parse errors fall back to the demo fixture.

import type { Registry } from "./types.ts";
import { demoRegistry } from "./fixtures.ts";

const KEY = "sancussight:v1";

export function loadRegistry(): Registry {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return demoRegistry();
    const parsed = JSON.parse(raw) as Partial<Registry>;
    if (!Array.isArray(parsed.assets) || !Array.isArray(parsed.platforms)) {
      return demoRegistry();
    }
    return {
      platforms: parsed.platforms.filter((p): p is string => typeof p === "string"),
      assets: parsed.assets,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    } as Registry;
  } catch {
    return demoRegistry();
  }
}

export function saveRegistry(registry: Registry): void {
  window.localStorage.setItem(KEY, JSON.stringify({ ...registry, updatedAt: new Date().toISOString() }));
}

export function resetRegistry(): Registry {
  window.localStorage.removeItem(KEY);
  return demoRegistry();
}

export function exportRegistry(registry: Registry): string {
  return JSON.stringify(registry, null, 2);
}

export function importRegistry(json: string): Registry | undefined {
  try {
    const parsed = JSON.parse(json) as Partial<Registry>;
    if (!Array.isArray(parsed.assets) || !Array.isArray(parsed.platforms)) return undefined;
    return {
      platforms: parsed.platforms.filter((p): p is string => typeof p === "string"),
      assets: parsed.assets,
      updatedAt: new Date().toISOString(),
    } as Registry;
  } catch {
    return undefined;
  }
}
