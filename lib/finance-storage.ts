import type { ManualFinanceEntry, ManualFinanceKind } from "./types";

const KEY = "cardapio-henry-finance-manual";

export const FINANCE_MANUAL_UPDATED = "cardapio-henry-finance-manual-updated";

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readManualFinanceEntries(): ManualFinanceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

function isValidEntry(x: unknown): x is ManualFinanceEntry {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.occurredAt === "string" &&
    (o.kind === "entrada" || o.kind === "saida") &&
    typeof o.description === "string" &&
    typeof o.amount === "number" &&
    Number.isFinite(o.amount) &&
    o.amount >= 0
  );
}

function writeAll(entries: ManualFinanceEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(FINANCE_MANUAL_UPDATED));
}

export function addManualFinanceEntry(input: {
  kind: ManualFinanceKind;
  description: string;
  amount: number;
  occurredAt: string;
}): ManualFinanceEntry {
  const desc = input.description.trim();
  const amount = Math.abs(Number(input.amount)) || 0;
  const entry: ManualFinanceEntry = {
    id: randomId(),
    createdAt: new Date().toISOString(),
    occurredAt: input.occurredAt,
    kind: input.kind,
    description: desc || "(Sem descrição)",
    amount,
  };
  const next = [entry, ...readManualFinanceEntries()];
  writeAll(next);
  return entry;
}

export function removeManualFinanceEntry(id: string): void {
  const next = readManualFinanceEntries().filter((e) => e.id !== id);
  writeAll(next);
}
