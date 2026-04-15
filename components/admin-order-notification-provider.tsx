"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { apiListOrders } from "@/lib/api";
import { getSession } from "@/lib/auth";

const BADGE_CAP = 5;

type Ctx = {
  /** Pedidos novos desde o último snapshot (visitou área de pedidos). */
  unseenPedidos: number;
};

const AdminOrderNotifContext = createContext<Ctx>({ unseenPedidos: 0 });

export function useAdminUnseenPedidos() {
  return useContext(AdminOrderNotifContext);
}

export function AdminOrderNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unseenPedidos, setUnseenPedidos] = useState(0);
  const ackIdsRef = useRef<Set<string>>(new Set());
  const primedRef = useRef(false);

  const snapshotFromOrders = useCallback((orders: { id: string }[]) => {
    ackIdsRef.current = new Set(orders.map((o) => o.id));
    primedRef.current = true;
  }, []);

  const loadOrders = useCallback(async () => {
    const s = getSession();
    if (s?.role !== "admin") return [];
    return apiListOrders();
  }, []);

  /** Primeira carga: considera pedidos atuais como “já vistos”, badge 0. */
  const primeOnce = useCallback(async () => {
    if (primedRef.current) return;
    try {
      const orders = await loadOrders();
      snapshotFromOrders(orders);
      setUnseenPedidos(0);
    } catch {
      /* ignore */
    }
  }, [loadOrders, snapshotFromOrders]);

  const refreshUnseenCount = useCallback(async () => {
    try {
      const orders = await loadOrders();
      if (!primedRef.current) {
        snapshotFromOrders(orders);
        setUnseenPedidos(0);
        return;
      }
      const n = orders.filter((o) => !ackIdsRef.current.has(o.id)).length;
      setUnseenPedidos(n);
    } catch {
      /* ignore */
    }
  }, [loadOrders, snapshotFromOrders]);

  const acknowledgePedidosArea = useCallback(async () => {
    try {
      const orders = await loadOrders();
      snapshotFromOrders(orders);
      setUnseenPedidos(0);
    } catch {
      /* ignore */
    }
  }, [loadOrders, snapshotFromOrders]);

  useEffect(() => {
    void primeOnce();
  }, [primeOnce]);

  useEffect(() => {
    if (!pathname.startsWith("/admin/pedidos")) return;
    void acknowledgePedidosArea();
  }, [pathname, acknowledgePedidosArea]);

  useEffect(() => {
    const s = getSession();
    if (s?.role !== "admin") return;

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "https://cardapiohenry-api.onrender.com";
    const wsBase = apiBase.startsWith("https://")
      ? `wss://${apiBase.slice("https://".length)}`
      : apiBase.startsWith("http://")
        ? `ws://${apiBase.slice("http://".length)}`
        : apiBase;

    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      ws = new WebSocket(`${wsBase}/ws`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type?: string };
          if (data.type === "orders.updated") {
            void refreshUnseenCount();
          }
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        if (closed) return;
        reconnectTimer = window.setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [refreshUnseenCount]);

  return (
    <AdminOrderNotifContext.Provider value={{ unseenPedidos }}>
      {children}
    </AdminOrderNotifContext.Provider>
  );
}

export function adminPedidosBadgeLabel(count: number): string {
  if (count <= 0) return "";
  if (count > BADGE_CAP) return `${BADGE_CAP}+`;
  return String(count);
}
