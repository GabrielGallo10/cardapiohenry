"use client";

import { useCallback, useEffect, useState } from "react";
import type { ManualFinanceEntry, ManualFinanceKind } from "@/lib/types";
import {
  apiClearManualFinances,
  apiCreateManualFinance,
  apiDeleteManualFinance,
  apiListManualFinances,
} from "@/lib/api";

export function useManualFinance() {
  const [entries, setEntries] = useState<ManualFinanceEntry[]>([]);

  const refresh = useCallback(async () => {
    const list = await apiListManualFinances();
    setEntries(list);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: {
      kind: ManualFinanceKind;
      description: string;
      amount: number;
      occurredAt: string;
    }) => {
      await apiCreateManualFinance(input);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(async (id: string) => {
    await apiDeleteManualFinance(id);
    await refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    await apiClearManualFinances();
    await refresh();
  }, [refresh]);

  return { entries, add, remove, clearAll, refresh };
}
