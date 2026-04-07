"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/types";

export function IconChevronDown({ className }: { className?: string }) {
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

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:py-3 sm:px-4";

export type AdminProductFormState = Omit<MenuItem, "id" | "imageUrl"> & {
  id?: string;
  imageUrl: string;
};

type AdminProductFormProps = {
  isNew: boolean;
  form: AdminProductFormState;
  setForm: React.Dispatch<React.SetStateAction<AdminProductFormState>>;
  suggestedCategories: string[];
  imageError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageFile: (file: File | null) => void;
  onRemoveImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCategoryCreated: (name: string) => void;
};

export function AdminProductForm({
  isNew,
  form,
  setForm,
  suggestedCategories,
  imageError,
  fileInputRef,
  onImageFile,
  onRemoveImage,
  onSubmit,
  onCancel,
  onCategoryCreated,
}: AdminProductFormProps) {
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [draftCategoryName, setDraftCategoryName] = useState("");

  const sortedCats = [...suggestedCategories].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const isPreset = sortedCats.includes(form.category);
  const selectValue = isPreset
    ? form.category
    : form.category === ""
      ? ""
      : "__other";

  function handleSaveNewCategory() {
    const name = draftCategoryName.trim();
    if (!name) return;
    onCategoryCreated(name);
    setForm((f) => ({ ...f, category: name }));
    setDraftCategoryName("");
    setShowCategoryCreator(false);
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
      <div className="border-b border-zinc-100 px-6 py-4 sm:px-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isNew ? "Novo item" : "Editar item"}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col">
        <div className="space-y-5 px-6 py-6 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600">
                Foto do produto
              </label>
              <p className="mt-1 text-xs text-zinc-500">
                Escolha a imagem primeiro; ela aparece na lista e no cardápio do
                cliente.
              </p>
              <div className="mt-3 flex flex-wrap items-start gap-4">
                <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Pré-visualização do produto"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs text-zinc-400">
                      Sem foto
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="block w-full max-w-xs text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-900 hover:file:bg-amber-200"
                    onChange={(e) =>
                      onImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {form.imageUrl ? (
                    <button
                      type="button"
                      onClick={onRemoveImage}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remover imagem
                    </button>
                  ) : null}
                  {imageError ? (
                    <p className="text-sm text-red-600">{imageError}</p>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Prefira arquivos menores que ~500KB.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600">
                Nome
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: Number(e.target.value),
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div className="flex min-w-0 flex-col">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600">
                Categoria
              </label>
              {sortedCats.length === 0 ? (
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Ex.: Bebidas"
                  required
                />
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="relative">
                    <select
                      value={selectValue}
                      required
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setForm((f) => ({ ...f, category: "" }));
                          return;
                        }
                        if (v === "__other") {
                          setForm((f) => ({
                            ...f,
                            category: sortedCats.includes(f.category)
                              ? ""
                              : f.category,
                          }));
                          return;
                        }
                        setForm((f) => ({ ...f, category: v }));
                      }}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:h-[46px] sm:px-4"
                      aria-label="Categoria existente ou outra"
                    >
                      <option value="">Selecionar categoria…</option>
                      {sortedCats.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__other">Outra categoria…</option>
                    </select>
                    <span
                      className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500"
                      aria-hidden
                    >
                      <IconChevronDown className="size-5 shrink-0" />
                    </span>
                  </div>
                  {selectValue === "__other" ? (
                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:px-4 sm:py-3"
                      placeholder="Digite o nome da categoria"
                      required
                    />
                  ) : null}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowCategoryCreator((v) => !v);
                  setDraftCategoryName("");
                }}
                className="mt-3 w-full rounded-xl border border-dashed border-amber-300/90 bg-amber-50/50 px-3 py-2 text-sm font-medium text-amber-900 transition hover:border-amber-400 hover:bg-amber-50 sm:w-auto"
              >
                {showCategoryCreator ? "Fechar" : "Criar categoria"}
              </button>

              {showCategoryCreator ? (
                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
                  <label className="text-xs font-medium text-zinc-600">
                    Nome da nova categoria
                  </label>
                  <input
                    value={draftCategoryName}
                    onChange={(e) => setDraftCategoryName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Ex.: Refrigerantes"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveNewCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewCategory}
                    className="mt-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:from-yellow-400 hover:to-amber-400"
                  >
                    Salvar categoria
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <input
                id="available"
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm((f) => ({ ...f, available: e.target.checked }))
                }
                className="size-4 rounded border-zinc-400 text-amber-600 focus:ring-amber-500/40"
              />
              <label htmlFor="available" className="text-sm text-zinc-700">
                Disponível no cardápio do cliente
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-zinc-200 bg-zinc-50/50 px-6 py-4 sm:px-8">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:from-yellow-400 hover:to-amber-400"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
