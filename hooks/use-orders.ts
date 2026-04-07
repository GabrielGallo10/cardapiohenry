"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import {
  ORDERS_UPDATED,
  readOrders,
  updateOrderStatus as patchStatus,
} from "@/lib/client-data";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = useCallback(() => {
    setOrders(readOrders());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener(ORDERS_UPDATED, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(ORDERS_UPDATED, on);
      window.removeEventListener("storage", on);
    };
  }, [refresh]);

  const setStatus = useCallback((id: string, status: OrderStatus) => {
    patchStatus(id, status);
    setOrders(readOrders());
  }, []);

  return { orders, refresh, setStatus };
}
