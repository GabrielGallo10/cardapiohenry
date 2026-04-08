"use client";

import type { OrderStatus } from "@/lib/types";
import {
  ORDER_STATUS_BADGE_STYLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SELECT_STYLES,
} from "@/lib/order-status-meta";

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

type OrderStatusSelectProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  options?: OrderStatus[];
  id?: string;
  className?: string;
  /** Lista de pedidos: menor e largura total no mobile */
  compact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
};

export function OrderStatusSelect({
  value,
  onChange,
  options,
  id,
  className = "",
  compact = false,
  onClick,
  onPointerDown,
}: OrderStatusSelectProps) {
  const style = ORDER_STATUS_SELECT_STYLES[value];
  const visibleStatuses = options?.length ? options : STATUSES;

  const wrapClass = compact
    ? "relative block w-full min-w-0 sm:inline-block sm:min-w-[200px]"
    : "relative inline-block min-w-[200px]";

  const selectClass = compact
    ? "h-9 w-full cursor-pointer appearance-none rounded-lg border-2 px-3 py-1.5 pr-8 text-xs font-semibold shadow-sm outline-none transition focus:ring-2 sm:h-11 sm:rounded-xl sm:px-4 sm:py-2 sm:pr-10 sm:text-sm"
    : "h-11 w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-2 pr-10 text-sm font-semibold shadow-sm outline-none transition focus:ring-2";

  return (
    <div className={`${wrapClass} ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        onClick={onClick}
        onPointerDown={onPointerDown}
        className={`${selectClass} ${style}`}
        aria-label="Status do pedido"
      >
        {visibleStatuses.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center opacity-70 ${compact ? "w-8 sm:w-10" : "w-10"}`}
      >
        <Chevron className={compact ? "size-4 sm:size-5" : "size-5"} />
      </span>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_BADGE_STYLES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
