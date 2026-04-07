"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/types";
import { MENU_UPDATED, readMenuItems, writeMenuItems } from "@/lib/client-data";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);

  const refresh = useCallback(() => {
    setItems(readMenuItems());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener(MENU_UPDATED, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(MENU_UPDATED, on);
      window.removeEventListener("storage", on);
    };
  }, [refresh]);

  const upsert = useCallback((item: MenuItem) => {
    const current = readMenuItems();
    const idx = current.findIndex((i) => i.id === item.id);
    const next =
      idx === -1
        ? [...current, item]
        : current.map((i, j) => (j === idx ? item : i));
    writeMenuItems(next);
    setItems(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readMenuItems().filter((i) => i.id !== id);
    writeMenuItems(next);
    setItems(next);
  }, []);

  return { items, refresh, upsert, remove };
}
