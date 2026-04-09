"use client";

import { useState } from "react";
import { MenuItemPhoto } from "@/components/menu-item-photo";
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
  onCategoryCreated: (name: string) => Promise<{ ok: boolean; message?: string }>;
  onCategoryDeleted: (name: string) => Promise<{ ok: boolean; message?: string }>;
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
  onCategoryDeleted,
}: AdminProductFormProps) {
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [draftCategoryName, setDraftCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<string | null>(
    null,
  );

  const sortedCats = [...suggestedCategories].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const hasCategories = sortedCats.length > 0;
  const selectValue = sortedCats.includes(form.category) ? form.category : "";

  async function handleSaveNewCategory() {
    const name = draftCategoryName.trim();
    if (!name || savingCategory) return;
    setSavingCategory(true);
    setCategoryError(null);
    const result = await onCategoryCreated(name);
    if (!result.ok) {
      setCategoryError(result.message ?? "Nao foi possivel criar a categoria.");
      setSavingCategory(false);
      return;
    }
    setForm((f) => ({ ...f, category: name }));
    setDraftCategoryName("");
    setShowCategoryCreator(false);
    setSavingCategory(false);
  }

  async function handleDeleteSelectedCategory() {
    const name = form.category.trim();
    if (!name || savingCategory) return;
    setCategoryDeleteTarget(name);
  }

  async function confirmDeleteCategory() {
    const name = categoryDeleteTarget?.trim();
    if (!name || savingCategory) return;
    setSavingCategory(true);
    setCategoryError(null);
    const result = await onCategoryDeleted(name);
    if (!result.ok) {
      setCategoryError(result.message ?? "Nao foi possivel deletar a categoria.");
      setSavingCategory(false);
      setCategoryDeleteTarget(null);
      return;
    }
    setForm((f) => ({ ...f, category: "" }));
    setSavingCategory(false);
    setCategoryDeleteTarget(null);
  }

  return (
    <>
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
                <MenuItemPhoto
                  src={form.imageUrl}
                  alt="Pré-visualização do produto"
                  variant="form"
                />
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
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <select
                    value={selectValue}
                    required
                    disabled={!hasCategories}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({ ...f, category: v }));
                    }}
                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 sm:h-[46px] sm:px-4"
                    aria-label="Selecionar categoria"
                  >
                    <option value="">
                      {hasCategories
                        ? "Selecionar categoria..."
                        : "Nenhuma categoria cadastrada"}
                    </option>
                    {sortedCats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500"
                    aria-hidden
                  >
                    <IconChevronDown className="size-5 shrink-0" />
                  </span>
                </div>
              </div>

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
              <button
                type="button"
                onClick={() => void handleDeleteSelectedCategory()}
                disabled={!form.category.trim() || savingCategory}
                className="mt-2 w-full rounded-xl border border-red-300/90 bg-red-50/60 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Deletar categoria selecionada
              </button>
              {categoryError ? (
                <p className="mt-2 text-sm text-red-600">{categoryError}</p>
              ) : null}

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
                    onClick={() => void handleSaveNewCategory()}
                    disabled={savingCategory}
                    className="mt-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:from-yellow-400 hover:to-amber-400 disabled:opacity-60"
                  >
                    {savingCategory ? "Salvando..." : "Salvar categoria"}
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

      {categoryDeleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/45 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setCategoryDeleteTarget(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
          >
            <h2
              id="delete-category-title"
              className="text-lg font-semibold tracking-tight text-zinc-900"
            >
              Deletar categoria?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Tem certeza de que deseja deletar{" "}
              <span className="font-medium text-zinc-800">
                &quot;{categoryDeleteTarget}&quot;
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryDeleteTarget(null)}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteCategory()}
                disabled={savingCategory}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >
                {savingCategory ? "Deletando..." : "Deletar categoria"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
