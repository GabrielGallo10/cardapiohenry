import type { UserRole } from "./types";
import { apiLogin, apiRegister } from "./api";

export type { UserRole } from "./types";

const AUTH_KEY = "henry-bebidas-auth";

export type AuthSession = {
  role: UserRole;
  token: string;
  /** Telefone normalizado; presente quando o cliente está logado. */
  clientPhone?: string;
};

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as {
      role?: UserRole;
      token?: string;
      clientPhone?: string;
    };
    if (j.role !== "admin" && j.role !== "client") return null;
    if (!j.token) return null;
    return {
      role: j.role,
      token: j.token,
      clientPhone:
        j.role === "client" && j.clientPhone
          ? normalizePhone(j.clientPhone)
          : undefined,
    };
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  const payload: AuthSession = {
    role: session.role,
    token: session.token,
    ...(session.role === "client" && session.clientPhone
      ? { clientPhone: normalizePhone(session.clientPhone) }
      : {}),
  };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export async function loginWithPhonePassword(
  phone: string,
  password: string,
): Promise<AuthSession | null> {
  try {
    const data = await apiLogin({ tel: normalizePhone(phone), password });
    return {
      role: data.cargo,
      token: data.token,
      clientPhone: data.cargo === "client" ? normalizePhone(phone) : undefined,
    };
  } catch {
    return null;
  }
}

export async function registerClient(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await apiRegister({
      name: params.name.trim(),
      email: params.email.trim(),
      tel: normalizePhone(params.phone),
      password: params.password,
      password_confirmation: params.password,
      cargo: "client",
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Falha ao cadastrar.",
    };
  }
}

export function defaultPathForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : "/cardapio";
}

export function resolveRedirectAfterLogin(
  role: UserRole,
  next: string,
): string {
  const fallback = defaultPathForRole(role);
  if (!next || next === "/") return fallback;
  if (role === "admin" && next.startsWith("/admin")) return next;
  if (
    role === "client" &&
    (next.startsWith("/cardapio") || next.startsWith("/carrinho"))
  ) {
    return next;
  }
  return fallback;
}
