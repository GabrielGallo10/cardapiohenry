import type { OrderStatus } from "./types";

const STATUS_FLOW: OrderStatus[] = ["novo", "em_preparo", "pronto", "concluido"];

export function allowedStatusOptions(current: OrderStatus): OrderStatus[] {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0) return [current];
  return STATUS_FLOW.slice(idx);
}
