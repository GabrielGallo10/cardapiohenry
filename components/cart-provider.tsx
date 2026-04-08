"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "henry-bebidas-cart";

type CartContextValue = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback((line: Omit<CartLine, "quantity">) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.menuItemId === line.menuItemId);
      if (idx === -1) return [...prev, { ...line, quantity: 1 }];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      return next;
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => l.menuItemId !== menuItemId);
      }
      return prev.map((l) =>
        l.menuItemId === menuItemId ? { ...l, quantity } : l,
      );
    });
  }, []);

  const removeLine = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return {
      lines,
      addItem,
      setQuantity,
      removeLine,
      clear,
      itemCount,
      subtotal,
    };
  }, [lines, addItem, setQuantity, removeLine, clear]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
