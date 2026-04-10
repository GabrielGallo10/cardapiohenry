"use client";

import type { ManualFinanceEntry, MenuItem, Order, SavedAddress } from "./types";
import { orderItemsTotal } from "./order-totals";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://cardapiohenry-api.onrender.com";

/** Erro HTTP da API com status (para distinguir 401 de 500 no login, etc.). */
export class ApiHttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
  }
}

/** *.r2.dev costuma falhar (ex.: 500); servimos pelo proxy GET /storage na API. */
function normalizeStorageImageUrl(url: string): string {
  if (!url) return url;
  const base = API_BASE.replace(/\/$/, "");
  try {
    const u = new URL(url);
    if (u.hostname.endsWith(".r2.dev")) {
      return `${base}/storage${u.pathname}`;
    }
  } catch {
    /* URL relativa ou inválida */
  }
  return url;
}

function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("henry-bebidas-auth");
    if (!raw) return null;
    const s = JSON.parse(raw) as { token?: string };
    return s.token ?? null;
  } catch {
    return null;
  }
}

async function publicApiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function apiPasswordResetRequest(email: string): Promise<void> {
  await publicApiPost<{ message: string }>("/password-reset/request", {
    email: email.trim(),
  });
}

export async function apiPasswordResetVerify(
  email: string,
  code: string,
): Promise<{ reset_token: string }> {
  return publicApiPost<{ reset_token: string }>("/password-reset/verify", {
    email: email.trim(),
    code,
  });
}

