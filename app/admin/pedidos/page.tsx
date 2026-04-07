"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  OrderStatusBadge,
  OrderStatusSelect,
} from "@/components/order-status-select";
import {
  ORDER_STATUS_BADGE_STYLES,
  ORDER_STATUS_LABELS,
} from "@/lib/order-status-meta";
import { formatMoney, formatPhoneForDisplay } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { useOrders } from "@/hooks/use-orders";
import {
  ADMIN_CARD_BODY_BG,
  ADMIN_CARD_GLOW,
  ADMIN_CARD_TOP_BAR,
  ADMIN_LIST_CARD_ADDRESS_RULE,
  ADMIN_LIST_CARD_FOOTER,
  ADMIN_LIST_CARD_FOOTER_LABEL,
  ADMIN_LIST_CARD_HIT_OVERLAY,
  ADMIN_LIST_CARD_HOVER,
  ADMIN_LIST_CARD_NAME,
  adminAccentFromIndex,
} from "@/lib/admin-card-accents";

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

function orderTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function formatOrderCompact(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPedidosPage() {
  const router = useRouter();
  const { orders, setStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">(
    "todos",
  );

  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  const visible = useMemo(() => {
    if (statusFilter === "todos") return sorted;
    return sorted.filter((o) => o.status === statusFilter);
  }, [sorted, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Pedidos
        </h1>
        <p className="mt-1.5 text-xs leading-snug text-zinc-600 sm:mt-2 sm:text-sm sm:leading-normal">
          Toque em qualquer lugar do card para abrir o pedido. O menu no rodapé
          serve só para alterar o status.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-10 text-center text-sm text-zinc-600 sm:rounded-2xl sm:py-14">
          Nenhum pedido ainda.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-2.5">
            <p
              id="filtro-status-pedidos-label"
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              Filtrar por status
            </p>
            <div
              role="radiogroup"
              aria-labelledby="filtro-status-pedidos-label"
              className="mt-2 flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                role="radio"
                aria-checked={statusFilter === "todos"}
                onClick={() => setStatusFilter("todos")}
                className={`shrink-0 snap-start rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:px-4 sm:text-sm ${
                  statusFilter === "todos"
                    ? "border-amber-500/90 bg-amber-50 text-amber-950 shadow-sm ring-2 ring-amber-200/70"
                    : "border-zinc-200/95 bg-zinc-50/90 text-zinc-700 hover:border-zinc-300 hover:bg-white"
                }`}
              >
                Todos
              </button>
              {ALL_STATUSES.map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setStatusFilter(s)}
                    className={`shrink-0 snap-start rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:px-4 sm:text-sm ${
                      active
                        ? `${ORDER_STATUS_BADGE_STYLES[s]} shadow-sm ring-2 ring-black/5`
                        : "border-zinc-200/95 bg-zinc-50/90 text-zinc-700 hover:border-zinc-300 hover:bg-white"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 py-10 text-center text-sm text-zinc-600">
              Nenhum pedido com este status.
            </div>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {visible.map((order, index) => {
                const accent = adminAccentFromIndex(index);
                const total = orderTotal(order.items);
                const phoneDigits = order.customerPhone.replace(/\D/g, "");
                const phoneDisplay =
                  phoneDigits.length >= 10
                    ? formatPhoneForDisplay(phoneDigits)
                    : order.customerPhone;
                const when = formatOrderCompact(order.createdAt);

                return (
                  <li
                    key={order.id}
                    className={`group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-left shadow-sm ring-1 ring-zinc-100/80 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:rounded-3xl ${ADMIN_LIST_CARD_HOVER[accent]}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 z-30 h-1 ${ADMIN_CARD_TOP_BAR[accent]}`}
                      aria-hidden
                    />
                    <div
                      className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-45 blur-2xl transition duration-500 group-hover:opacity-75 sm:-right-14 sm:-top-14 sm:size-40 sm:blur-3xl ${ADMIN_CARD_GLOW[accent]}`}
                      aria-hidden
                    />
                    <button
                      type="button"
                      className={`absolute inset-0 z-0 cursor-pointer border-0 bg-transparent p-0 text-left transition duration-300 hover:bg-gradient-to-br active:bg-gradient-to-br ${ADMIN_LIST_CARD_HIT_OVERLAY[accent]}`}
                      onClick={() => router.push(`/admin/pedidos/${order.id}`)}
                      aria-label={`Abrir pedido de ${order.customerName}`}
                    />
                    <div
                      className={`pointer-events-none relative z-10 bg-gradient-to-br px-3 py-2.5 sm:px-5 sm:py-4 ${ADMIN_CARD_BODY_BG[accent]}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p
                              className={`truncate text-sm font-semibold leading-tight sm:text-base ${ADMIN_LIST_CARD_NAME[accent]}`}
                            >
                              {order.customerName}
                            </p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="mt-0.5 truncate text-[11px] tabular-nums text-zinc-600 sm:text-xs">
                            {phoneDisplay}
                          </p>
                          <p className="mt-1 text-[10px] tabular-nums text-zinc-500 sm:text-xs">
                            {when}
                          </p>
                        </div>
                        <p className="shrink-0 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/90 px-2 py-1 text-sm font-bold tabular-nums text-amber-900 shadow-inner ring-1 ring-amber-200/70 sm:px-2.5 sm:py-1.5 sm:text-base">
                          {formatMoney(total)}
                        </p>
                      </div>

                      {order.deliveryAddress ? (
                        <p
                          className={`mt-2.5 line-clamp-2 border-t pt-2.5 text-[11px] leading-snug text-zinc-600 sm:text-xs sm:leading-relaxed ${ADMIN_LIST_CARD_ADDRESS_RULE[accent]}`}
                        >
                          {order.deliveryAddress}
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={`relative z-20 flex flex-col gap-1.5 border-t px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-2.5 ${ADMIN_LIST_CARD_FOOTER[accent]}`}
                    >
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:normal-case sm:font-medium sm:tracking-normal ${ADMIN_LIST_CARD_FOOTER_LABEL[accent]}`}
                      >
                        Alterar status
                      </span>
                      <OrderStatusSelect
                        compact
                        id={`st-${order.id}`}
                        value={order.status}
                        onChange={(s) => setStatus(order.id, s as OrderStatus)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
