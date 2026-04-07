"use client";

import { useCallback, useEffect, useState } from "react";
import type { ManualFinanceEntry, ManualFinanceKind } from "@/lib/types";
import {
  addManualFinanceEntry,
  FINANCE_MANUAL_UPDATED,
  readManualFinanceEntries,
  removeManualFinanceEntry,
} from "@/lib/finance-storage";

export function useManualFinance() {
  const [entries, setEntries] = useState<ManualFinanceEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(readManualFinanceEntries());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener(FINANCE_MANUAL_UPDATED, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(FINANCE_MANUAL_UPDATED, on);
      window.removeEventListener("storage", on);
    };
  }, [refresh]);

  const add = useCallback(
    (input: {
      kind: ManualFinanceKind;
      description: string;
      amount: number;
      occurredAt: string;
    }) => {
      addManualFinanceEntry(input);
      setEntries(readManualFinanceEntries());
    },
    [],
  );

  const remove = useCallback((id: string) => {
    removeManualFinanceEntry(id);
    setEntries(readManualFinanceEntries());
  }, []);

  return { entries, add, remove, refresh };
}