export async function apiPasswordResetConfirm(
  resetToken: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  await publicApiPost<{ message: string }>("/password-reset/confirm", {
    reset_token: resetToken,
    password,
    password_confirmation: passwordConfirmation,
  });
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.auth) {
    const token = getSessionToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = (await res.text()).trim();
    throw new ApiHttpError(text || `Erro ${res.status}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type LoginApiResponse = { token: string; cargo: "admin" | "client" };

export async function apiRegister(input: {
  name: string;
  email: string;
  tel: string;
  password: string;
  password_confirmation: string;
  cargo: "client";
}) {
  await apiFetch<{ message: string }>("/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiLogin(input: { tel: string; password: string }) {
  return apiFetch<LoginApiResponse>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

type ApiCategory = { id: number; name: string };
type ApiProductList = {
  id: number;
  nome_categoria: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  url_imagem: string;
};
type ApiProductByID = {
  id_categoria: number;
  nome: string;
  preco: number;
  descricao: string;
  disponivel: boolean;
  url_imagem: string;
};

export async function apiListCategories() {
  return apiFetch<ApiCategory[]>("/categorias", { auth: true });
}

export async function apiCreateCategory(name: string) {
  await apiFetch<{ message: string }>("/categorias", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ name }),
  });
}

export async function apiDeleteCategory(id: number) {
  await apiFetch<{ message: string }>(`/categorias/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function apiListMenuItems(): Promise<MenuItem[]> {
  const list = await apiFetch<ApiProductList[]>("/produtos");

  const withDescription = await Promise.all(
    list.map(async (p) => {
      const fromList = (p.descricao || "").trim();
      if (fromList) return { id: p.id, descricao: fromList };
      try {
        const detail = await apiFetch<ApiProductByID>(`/produtos/${p.id}`);
        return { id: p.id, descricao: (detail.descricao || "").trim() };
      } catch {
        return { id: p.id, descricao: "" };
      }
    }),
  );
  const descriptionById = new Map(withDescription.map((d) => [d.id, d.descricao]));

  return list.map((p) => ({
    id: String(p.id),
    category: p.nome_categoria || "Sem categoria",
    name: p.nome,
    description: descriptionById.get(p.id) || "",
    price: Number(p.preco) || 0,
    available: !!p.disponivel,
    imageUrl: normalizeStorageImageUrl(p.url_imagem || ""),
  }));
}

async function resolveCategoryIdByName(name: string): Promise<number> {
  const target = name.trim().toLowerCase();
  let categories = await apiListCategories();
  let found = categories.find((c) => c.name.trim().toLowerCase() === target);
  if (!found) {
    await apiCreateCategory(name);
    categories = await apiListCategories();
    found = categories.find((c) => c.name.trim().toLowerCase() === target);
  }
  if (!found) throw new Error("Não foi possível resolver a categoria.");
  return found.id;
}

export async function apiUpsertMenuItem(item: MenuItem): Promise<void> {
  const idCategoria = await resolveCategoryIdByName(item.category);
  const payload = {
    id_categoria: idCategoria,
    nome: item.name,
    descricao: item.description || "",
    preco: item.price,
    disponivel: item.available,
    url_imagem: normalizeStorageImageUrl(item.imageUrl || ""),
  };
  const isNew = !/^\d+$/.test(item.id);
  if (isNew) {
    await apiFetch("/produtos", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    return;
  }
  await apiFetch(`/produtos/${item.id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteMenuItem(id: string): Promise<void> {
  await apiFetch(`/produtos/${id}`, { method: "DELETE", auth: true });
}

export async function apiUploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await apiFetch<{ url: string }>("/upload", {
    method: "POST",
    auth: true,
    body: form,
  });
  return data.url;
}

/** Alinhado ao JSON de `GET /pedidos/{id}` (PedidosByID). */
type ApiOrderList = {
  id: number;
  nome_cliente: string;
  telefone_cliente: string;
  /** Apelido do endereço (ex.: "Casa"). */
  apelido_endereco?: string | null;
  rua_endereco: string;
  numero_endereco: string;
  complemento_endereco: string;
  bairro_endereco: string;
  cidade_endereco: string;
  uf_endereco: string;
  cep_endereco: string;
  status_pedido: Order["status"];
  valor_total: number;
  metodo_pagamento?: string | null;
  forma_pagamento?: string | null;
  observacoes?: string | null;
  data_hora_pedido: string;
  created_at?: string;
  updated_at?: string;
};

type ApiOrderByID = ApiOrderList & {
  items_pedido?: { nome_produto: string; preco: number; quantidade: number }[];
  itens_pedido?: { nome_produto: string; preco: number; quantidade: number }[];
  items?: { nome_produto: string; preco: number; quantidade: number }[];
};

function fullAddress(p: {
  apelido_endereco?: string | null;
  rua_endereco?: string;
  numero_endereco?: string;
  complemento_endereco?: string;
  bairro_endereco?: string;
  cidade_endereco?: string;
  uf_endereco?: string;
  cep_endereco?: string;
}) {
  const line1 = [p.rua_endereco, p.numero_endereco].filter(Boolean).join(", ").trim();
  const label = p.apelido_endereco?.trim();
  const first =
    label && line1
      ? `${label}: ${line1}`
      : label && !line1
        ? label
        : line1;
  const parts = [
    first,
    p.complemento_endereco?.trim(),
    p.bairro_endereco?.trim(),
    [p.cidade_endereco, p.uf_endereco].filter(Boolean).join(" - ").trim(),
    p.cep_endereco?.trim(),
  ].filter((s) => !!s && s.length > 0);
  return parts.join(" | ");
}

function readMaybeString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (value && typeof value === "object") {
    const v = value as { String?: unknown; Valid?: unknown; value?: unknown };
    if (typeof v.String === "string" && (v.Valid === true || v.Valid === undefined)) {
      const trimmed = v.String.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    if (typeof v.value === "string") {
      const trimmed = v.value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
  }
  return undefined;
}

function paymentMethodFromPayload(p: Record<string, unknown>): string | undefined {
  return (
    readMaybeString(p.metodo_pagamento) ??
    readMaybeString(p.forma_pagamento) ??
    readMaybeString(p.metodoPagamento) ??
    readMaybeString(p.formaPagamento) ??
    undefined
  );
}

function toOrderFromList(p: ApiOrderList): Order {
  const paymentMethod = paymentMethodFromPayload(p as unknown as Record<string, unknown>);
  return {
    id: String(p.id),
    createdAt: p.data_hora_pedido,
    customerName: p.nome_cliente,
    customerPhone: p.telefone_cliente,
    deliveryAddress: fullAddress(p),
    notes: "",
    items: [
      {
        menuItemId: "total",
        name: "Total do pedido",
        price: Number(p.valor_total) || 0,
        quantity: 1,
      },
    ],
    status: p.status_pedido,
    paymentMethod,
  };
}

function toOrderFromDetail(p: ApiOrderByID): Order {
  const payload = p as unknown as Record<string, unknown>;
  const paymentMethod = paymentMethodFromPayload(payload);
  const detailItems =
    (Array.isArray(payload.items_pedido) && payload.items_pedido) ||
    (Array.isArray(payload.itens_pedido) && payload.itens_pedido) ||
    (Array.isArray(payload.items) && payload.items) ||
    [];
  const observacoes = readMaybeString(payload.observacoes) ?? "";
  return {
    id: String(p.id),
    createdAt: p.data_hora_pedido,
    customerName: p.nome_cliente,
    customerPhone: p.telefone_cliente,
    deliveryAddress: fullAddress(p),
    notes: observacoes,
    items: detailItems.map(
      (i: { nome_produto: string; preco: number; quantidade: number }) => ({
        menuItemId: String(i.nome_produto),
        name: i.nome_produto,
        price: Number(i.preco) || 0,
        quantity: Number(i.quantidade) || 0,
      }),
    ),
    status: p.status_pedido,
    paymentMethod,
  };
}

export async function apiListOrders(): Promise<Order[]> {
  const raw = await apiFetch<unknown>("/pedidos", { auth: true });
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as { pedidos?: unknown; data?: unknown }).pedidos ??
        (raw as { pedidos?: unknown; data?: unknown }).data ??
        [])
      : [];
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => toOrderFromList(r as ApiOrderList));
}

export async function apiGetOrderByID(id: string): Promise<Order> {
  const raw = await apiFetch<unknown>(`/pedidos/${id}`, { auth: true });
  const row =
    raw && typeof raw === "object"
      ? ((raw as { pedido?: unknown; data?: unknown }).pedido ??
        (raw as { pedido?: unknown; data?: unknown }).data ??
        raw)
      : raw;
  return toOrderFromDetail(row as ApiOrderByID);
}

export async function apiUpdateOrderStatus(id: string, status: Order["status"]) {
  await apiFetch(`/pedidos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status_pedido: status }),
  });
}

