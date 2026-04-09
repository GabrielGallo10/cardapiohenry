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
    try {
      const data = await apiListMenuItems();
      setItems(data);
    } catch {
      // Mantém lista atual em caso de falha transitória de rede/API.
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "https://cardapiohenry-api.onrender.com";
    const wsBase = apiBase.startsWith("https://")
      ? `wss://${apiBase.slice("https://".length)}`
      : apiBase.startsWith("http://")
        ? `ws://${apiBase.slice("http://".length)}`
        : apiBase;

    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let closedByEffect = false;

    const connect = () => {
      if (closedByEffect) return;
      ws = new WebSocket(`${wsBase}/ws`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type?: string };
          if (data.type === "menu.updated") {
            void refresh();
          }
        } catch {
          // Ignora payload inválido.
        }
      };

      ws.onclose = () => {
        if (closedByEffect) return;
        reconnectTimer = window.setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
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
