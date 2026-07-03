// SancusSight domain types. Everything here is metadata about AI assets —
// never asset content. The registry records where things live, who owns
// them, where they are shared, and what they depend on.

export type AssetKind = "context" | "skill" | "workflow" | "control" | "evaluation";

/** Open formats are inspectable/exportable anywhere; proprietary means the
 * canonical form lives inside one provider's product. */
export type AssetFormat = "markdown" | "yaml" | "json" | "plaintext" | "code" | "proprietary";

export type Sensitivity = "public" | "internal" | "sensitive";

/** One platform this asset has been made available on, with the date of the
 * last successful import/retrieval/use test there (not just "we uploaded it"). */
export interface CoverageEntry {
  platform: string;
  lastVerified?: string; // ISO date; absent = shared but never verified
}

/** A dependency on one provider's non-portable capability. */
export interface ProviderDependency {
  provider: string;
  capability: string; // e.g. "private retrieval connector", "hidden memory"
  fallback?: string; // named, approved alternative — absent = locked
}

/** A consciously accepted exception: converts failures into owned risk until expiry. */
export interface AcceptedRisk {
  note: string;
  owner: string;
  expires: string; // ISO date
}

export interface EvidenceEntry {
  label: string; // e.g. "eval fixtures v3 green", "substitution drill record"
  date: string; // ISO date
}

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  format: AssetFormat;
  location: string; // where the canonical copy lives (a path label, not content)
  owner?: string;
  sensitivity: Sensitivity;
  lastReviewed?: string; // ISO date of last human review of the asset itself
  coverage: CoverageEntry[];
  providerDependencies: ProviderDependency[];
  evidence: EvidenceEntry[];
  acceptedRisk?: AcceptedRisk;
  // Workflow-only fields:
  dependsOn?: string[]; // asset ids this workflow requires
  primaryProvider?: string;
  fallbackProvider?: string;
  lastSubstitutionDrill?: string; // ISO date
}

export interface Registry {
  /** Platforms the owner has approved for this stack. Coverage is judged against these. */
  platforms: string[];
  assets: Asset[];
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Signals: the output of deterministic checks. Per the dashboard contract,
// a signal is never a bare status — it always carries the exact condition
// tested, what was found, the evidence source, the owner and the action.
// ---------------------------------------------------------------------------

export type SignalStatus = "pass" | "warn" | "fail" | "accepted" | "unknown";

export type Dimension = "context" | "skills" | "continuity" | "controls" | "evidence";

export interface Signal {
  id: string;
  dimension: Dimension;
  assetId: string;
  assetName: string;
  status: SignalStatus;
  condition: string; // the exact condition being tested
  finding: string; // what the check found
  evidence: string; // where the evidence comes from (registry metadata)
  owner: string; // named owner, or "unowned"
  action?: string; // required action when status is not pass
}

export interface DimensionRollup {
  dimension: Dimension;
  pass: number;
  warn: number;
  fail: number;
  accepted: number;
  unknown: number;
}

// Exit test -----------------------------------------------------------------

export type ExitItemStatus = "ok" | "unverified" | "missing" | "locked";

export interface ExitTestItem {
  assetId: string;
  assetName: string;
  status: ExitItemStatus;
  note: string;
}

export type ExitVerdict = "survives" | "degrades" | "breaks";

export interface ExitTestResult {
  workflowId: string;
  workflowName: string;
  targetPlatform: string;
  verdict: ExitVerdict;
  items: ExitTestItem[];
}

export const DIMENSIONS: Dimension[] = ["context", "skills", "continuity", "controls", "evidence"];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  context: "Context portability",
  skills: "Skill portability",
  continuity: "Workflow continuity",
  controls: "Runtime controls",
  evidence: "Evidence & ownership",
};
