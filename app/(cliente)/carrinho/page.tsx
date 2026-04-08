"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ClientBar } from "@/components/client-bar";
import { useCart } from "@/components/cart-provider";
import {
  addressFormToSaved,
  emptyAddressForm,
  formatSavedAddress,
  isAddressFormComplete,
  type AddressFormState,
} from "@/lib/address";
import { apiCreateAddress, apiCreateOrder, apiListAddresses } from "@/lib/api";
import { formatMoney, formatPhoneForDisplay } from "@/lib/format";
import { getSession } from "@/lib/auth";
import type { SavedAddress } from "@/lib/types";

function randomAddressId(): string {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CarrinhoPage() {
  const { lines, setQuantity, removeLine, subtotal, clear, itemCount } =
    useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const router = useRouter();

  const [clientPhone, setClientPhone] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addrForm, setAddrForm] = useState<AddressFormState>(emptyAddressForm);

  const refreshAddresses = useCallback(async () => {
    const cp = getSession()?.clientPhone ?? null;
    setClientPhone(cp);
    if (cp) {
      try {
        setSavedAddresses(await apiListAddresses());
      } catch {
        setSavedAddresses([]);
      }
    } else {
      setSavedAddresses([]);
    }
  }, []);

  useEffect(() => {
    void refreshAddresses();
  }, [refreshAddresses]);

  useEffect(() => {
    const cp = getSession()?.clientPhone;
    if (!cp) return;
    setPhone(formatPhoneForDisplay(cp));
  }, []);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setSelectedAddressId("");
      return;
    }
    setSelectedAddressId((id) => {
      if (id && savedAddresses.some((a) => a.id === id)) return id;
      return savedAddresses[0].id;
    });
  }, [savedAddresses]);

  useEffect(() => {
    if (lines.length > 0) setOrderSuccess(false);
  }, [lines.length]);

  const hasSavedAddresses = clientPhone !== null && savedAddresses.length > 0;
  const showFormBlock = !clientPhone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) {
      setError("Informe nome e telefone para enviar o pedido.");
      return;
    }
    if (lines.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    let deliveryAddress = "";
    let selectedAddressNumericID = 0;
    const useSavedSelection =
      clientPhone &&
      savedAddresses.length > 0 &&
      selectedAddressId;

    if (useSavedSelection) {
      const sel = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!sel) {
        setError("Selecione um endereço de entrega.");
        return;
      }
      deliveryAddress = formatSavedAddress(sel);
      selectedAddressNumericID = Number(sel.id);
    } else {
      if (!isAddressFormComplete(addrForm)) {
        setError(
          "Preencha o endereço completo: rua, número, bairro, cidade, UF e CEP.",
        );
        return;
      }
      const built = addressFormToSaved(randomAddressId(), addrForm);
      deliveryAddress = formatSavedAddress(built);
    }

    if (!selectedAddressNumericID) {
      setError("Nao foi possivel identificar o endereco para o pedido.");
      return;
    }

    try {
      await apiCreateOrder({
        nome_cliente: n,
        telefone_cliente: p,
        id_endereco: selectedAddressNumericID,
        forma_pagamento: paymentMethod,
        observacoes: notes.trim(),
        items_pedido: lines.map((l) => ({
          id_produto: Number(l.menuItemId),
          quantidade: l.quantity,
        })),
      });
      clear();
      setName("");
      setPhone("");
      setNotes("");
      setPaymentMethod("PIX");
      setAddrForm({ ...emptyAddressForm });
      await refreshAddresses();
      setOrderSuccess(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível concluir o pedido.",
      );
    }
  }

  return (
    <div className="relative min-h-full bg-background text-zinc-900">
      <div
        className="pointer-events-none fixed inset-0 bg-grid-brand opacity-60"
        aria-hidden
      />

      <ClientBar
        title="Carrinho"
        trailing={
          <Link
            href="/cardapio"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400"
          >
            Cardápio
          </Link>
        }
      />

      <main className="relative z-10 mx-auto max-w-2xl space-y-8 px-4 py-10 pb-16">
        {orderSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-8 text-center shadow-md sm:p-12">
            <p className="text-lg font-semibold text-emerald-950">
              Pedido realizado com sucesso!
            </p>
            <p className="mt-3 text-sm leading-relaxed text-emerald-900/90">
              Você receberá o resumo e as atualizações do seu pedido pelo{" "}
              <span className="font-semibold">WhatsApp</span> no número que
              informou. Acompanhe por lá — avisaremos na separação do pedido,
              no envio para entrega e quando o pedido for concluído.
            </p>
            <Link
              href="/cardapio"
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:from-yellow-400 hover:to-amber-400"
            >
              Voltar ao cardápio
            </Link>
          </div>
        ) : lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-lg font-medium text-zinc-800">
              Seu carrinho está vazio
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Explore o cardápio e monte seu pedido.
            </p>
            <Link
              href="/cardapio"
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:from-yellow-400 hover:to-amber-400"
            >
              Ver cardápio
            </Link>
          </div>
        ) : (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Itens do pedido
            </h2>
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.menuItemId}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">{line.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatMoney(line.price)} cada
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`q-${line.menuItemId}`}>
                      Quantidade
                    </label>
                    <input
                      id={`q-${line.menuItemId}`}
                      type="number"
                      min={1}
                      max={99}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.menuItemId, Number(e.target.value) || 0)
                      }
                      className="w-16 rounded-lg border border-zinc-300 bg-white px-2 py-2 text-center text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.menuItemId)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="w-full text-right text-sm font-semibold text-amber-700 sm:w-auto">
                    {formatMoney(line.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!orderSuccess && lines.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg glow-brand">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-blue-50 to-amber-50/50 px-6 py-5">
              <p className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-zinc-600">
                  Subtotal · {itemCount}{" "}
                  {itemCount === 1 ? "item" : "itens"}
                </span>
                <span className="text-xl font-semibold text-zinc-900">
                  {formatMoney(subtotal)}
                </span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Sem pagamento no site. Ao concluir, seu pedido aparece para a
                equipe e você será avisado pelo WhatsApp com o resumo e cada
                etapa do pedido.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                >
                  Seu nome
                </label>
                <input
                  id="customer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                >
                  Telefone para contato
                </label>
                <input
                  id="customer-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                />
              </div>

              <div className="border-t border-zinc-100 pt-5">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Endereço de entrega
                </h3>
                <p className="mt-1 text-xs text-zinc-600">
                  {clientPhone
                    ? hasSavedAddresses
                      ? "Toque em um endereço abaixo ou cadastre um novo."
                      : "Nenhum endereço na conta ainda — preencha o formulário ou cadastre um para reutilizar depois."
                    : "Informe o endereço completo para entrega."}
                </p>
                {!clientPhone ? (
                  <p className="mt-2 text-xs text-amber-800">
                    Para salvar endereços no perfil, saia e entre novamente com
                    telefone e senha (sessão atual sem vínculo ao cadastro).
                  </p>
                ) : null}

                {clientPhone ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Endereços cadastrados
                    </p>
                    {savedAddresses.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                        Você ainda não tem endereços salvos nesta conta.
                      </p>
                    ) : (
                      <ul className="space-y-2" role="list">
                        {savedAddresses.map((a) => {
                          const selected =
                            selectedAddressId === a.id;
                          const body = formatSavedAddress({
                            ...a,
                            label: undefined,
                          });
                          return (
                            <li key={a.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAddressId(a.id);
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                                  selected
                                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/50"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                                }`}
                              >
                                {a.label ? (
                                  <p className="text-sm font-semibold text-zinc-900">
                                    {a.label}
                                  </p>
                                ) : null}
                                <p
                                  className={`text-sm text-zinc-700 ${a.label ? "mt-1" : ""}`}
                                >
                                  {body}
                                </p>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/enderecos/novo?next=/carrinho");
                      }}
                      className="w-full rounded-xl border-2 border-dashed border-amber-400/70 bg-amber-50/80 px-4 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
                    >
                      + Cadastrar endereço
                    </button>
                  </div>
                ) : null}

                {showFormBlock ? (
                  <div
                    id="checkout-address-fields"
                    className="mt-4 space-y-4 scroll-mt-24"
                  >
                    <div>
                      <label
                        htmlFor="addr-label"
                        className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                      >
                        Apelido (opcional)
                      </label>
                      <input
                        id="addr-label"
                        value={addrForm.label}
                        onChange={(e) =>
                          setAddrForm((f) => ({ ...f, label: e.target.value }))
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Ex.: Casa, Trabalho"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="addr-street"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          Rua / Avenida
                        </label>
                        <input
                          id="addr-street"
                          value={addrForm.street}
                          onChange={(e) =>
                            setAddrForm((f) => ({
                              ...f,
                              street: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          autoComplete="street-address"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="addr-number"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          Número
                        </label>
                        <input
                          id="addr-number"
                          value={addrForm.number}
                          onChange={(e) =>
                            setAddrForm((f) => ({
                              ...f,
                              number: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="addr-comp"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          Complemento
                        </label>
                        <input
                          id="addr-comp"
                          value={addrForm.complement}
                          onChange={(e) =>
                            setAddrForm((f) => ({
                              ...f,
                              complement: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Apto, bloco…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="addr-neigh"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          Bairro
                        </label>
                        <input
                          id="addr-neigh"
                          value={addrForm.neighborhood}
                          onChange={(e) =>
                            setAddrForm((f) => ({
                              ...f,
                              neighborhood: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="addr-city"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          Cidade
                        </label>
                        <input
                          id="addr-city"
                          value={addrForm.city}
                          onChange={(e) =>
                            setAddrForm((f) => ({ ...f, city: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="addr-state"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          UF
                        </label>
                        <input
                          id="addr-state"
                          value={addrForm.state}
                          onChange={(e) =>
                            setAddrForm((f) => ({
                              ...f,
                              state: e.target.value.slice(0, 2).toUpperCase(),
                            }))
                          }
                          maxLength={2}
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="SP"
                          autoComplete="address-level1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="addr-zip"
                          className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                        >
                          CEP
                        </label>
                        <input
                          id="addr-zip"
                          value={addrForm.zip}
                          onChange={(e) =>
                            setAddrForm((f) => ({ ...f, zip: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="00000-000"
                          autoComplete="postal-code"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="payment-method"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                >
                  Forma de pagamento
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro na entrega">Dinheiro na entrega</option>
                  <option value="Cartão na entrega">Cartão na entrega</option>
                  <option value="A combinar">A combinar</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
                >
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-4 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400"
              >
                Concluir pedido
              </button>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
}
