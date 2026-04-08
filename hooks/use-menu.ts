"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/types";
import {
  apiDeleteMenuItem,
  apiListMenuItems,
  apiUpsertMenuItem,
} from "@/lib/api";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);

  const refresh = useCallback(async () => {
    const data = await apiListMenuItems();
    setItems(data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = useCallback(async (item: MenuItem) => {
    await apiUpsertMenuItem(item);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await apiDeleteMenuItem(id);
    await refresh();
  }, []);

  return { items, refresh, upsert, remove };
}
