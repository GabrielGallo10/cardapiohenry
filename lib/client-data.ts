import type { MenuItem, Order, OrderStatus } from "./types";
import { SEED_MENU } from "./seed-menu";

const MENU_KEY = "cardapio-henry-menu";
const ORDERS_KEY = "cardapio-henry-orders";

export const MENU_UPDATED = "cardapio-henry-menu-updated";
export const ORDERS_UPDATED = "cardapio-henry-orders-updated";

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readMenuItems(): MenuItem[] {
  if (typeof window === "undefined") return [...SEED_MENU];
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (!raw) {
      writeMenuItemsInternal(SEED_MENU);
      return [...SEED_MENU];
    }
    const parsed = JSON.parse(raw) as MenuItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeMenuItemsInternal(SEED_MENU);
      return [...SEED_MENU];
    }
    return parsed;
  } catch {
    writeMenuItemsInternal(SEED_MENU);
    return [...SEED_MENU];
  }
}

function writeMenuItemsInternal(items: MenuItem[]): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

export function writeMenuItems(items: MenuItem[]): void {
  if (typeof window === "undefined") return;
  writeMenuItemsInternal(items);
  window.dispatchEvent(new CustomEvent(MENU_UPDATED));
}

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrdersInternal(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function writeOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  writeOrdersInternal(orders);
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED));
}

export function addOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const full: Order = {
    ...order,
    id: randomId(),
    createdAt: new Date().toISOString(),
  };
  writeOrders([full, ...readOrders()]);
  return full;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated = { ...orders[idx], status };
  const next = [...orders];
  next[idx] = updated;
  writeOrders(next);
  return updated;
}

const CATEGORY_PRESETS_KEY = "cardapio-henry-category-presets";

export const CATEGORY_PRESETS_UPDATED = "cardapio-henry-category-presets-updated";

export function readCategoryPresets(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CATEGORY_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s) => String(s).trim())
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

/** Adiciona categoria à lista de sugestões (dedupe case-insensitive). */
export function addCategoryPreset(name: string): boolean {
  if (typeof window === "undefined") return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  const current = readCategoryPresets();
  if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    return true;
  }
  localStorage.setItem(
    CATEGORY_PRESETS_KEY,
    JSON.stringify([...current, trimmed]),
  );
  window.dispatchEvent(new CustomEvent(CATEGORY_PRESETS_UPDATED));
  return true;
}