export async function apiClearOrders() {
  await apiFetch("/pedidos", { method: "DELETE", auth: true });
}

export async function apiCreateOrder(input: {
  nome_cliente: string;
  telefone_cliente: string;
  id_endereco: number;
  forma_pagamento: string;
  observacoes?: string;
  items_pedido: { id_produto: number; quantidade: number }[];
  /** Só para "Cartão na entrega": `credito` ou `debito`. */
  tipo_cartao?: string;
  /** Só para cartão: `visa` | `mastercard` | `amex` | `elo` (Amex só crédito). */
  bandeira?: string;
}) {
  await apiFetch("/pedidos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

type ApiAddress = {
  id: number;
  apelido?: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export async function apiListAddresses(): Promise<SavedAddress[]> {
  const rows = await apiFetch<ApiAddress[]>("/enderecos", { auth: true });
  return rows.map((a) => ({
    id: String(a.id),
    label: a.apelido || "",
    street: a.rua || "",
    number: a.numero || "",
    complement: a.complemento || "",
    neighborhood: a.bairro || "",
    city: a.cidade || "",
    state: a.uf || "",
    zip: a.cep || "",
  }));
}

export async function apiCreateAddress(addr: Omit<SavedAddress, "id">) {
  await apiFetch("/enderecos", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      apelido: addr.label || null,
      rua: addr.street,
      numero: addr.number,
      complemento: addr.complement || "",
      bairro: addr.neighborhood,
      cidade: addr.city,
      uf: addr.state,
      cep: addr.zip,
    }),
  });
}

export async function apiListClients(query: string) {
  const q = encodeURIComponent(query.trim());
  return apiFetch<{ nome: string; telefone: string }[]>(
    `/clientes${q ? `?pesquisa=${q}` : ""}`,
    { auth: true },
  );
}

type ApiFinance = {
  id: number;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
};

export async function apiListManualFinances(): Promise<ManualFinanceEntry[]> {
  const rows = await apiFetch<ApiFinance[]>("/financas", { auth: true });
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: r.data,
    occurredAt: r.data,
    kind: r.tipo,
    description: r.descricao,
    amount: Number(r.valor) || 0,
  }));
}

export async function apiCreateManualFinance(input: {
  kind: "entrada" | "saida";
  description: string;
  amount: number;
  occurredAt: string;
}) {
  await apiFetch("/financas", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      tipo: input.kind,
      descricao: input.description,
      valor: input.amount,
      data: input.occurredAt,
    }),
  });
}

export async function apiDeleteManualFinance(id: string) {
  await apiFetch(`/financas/${id}`, { method: "DELETE", auth: true });
}

export async function apiClearManualFinances() {
  await apiFetch("/financas", { method: "DELETE", auth: true });
}

export function totalFromOrder(order: Order): number {
  return orderItemsTotal(order.items);
}
