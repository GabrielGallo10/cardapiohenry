"use client";

import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useManualFinance } from "@/hooks/use-manual-finance";
import { downloadFinancePdf } from "@/lib/export-finance-pdf";
import { formatMoney } from "@/lib/format";
import { orderItemsTotal } from "@/lib/order-totals";
import type { ManualFinanceKind, Order } from "@/lib/types";

type FinanceDisplayRow = {
  key: string;
  source: "pedido" | "manual";
  occurredAt: string;
  description: string;
  amount: number;
  manualId?: string;
};

function formatDateLabel(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function orderToEntradaRow(order: Order): FinanceDisplayRow {
  return {
    key: `pedido-${order.id}`,
    source: "pedido",
    occurredAt: order.createdAt,
    description: `Pedido concluído — ${order.customerName}`,
    amount: orderItemsTotal(order.items),
  };
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function sortByDateDesc(a: FinanceDisplayRow, b: FinanceDisplayRow) {
  return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
}

export default function AdminFinancasPage() {
  const { orders } = useOrders();
  const { entries, add, remove } = useManualFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [formKind, setFormKind] = useState<ManualFinanceKind>("entrada");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const entradas = useMemo(() => {
    const fromOrders = orders
      .filter((o) => o.status === "concluido")
      .map(orderToEntradaRow);
    const manual = entries
      .filter((e) => e.kind === "entrada")
      .map(
        (e): FinanceDisplayRow => ({
          key: `manual-${e.id}`,
          source: "manual",
          occurredAt: e.occurredAt,
          description: e.description,
          amount: e.amount,
          manualId: e.id,
        }),
      );
    return [...fromOrders, ...manual].sort(sortByDateDesc);
  }, [orders, entries]);

  const saidas = useMemo(() => {
    return entries
      .filter((e) => e.kind === "saida")
      .map(
        (e): FinanceDisplayRow => ({
          key: `manual-${e.id}`,
          source: "manual",
          occurredAt: e.occurredAt,
          description: e.description,
          amount: e.amount,
          manualId: e.id,
        }),
      )
      .sort(sortByDateDesc);
  }, [entries]);

  const totalEntradas = useMemo(
    () => entradas.reduce((s, r) => s + r.amount, 0),
    [entradas],
  );
  const totalSaidas = useMemo(
    () => saidas.reduce((s, r) => s + r.amount, 0),
    [saidas],
  );
  const saldo = totalEntradas - totalSaidas;

  function openModal() {
    setFormKind("entrada");
    setFormDesc("");
    setFormAmount("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(formAmount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const occurredAt = new Date(formDate + "T12:00:00").toISOString();
    add({
      kind: formKind,
      description: formDesc,
      amount,
      occurredAt,
    });
    closeModal();
  }

  async function handleExportPdf() {
    setPdfLoading(true);
    try {
      const rowToPdf = (r: FinanceDisplayRow) => ({
        dateLabel: formatDateLabel(r.occurredAt),
        description: r.description,
        amountLabel: formatMoney(r.amount),
        sourceLabel: r.source === "pedido" ? "Pedido" : "Manual",
      });
      const emptyPlaceholder = [
        {
          dateLabel: "—",
          description: "Nenhum lançamento",
          amountLabel: "—",
          sourceLabel: "—",
        },
      ];
      const now = new Date();
      const fileBase = `financas-cardapio-henry-${now.toISOString().slice(0, 10)}`;
      await downloadFinancePdf({
        title: "Finanças — Cardápio Henry",
        generatedAtLabel: `Gerado em ${now.toLocaleString("pt-BR")}`,
        entradas:
          entradas.length > 0 ? entradas.map(rowToPdf) : emptyPlaceholder,
        saidas: saidas.length > 0 ? saidas.map(rowToPdf) : emptyPlaceholder,
        totalEntradasLabel: formatMoney(totalEntradas),
        totalSaidasLabel: formatMoney(totalSaidas),
        saldoLabel: formatMoney(saldo),
        fileBaseName: fileBase,
      });
    } finally {
      setPdfLoading(false);
    }
  }

  const thClass =
    "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 sm:px-4";
  const tdClass =
    "px-3 py-3 text-sm text-zinc-800 sm:px-4 border-t border-zinc-100";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Finanças
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Pedidos <strong>concluídos</strong> entram automaticamente nas
            entradas. Use o botão + para registrar recebimentos extras ou
            despesas.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-100 sm:whitespace-nowrap"
          >
            <span className="text-lg leading-none" aria-hidden>
              +
            </span>
            Novo lançamento
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={pdfLoading}
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:opacity-50 sm:whitespace-nowrap"
          >
            {pdfLoading ? "Gerando PDF…" : "Exportar PDF"}
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700/75">
            Total entradas
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-blue-950">
            {formatMoney(totalEntradas)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700/80">
            Total saídas
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-amber-950">
            {formatMoney(totalSaidas)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Saldo (entradas − saídas)
          </p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${saldo >= 0 ? "text-zinc-900" : "text-zinc-900"}`}
          >
            {formatMoney(saldo)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-blue-50/55 px-4 py-3">
            <h2 className="text-sm font-semibold text-blue-900">Entradas</h2>
            <p className="text-xs text-blue-700/80">
              Pedidos concluídos + recebimentos manuais
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left">
              <thead>
                <tr className="bg-blue-50/80">
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Descrição</th>
                  <th className={`${thClass} text-right`}>Valor</th>
                  <th className={`${thClass} w-12 sm:w-14`} aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {entradas.length === 0 ? (
                  <tr>
                    <td
                      className={`${tdClass} text-zinc-500`}
                      colSpan={4}
                    >
                      Nenhuma entrada ainda.
                    </td>
                  </tr>
                ) : (
                  entradas.map((row) => (
                    <tr key={row.key} className="hover:bg-zinc-50">
                      <td className={`${tdClass} whitespace-nowrap tabular-nums text-zinc-600`}>
                        {formatDateLabel(row.occurredAt)}
                      </td>
                      <td className={tdClass}>
                        <span className="font-medium text-zinc-900">
                          {row.description}
                        </span>
                        {row.source === "pedido" ? (
                          <span className="ml-2 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-800">
                            Pedido
                          </span>
                        ) : (
                          <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                            Manual
                          </span>
                        )}
                      </td>
                      <td
                        className={`${tdClass} text-right font-semibold tabular-nums text-zinc-900`}
                      >
                        {formatMoney(row.amount)}
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {row.source === "manual" && row.manualId ? (
                          <button
                            type="button"
                            onClick={() => remove(row.manualId!)}
                            className="inline-flex rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            aria-label="Remover lançamento"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-amber-100 bg-amber-50/55 px-4 py-3">
            <h2 className="text-sm font-semibold text-amber-900">Saídas</h2>
            <p className="text-xs text-amber-700/80">
              Despesas registradas manualmente
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left">
              <thead>
                <tr className="bg-amber-50/80">
                  <th className={thClass}>Data</th>
                  <th className={thClass}>Descrição</th>
                  <th className={`${thClass} text-right`}>Valor</th>
                  <th className={`${thClass} w-12 sm:w-14`} aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {saidas.length === 0 ? (
                  <tr>
                    <td
                      className={`${tdClass} text-zinc-500`}
                      colSpan={4}
                    >
                      Nenhuma saída registrada.
                    </td>
                  </tr>
                ) : (
                  saidas.map((row) => (
                    <tr key={row.key} className="hover:bg-zinc-50">
                      <td className={`${tdClass} whitespace-nowrap tabular-nums text-zinc-600`}>
                        {formatDateLabel(row.occurredAt)}
                      </td>
                      <td className={tdClass}>
                        <span className="font-medium text-zinc-900">
                          {row.description}
                        </span>
                      </td>
                      <td
                        className={`${tdClass} text-right font-semibold tabular-nums text-zinc-900`}
                      >
                        {formatMoney(row.amount)}
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {row.manualId ? (
                          <button
                            type="button"
                            onClick={() => remove(row.manualId!)}
                            className="inline-flex rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            aria-label="Remover lançamento"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/45 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="finance-modal-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
          >
            <h2
              id="finance-modal-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Novo lançamento
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Escolha se é um recebimento (entrada) ou uma despesa (saída).
            </p>
            <form onSubmit={submitManual} className="mt-5 space-y-4">
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Tipo
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="entrada"
                      checked={formKind === "entrada"}
                      onChange={() => setFormKind("entrada")}
                      className="sr-only"
                    />
                    <span
                      className={`block rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition ${
                        formKind === "entrada"
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      Recebimento
                      <span className="mt-0.5 block text-[10px] font-normal text-zinc-500">
                        Entrada
                      </span>
                    </span>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="saida"
                      checked={formKind === "saida"}
                      onChange={() => setFormKind("saida")}
                      className="sr-only"
                    />
                    <span
                      className={`block rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition ${
                        formKind === "saida"
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      Despesa
                      <span className="mt-0.5 block text-[10px] font-normal text-zinc-500">
                        Saída
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
              <div>
                <label
                  htmlFor="fin-desc"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  Descrição
                </label>
                <input
                  id="fin-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Ex.: Compra de embalagens"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="fin-amount"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    Valor (R$)
                  </label>
                  <input
                    id="fin-amount"
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    step={0.01}
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fin-date"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    Data
                  </label>
                  <input
                    id="fin-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
