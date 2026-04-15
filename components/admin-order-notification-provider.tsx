"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiListOrders } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

const BADGE_CAP = 5;
const STORAGE_KEY = "henry-admin-order-detail-viewed-ids";

function loadViewedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function persistViewedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

type Ctx = {
  /** Pedidos com status `novo` cujo detalhe o admin ainda não abriu. */
  unseenPedidos: number;
  isPedidoNovoNaoAberto: (order: { id: string; status: OrderStatus }) => boolean;
  /** Chamar ao abrir `/admin/pedidos/[id]` — remove destaque e decrementa o badge. */
  markPedidoDetalheAberto: (orderId: string) => void;
};

const defaultCtx: Ctx = {
  unseenPedidos: 0,
  isPedidoNovoNaoAberto: () => false,
  markPedidoDetalheAberto: () => {},
};

const AdminOrderNotifContext = createContext<Ctx>(defaultCtx);

export function useAdminUnseenPedidos() {
  return useContext(AdminOrderNotifContext);
}

export function AdminOrderNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [unseenPedidos, setUnseenPedidos] = useState(0);
  const viewedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    viewedIdsRef.current = viewedIds;
  }, [viewedIds]);

  const loadOrders = useCallback(async () => {
    const s = getSession();
    if (s?.role !== "admin") return [];
    return apiListOrders();
  }, []);

  const updateUnseenCount = useCallback(async () => {
    try {
      const orders = await loadOrders();
      const n = orders.filter(
        (o) => o.status === "novo" && !viewedIdsRef.current.has(o.id),
      ).length;
      setUnseenPedidos(n);
    } catch {
      /* ignore */
    }
  }, [loadOrders]);

  useEffect(() => {
    setViewedIds(loadViewedIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void updateUnseenCount();
  }, [hydrated, viewedIds, updateUnseenCount]);

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
            void updateUnseenCount();
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
  }, [updateUnseenCount]);

  const isPedidoNovoNaoAberto = useCallback(
    (order: { id: string; status: OrderStatus }) =>
      order.status === "novo" && !viewedIds.has(order.id),
    [viewedIds],
  );

  const markPedidoDetalheAberto = useCallback((orderId: string) => {
    const id = orderId.trim();
    if (!id) return;
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistViewedIds(next);
      return next;
    });
  }, []);

  const value: Ctx = {
    unseenPedidos,
    isPedidoNovoNaoAberto,
    markPedidoDetalheAberto,
  };

  return (
    <AdminOrderNotifContext.Provider value={value}>
      {children}
    </AdminOrderNotifContext.Provider>
  );
}

export function adminPedidosBadgeLabel(count: number): string {
  if (count <= 0) return "";
  if (count > BADGE_CAP) return `${BADGE_CAP}+`;
  return String(count);
}
