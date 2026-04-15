"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  OrderStatusBadge,
  OrderStatusSelect,
} from "@/components/order-status-select";
import { useOrders } from "@/hooks/use-orders";
import { apiGetOrderByID } from "@/lib/api";
import {
  formatMoney,
  formatPaymentMethodLabel,
  formatPhoneForDisplay,
} from "@/lib/format";
import { allowedStatusOptions } from "@/lib/order-status-flow";
import type { OrderStatus } from "@/lib/types";
import type { AdminCardAccent } from "@/lib/admin-card-accents";
import { useAdminUnseenPedidos } from "@/components/admin-order-notification-provider";
import {
  ADMIN_CARD_BODY_BG,
  ADMIN_CARD_GLOW,
  ADMIN_CARD_SECTION_HEADER,
  ADMIN_CARD_SECTION_TITLE,
  ADMIN_CARD_TOP_BAR,
  ADMIN_DETAIL_FIELD_LABEL,
  ADMIN_DETAIL_FIELD_NAME,
  ADMIN_DETAIL_FIELD_TILE,
  ADMIN_DETAIL_NOTE_BOX,
  ADMIN_DETAIL_TABLE_DIVIDE,
  ADMIN_DETAIL_TABLE_HEAD,
  ADMIN_DETAIL_TABLE_ROW_HOVER,
  ADMIN_DETAIL_TABLE_TH,
  ADMIN_DETAIL_TABLE_WRAP,
  ADMIN_DETAIL_TOTAL_LABEL,
  ADMIN_DETAIL_TOTAL_RULE,
  adminAccentFromIndex,
} from "@/lib/admin-card-accents";

function orderTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function SurfaceCard({
  title,
  children,
  bodyClassName = "px-5 py-5 sm:px-6 sm:py-6",
  accent,
}: {
  title?: string;
  children: ReactNode;
  /** e.g. p-0 when wrapping a full-bleed table */
  bodyClassName?: string;
  accent: AdminCardAccent;
}) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-100/80 sm:rounded-3xl">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-30 h-1 ${ADMIN_CARD_TOP_BAR[accent]}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-14 -top-14 size-44 rounded-full opacity-45 blur-3xl transition duration-500 group-hover:opacity-[0.68] sm:size-52 ${ADMIN_CARD_GLOW[accent]}`}
        aria-hidden
      />
      {title ? (
        <header
          className={`relative z-10 border-b px-5 py-3.5 sm:px-6 ${ADMIN_CARD_SECTION_HEADER[accent]}`}
        >
          <h2
            className={`text-xs font-semibold uppercase tracking-wider ${ADMIN_CARD_SECTION_TITLE[accent]}`}
          >
            {title}
          </h2>
        </header>
      ) : null}
      <div
        className={`relative z-10 bg-gradient-to-br ${ADMIN_CARD_BODY_BG[accent]} ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export default function AdminPedidoDetalhePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { markPedidoDetalheAberto } = useAdminUnseenPedidos();
  const { orders, setStatus } = useOrders();

  const orderFromList = useMemo(
    () => orders.find((o) => o.id === id),
    [orders, id],
  );
  const [order, setOrder] = useState(orderFromList ?? null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderFromList) return;
    setOrder((prev) => {
      if (!prev) return orderFromList;
      const prevHasRealItems = prev.items.some((item) => item.menuItemId !== "total");
      const prevHasPayment = !!prev.paymentMethod?.trim();
      if (prevHasRealItems || prevHasPayment) return prev;
      return orderFromList;
    });
  }, [orderFromList]);

  useEffect(() => {
    if (!id) return;
    markPedidoDetalheAberto(id);
  }, [id, markPedidoDetalheAberto]);

  useEffect(() => {
    if (!id) return;
    setDetailError(null);
    void apiGetOrderByID(id)
      .then((full) => setOrder(full))
      .catch((err) =>
        setDetailError(
          err instanceof Error
            ? err.message
            : "Falha ao carregar detalhes completos do pedido.",
        ),
      );
  }, [id]);

  if (!id) {
    return null;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-800 transition hover:bg-blue-50/80 hover:text-blue-950"
        >
          ← Voltar aos pedidos
        </Link>
        <SurfaceCard
          accent={adminAccentFromIndex(0)}
          bodyClassName="px-5 py-12 text-center sm:px-6 sm:py-14"
        >
          <p className="text-sm font-medium text-zinc-700">
            Pedido não encontrado.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Ele pode ter sido removido ou o link está incorreto.
          </p>
        </SurfaceCard>
      </div>
    );
  }

  const total =
    typeof order.totalAmount === "number" && order.totalAmount > 0
      ? order.totalAmount
      : orderTotal(order.items);
  const d = new Date(order.createdAt);
  const dateStr = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const phoneDigits = order.customerPhone.replace(/\D/g, "");
  const phoneDisplay =
    phoneDigits.length >= 10
      ? formatPhoneForDisplay(phoneDigits)
      : order.customerPhone;

  const acc = {
    hero: adminAccentFromIndex(0),
    status: adminAccentFromIndex(1),
    cliente: adminAccentFromIndex(2),
    itens: adminAccentFromIndex(3),
    obs: adminAccentFromIndex(4),
  } as const;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-8 sm:space-y-8">
      <SurfaceCard accent={acc.hero} bodyClassName="px-5 py-6 sm:px-7 sm:py-7">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-800 transition hover:bg-blue-50/90 hover:text-blue-950"
        >
          ← Voltar aos pedidos
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <h1
            className={`text-2xl font-semibold tracking-tight sm:text-3xl ${ADMIN_DETAIL_FIELD_NAME[acc.hero]}`}
          >
            Detalhes do pedido
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p
          className={`mt-3 text-sm ${acc.hero === "blue" ? "text-blue-900/45" : "text-amber-900/42"}`}
        >
          <span className="text-zinc-500">Registrado em</span>{" "}
          <span className="font-medium text-zinc-700">{dateStr}</span>
          <span className="text-zinc-500"> às </span>
          <span className="tabular-nums font-medium text-zinc-700">
            {timeStr}
          </span>
        </p>
        {detailError ? (
          <p className="mt-3 text-xs font-medium text-red-700">
            Não foi possível carregar todos os detalhes do pedido: {detailError}
          </p>
        ) : null}
      </SurfaceCard>

      <SurfaceCard accent={acc.status} title="Alterar status">
        <div className="w-full max-w-md sm:max-w-none">
          <OrderStatusSelect
            value={order.status}
            options={allowedStatusOptions(order.status)}
            onChange={(s) => setStatus(order.id, s as OrderStatus)}
            className="block w-full min-w-0 sm:inline-block sm:min-w-[280px]"
          />
        </div>
      </SurfaceCard>

      <SurfaceCard accent={acc.cliente} title="Cliente e entrega">
        <dl className="grid gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
          <div
            className={`rounded-xl border px-4 py-3 shadow-sm ring-1 ${ADMIN_DETAIL_FIELD_TILE[acc.cliente]}`}
          >
            <dt
              className={`text-[11px] font-semibold uppercase tracking-wide ${ADMIN_DETAIL_FIELD_LABEL[acc.cliente]}`}
            >
              Nome
            </dt>
            <dd
              className={`mt-1.5 font-semibold ${ADMIN_DETAIL_FIELD_NAME[acc.cliente]}`}
            >
              {order.customerName}
            </dd>
          </div>
          <div
            className={`rounded-xl border px-4 py-3 shadow-sm ring-1 ${ADMIN_DETAIL_FIELD_TILE[acc.cliente]}`}
          >
            <dt
              className={`text-[11px] font-semibold uppercase tracking-wide ${ADMIN_DETAIL_FIELD_LABEL[acc.cliente]}`}
            >
              Telefone
            </dt>
            <dd className="mt-1.5 tabular-nums font-medium text-zinc-800">
              {phoneDisplay}
            </dd>
          </div>
          <div
            className={`rounded-xl border px-4 py-3 shadow-sm ring-1 sm:col-span-2 ${ADMIN_DETAIL_FIELD_TILE[acc.cliente]}`}
          >
            <dt
              className={`text-[11px] font-semibold uppercase tracking-wide ${ADMIN_DETAIL_FIELD_LABEL[acc.cliente]}`}
            >
              Endereço de entrega
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-zinc-800">
              {order.deliveryAddress ?? "—"}
            </dd>
          </div>
          <div className="rounded-xl border border-amber-100/70 bg-gradient-to-br from-amber-50/50 to-white px-4 py-3 shadow-sm ring-1 ring-amber-100/40 sm:col-span-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/55">
              Forma de pagamento
            </dt>
            <dd className="mt-1.5 font-semibold text-zinc-900">
              {order.paymentMethod?.trim()
                ? formatPaymentMethodLabel(order.paymentMethod)
                : "Não informado"}
            </dd>
          </div>
        </dl>
      </SurfaceCard>

      <SurfaceCard
        accent={acc.itens}
        title="Itens do pedido"
        bodyClassName="px-5 pb-5 pt-1 sm:px-6 sm:pb-6"
      >
        <div
          className={`mt-3 overflow-hidden rounded-xl border bg-white/90 shadow-inner ring-1 ${ADMIN_DETAIL_TABLE_WRAP[acc.itens]}`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className={`border-b text-left ${ADMIN_DETAIL_TABLE_HEAD[acc.itens]}`}
              >
                <th
                  className={`px-4 py-3.5 text-xs font-semibold ${ADMIN_DETAIL_TABLE_TH[acc.itens]}`}
                >
                  Item
                </th>
                <th
                  className={`px-4 py-3.5 text-xs font-semibold ${ADMIN_DETAIL_TABLE_TH[acc.itens]}`}
                >
                  Qtd.
                </th>
                <th
                  className={`px-4 py-3.5 text-right text-xs font-semibold ${ADMIN_DETAIL_TABLE_TH[acc.itens]}`}
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${ADMIN_DETAIL_TABLE_DIVIDE[acc.itens]}`}
            >
              {order.items.map((line, idx) => (
                <tr
                  key={`${order.id}-${idx}-${line.menuItemId}`}
                  className={`transition-colors ${ADMIN_DETAIL_TABLE_ROW_HOVER[acc.itens]}`}
                >
                  <td className="px-4 py-3.5 font-medium text-zinc-900">
                    {line.name}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-zinc-700">
                    {line.quantity}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-medium text-zinc-800">
                    {formatMoney(line.price * line.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className={`mt-5 flex items-center justify-between gap-4 border-t pt-5 ${ADMIN_DETAIL_TOTAL_RULE[acc.itens]}`}
        >
          <span
            className={`text-base font-semibold ${ADMIN_DETAIL_TOTAL_LABEL[acc.itens]}`}
          >
            Total
          </span>
          <span className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/90 px-4 py-2 text-xl font-bold tabular-nums text-amber-950 shadow-inner ring-1 ring-amber-200/70">
            {formatMoney(total)}
          </span>
        </div>
      </SurfaceCard>

      <SurfaceCard accent={acc.obs} title="Observações">
        <div
          className={`rounded-xl border border-dashed px-4 py-4 sm:px-5 sm:py-5 ${ADMIN_DETAIL_NOTE_BOX[acc.obs]}`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
            {order.notes?.trim() ? (
              order.notes
            ) : (
              <span className="text-zinc-500 italic">Nenhuma observação.</span>
            )}
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}
