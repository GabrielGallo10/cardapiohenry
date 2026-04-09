"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdminProductForm,
  type AdminProductFormState,
} from "@/components/admin-product-form";
import { MenuItemPhoto } from "@/components/menu-item-photo";
import { useMenu } from "@/hooks/use-menu";
import {
  ApiHttpError,
  apiCreateCategory,
  apiDeleteCategory,
  apiListCategories,
  apiUploadImage,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** ~550KB em base64 — localStorage tem limite prático; use JPEG comprimido. */
const MAX_IMAGE_DATA_URL_CHARS = 700_000;

function IconPencil({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
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

const emptyForm: AdminProductFormState = {
  name: "",
  description: "",
  price: 0,
  category: "",
  available: true,
  imageUrl: "",
};

export default function AdminCardapioPage() {
  const { items, upsert, remove } = useMenu();
  const [editing, setEditing] = useState<
    (MenuItem & { isNew?: boolean }) | null
  >(null);
  const [form, setForm] = useState<AdminProductFormState>(emptyForm);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    void apiListCategories()
      .then((rows) => {
        setCategories(rows.map((c) => c.name).filter(Boolean));
      })
      .catch(() => {
        setCategories([]);
        setFeedback({
          type: "error",
          text: "Nao foi possivel carregar as categorias.",
        });
      });
  }, []);

  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [deleteTarget]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [items],
  );

  const suggestedCategories = useMemo(() => {
    const s = new Set<string>();
    for (const c of categories) {
      const name = c.trim();
      if (name) s.add(name);
    }
    for (const i of items) {
      const c = i.category.trim();
      if (c) s.add(c);
    }
    return Array.from(s);
  }, [items, categories]);

  function openNew() {
    setFeedback(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditing({ ...emptyForm, id: "", isNew: true } as MenuItem & {
      isNew: boolean;
    });
    setForm({ ...emptyForm });
  }

  function openEdit(item: MenuItem) {
    setFeedback(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditing({ ...item, isNew: false });
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      imageUrl: item.imageUrl ?? "",
    });
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImageFile(file: File | null) {
    setImageError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Escolha um arquivo de imagem (JPG, PNG, WebP ou GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_DATA_URL_CHARS) {
      setImageError(
        "Imagem grande demais. Reduza o tamanho (ex.: ~800px) antes do upload.",
      );
      return;
    }
    setUploadingImage(true);
    try {
      const uploadedUrl = await apiUploadImage(file);
      setForm((f) => ({ ...f, imageUrl: uploadedUrl }));
    } catch (e) {
      setImageError(
        e instanceof Error
          ? `Falha no upload para R2: ${e.message}`
          : "Falha no upload para R2.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function handleRemoveImage() {
    setForm((f) => ({ ...f, imageUrl: "" }));
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const name = form.name.trim();
    const category = form.category.trim();
    if (!name || !category) return;
    const id =
      editing?.isNew || !form.id
        ? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        : form.id;
    const trimmedUrl = form.imageUrl.trim();
    try {
      await upsert({
        id,
        name,
        description: form.description.trim(),
        price: Number(form.price) || 0,
        category,
        available: form.available,
        ...(trimmedUrl ? { imageUrl: trimmedUrl } : {}),
      });
      setFeedback({
        type: "success",
        text: editing?.isNew ? "Produto criado com sucesso." : "Produto atualizado com sucesso.",
      });
      closeForm();
    } catch (e) {
      if (e instanceof ApiHttpError) {
        if (e.status === 401) {
          setFeedback({
            type: "error",
            text: "Sua sessao expirou. Faca login novamente.",
          });
          return;
        }
        if (e.status === 409) {
          setFeedback({
            type: "error",
            text: "Conflito ao salvar produto. Revise os dados e tente novamente.",
          });
          return;
        }
      }
      setFeedback({
        type: "error",
        text: "Nao foi possivel salvar o produto. Tente novamente.",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10">
      <header className="space-y-3">
        {feedback ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}
        {editing ? (
          <button
            type="button"
            onClick={closeForm}
            className="inline-flex items-center gap-2 rounded-lg px-0 py-1 text-left text-sm font-medium text-amber-800 transition hover:text-amber-950"
          >
            ← Voltar à lista
          </button>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Itens do cardápio
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Gerencie produtos, preços, fotos e categorias — o que você define
              aqui é o que o cliente vê no cardápio.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={openNew}
              className="shrink-0 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400"
            >
              Novo item
            </button>
          ) : null}
        </div>
      </header>

      {editing ? (
        <AdminProductForm
          isNew={!!editing.isNew}
          form={form}
          setForm={setForm}
          suggestedCategories={suggestedCategories}
          imageError={imageError}
          fileInputRef={fileInputRef}
          onImageFile={(file) => void handleImageFile(file)}
          onRemoveImage={handleRemoveImage}
          onSubmit={(e) => void handleSave(e)}
          onCancel={closeForm}
          onCategoryCreated={async (name) => {
            try {
              await apiCreateCategory(name);
              const rows = await apiListCategories();
              setCategories(rows.map((c) => c.name).filter(Boolean));
              return { ok: true };
            } catch (e) {
              if (e instanceof ApiHttpError) {
                if (e.status === 401) {
                  return {
                    ok: false,
                    message: "Sua sessao expirou. Faca login novamente.",
                  };
                }
                if (e.status === 409) {
                  return { ok: false, message: "Essa categoria ja existe." };
                }
              }
              return { ok: false, message: "Nao foi possivel criar a categoria." };
            }
          }}
          onCategoryDeleted={async (name) => {
            try {
              const rows = await apiListCategories();
              const target = rows.find(
                (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase(),
              );
              if (!target) {
                return { ok: false, message: "Categoria nao encontrada." };
              }
              await apiDeleteCategory(target.id);
              const updated = await apiListCategories();
              setCategories(updated.map((c) => c.name).filter(Boolean));
              return { ok: true };
            } catch (e) {
              if (e instanceof ApiHttpError && e.status === 409) {
                return {
                  ok: false,
                  message: "Essa categoria possui produtos vinculados.",
                };
              }
              if (e instanceof ApiHttpError && e.status === 401) {
                return {
                  ok: false,
                  message: "Sua sessao expirou. Faca login novamente.",
                };
              }
              return { ok: false, message: "Nao foi possivel remover a categoria." };
            }
          }}
        />
      ) : null}
      {uploadingImage ? (
        <p className="text-sm text-blue-700">Enviando imagem para o R2...</p>
      ) : null}

      {!editing ? (
        <ul className="space-y-3">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm sm:gap-4 sm:px-5 sm:py-4"
            >
              <MenuItemPhoto
                src={item.imageUrl}
                alt={item.name}
                variant="list"
              />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate font-semibold text-zinc-900">
                  {item.name}
                </p>
                <p
                  className="mt-1 truncate text-xs text-zinc-600"
                  title={item.category}
                >
                  {item.category}
                  {!item.available ? (
                    <span className="ml-2 font-medium text-amber-700">
                      Indisponível
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm font-medium text-amber-700">
                  {formatMoney(item.price)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-amber-400 bg-amber-50 text-amber-900 transition hover:bg-amber-100 md:size-auto md:gap-2 md:px-4 md:py-2"
                  aria-label={`Editar ${item.name}`}
                >
                  <IconPencil className="size-4.5 md:size-4" />
                  <span className="hidden text-sm font-medium md:inline">
                    Editar
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ id: item.id, name: item.name })
                  }
                  className="inline-flex size-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 md:size-auto md:gap-2 md:px-4 md:py-2"
                  aria-label={`Excluir ${item.name}`}
                >
                  <IconTrash className="size-4.5 md:size-4" />
                  <span className="hidden text-sm font-medium md:inline">
                    Excluir
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/45 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setDeleteTarget(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
          >
            <h2
              id="delete-product-title"
              className="text-lg font-semibold tracking-tight text-zinc-900"
            >
              Excluir produto?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Tem certeza de que deseja remover{" "}
              <span className="font-medium text-zinc-800">
                “{deleteTarget.name}”
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deletingProduct) return;
                  setDeletingProduct(true);
                  setFeedback(null);
                  try {
                    await remove(deleteTarget.id);
                    setDeleteTarget(null);
                    setFeedback({ type: "success", text: "Produto excluido com sucesso." });
                  } catch (e) {
                    if (e instanceof ApiHttpError && e.status === 401) {
                      setFeedback({
                        type: "error",
                        text: "Sua sessao expirou. Faca login novamente.",
                      });
                    } else {
                      setFeedback({
                        type: "error",
                        text: "Nao foi possivel excluir o produto. Tente novamente.",
                      });
                    }
                  } finally {
                    setDeletingProduct(false);
                  }
                }}
                disabled={deletingProduct}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingProduct ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
