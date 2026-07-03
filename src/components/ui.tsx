import type { ReactNode } from "react";
import type { SignalStatus } from "../domain";

const STATUS_STYLES: Record<SignalStatus, { label: string; fg: string; bg: string }> = {
  pass: { label: "PASS", fg: "var(--color-moss)", bg: "var(--color-moss-soft)" },
  warn: { label: "WARN", fg: "var(--color-amber)", bg: "var(--color-amber-soft)" },
  fail: { label: "FAIL", fg: "var(--color-rust)", bg: "var(--color-rust-soft)" },
  accepted: { label: "ACCEPTED", fg: "var(--color-accept)", bg: "var(--color-accept-soft)" },
  unknown: { label: "UNKNOWN", fg: "var(--color-slate)", bg: "var(--color-slate-soft)" },
};

export function StatusChip({ status }: { status: SignalStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="font-mono inline-block rounded-sm px-1.5 py-0.5 text-[0.62rem] font-semibold tracking-wider"
      style={{ color: s.fg, background: s.bg, border: `1px solid ${s.fg}33` }}
    >
      {s.label}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow mb-1">▮ {children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}
