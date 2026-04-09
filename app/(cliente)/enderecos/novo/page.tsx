"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClientBar } from "@/components/client-bar";
import { getSession } from "@/lib/auth";
import { emptyAddressForm, isAddressFormComplete } from "@/lib/address";
import { apiCreateAddress } from "@/lib/api";

export default function NovoEnderecoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ ...emptyAddressForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backTo = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/carrinho";
  }, [searchParams]);

  useEffect(() => {
    const s = getSession();
    if (s?.role !== "client") {
      router.replace(`/login?next=${encodeURIComponent(`/enderecos/novo?next=${backTo}`)}`);
    }
  }, [backTo, router]);

  function handleStateChange(value: string) {
    const onlyLetters = value.replace(/[^a-zA-Z]/g, "");
    setForm((p) => ({
      ...p,
      state: onlyLetters.slice(0, 2).toUpperCase(),
    }));
  }

  function handleZipChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const masked =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setForm((p) => ({ ...p, zip: masked }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!isAddressFormComplete(form)) {
      setError("Preencha os campos obrigatorios do endereco.");
      return;
    }
    try {
      setSaving(true);
      await apiCreateAddress({
        label: form.label.trim() || undefined,
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim() || undefined,
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
      });
      router.push(backTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar endereco.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative min-h-full bg-background text-zinc-900">
      <div
        className="pointer-events-none fixed inset-0 bg-grid-brand opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed top-0 left-1/2 h-72 w-[min(100%,640px)] -translate-x-1/2 bg-amber-200/40 blur-[80px]"
        aria-hidden
      />

      <ClientBar
        title="Novo endereço"
        trailing={
          <Link
            href={backTo}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400"
          >
            Carrinho
          </Link>
        }
      />

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-10 pb-16">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg glow-brand">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-blue-50 to-amber-50/50 px-6 py-5">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              Cadastrar endereço de entrega
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Salve um endereço para usar no checkout sem precisar preencher tudo
              novamente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <label
                htmlFor="addr-label"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-blue-700"
              >
                Apelido
              </label>
              <input
                id="addr-label"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Ex.: Casa, Trabalho"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Endereço
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px]">
                <div>
                  <label
                    htmlFor="addr-street"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    Rua*
                  </label>
                  <input
                    id="addr-street"
                    required
                    value={form.street}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, street: e.target.value }))
                    }
                    placeholder="Nome da rua"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-number"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    Número*
                  </label>
                  <input
                    id="addr-number"
                    required
                    value={form.number}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, number: e.target.value }))
                    }
                    placeholder="123"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label
                  htmlFor="addr-comp"
                  className="mb-1 block text-xs font-medium text-zinc-700"
                >
                  Complemento
                </label>
                <input
                  id="addr-comp"
                  value={form.complement}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, complement: e.target.value }))
                  }
                  placeholder="Apto, bloco, referência..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-700">
                Localização
              </p>
              <p className="mb-3 text-xs text-zinc-600">
                Preencha com atenção: esses dados são usados para entrega.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="addr-neighborhood"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    Bairro*
                  </label>
                  <input
                    id="addr-neighborhood"
                    required
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, neighborhood: e.target.value }))
                    }
                    placeholder="Seu bairro"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-city"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    Cidade*
                  </label>
                  <input
                    id="addr-city"
                    required
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="Sua cidade"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
                <div>
                  <label
                    htmlFor="addr-state"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    UF*
                  </label>
                  <input
                    id="addr-state"
                    required
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    placeholder="SP"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm uppercase text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-zip"
                    className="mb-1 block text-xs font-medium text-zinc-700"
                  >
                    CEP*
                  </label>
                  <input
                    id="addr-zip"
                    required
                    value={form.zip}
                    onChange={(e) => handleZipChange(e.target.value)}
                    placeholder="00000-000"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={backTo}
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
              >
                Voltar ao carrinho
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar endereco"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
