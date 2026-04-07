import type { OrderStatus } from "./types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: "Novo",
  em_preparo: "Em preparo",
  pronto: "Pronto para entrega",
  concluido: "Concluído",
};

/** Classes para o <select> conforme valor atual */
export const ORDER_STATUS_SELECT_STYLES: Record<OrderStatus, string> = {
  novo:
    "border-sky-300/90 bg-sky-50 text-sky-950 ring-sky-200/60 focus:border-sky-500 focus:ring-sky-200",
  em_preparo:
    "border-amber-300/90 bg-amber-50 text-amber-950 ring-amber-200/60 focus:border-amber-500 focus:ring-amber-200",
  pronto:
    "border-emerald-300/90 bg-emerald-50 text-emerald-950 ring-emerald-200/60 focus:border-emerald-500 focus:ring-emerald-200",
  concluido:
    "border-zinc-300/90 bg-zinc-100 text-zinc-900 ring-zinc-200/60 focus:border-zinc-500 focus:ring-zinc-200",
};

/** Badge compacto (pílula) */
export const ORDER_STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  novo: "border border-sky-200 bg-sky-100 text-sky-900",
  em_preparo: "border border-amber-200 bg-amber-100 text-amber-950",
  pronto: "border border-emerald-200 bg-emerald-100 text-emerald-950",
  concluido: "border border-zinc-200 bg-zinc-200 text-zinc-900",
};
