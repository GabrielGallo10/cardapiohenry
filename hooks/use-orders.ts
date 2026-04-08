"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import {
  apiClearOrders,
  apiGetOrderByID,
  apiListOrders,
  apiUpdateOrderStatus,
} from "@/lib/api";
import { openWhatsAppNotifyCustomer } from "@/lib/whatsapp";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiListOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao carregar pedidos do servidor.",
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      setError(null);
      const order = orders.find((o) => o.id === id);
      try {
        await apiUpdateOrderStatus(id, status);
        if (order && status !== "novo") {
          try {
            const full = await apiGetOrderByID(id);
            openWhatsAppNotifyCustomer(full, status);
          } catch {
            openWhatsAppNotifyCustomer(order, status);
          }
        }
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Falha ao atualizar status do pedido.",
        );
      }
    },
    [refresh, orders],
  );

  const clearAll = useCallback(async () => {
    await apiClearOrders();
    await refresh();
  }, [refresh]);

  return { orders, loading, error, refresh, setStatus, clearAll };
}
