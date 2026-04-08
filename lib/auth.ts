import type { UserRole } from "./types";
import { ApiHttpError, apiLogin, apiRegister } from "./api";

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

/** Alinha `cargo` do Postgres/API com o papel no frontend (trim + minúsculas). */
function roleFromCargo(cargo: string): UserRole | null {
  const c = cargo.trim().toLowerCase();
  if (c === "admin") return "admin";
  if (c === "client") return "client";
  return null;
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

export type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: string };

export async function loginWithPhonePassword(
  phone: string,
  password: string,
): Promise<LoginResult> {
  try {
    const data = await apiLogin({ tel: normalizePhone(phone), password });
    const role = roleFromCargo(data.cargo);
    if (!role) {
      return {
        ok: false,
        error:
          "O servidor devolveu um tipo de conta inválido. Verifique o campo cargo na base de dados (admin ou client).",
      };
    }
    return {
      ok: true,
      session: {
        role,
        token: data.token,
        clientPhone: role === "client" ? normalizePhone(phone) : undefined,
      },
    };
  } catch (e) {
    if (e instanceof ApiHttpError) {
      if (e.status >= 500) {
        return {
          ok: false,
          error:
            "Erro no servidor ao entrar. Confira os logs da API e a base de dados (ex.: colunas cargo/senha).",
        };
      }
      if (e.status === 401) {
        return { ok: false, error: "Telefone ou senha incorretos." };
      }
      return {
        ok: false,
        error: e.message || `Pedido falhou (${e.status}).`,
      };
    }
    return {
      ok: false,
      error: "Não foi possível contactar o servidor. Verifique a rede e a URL da API.",
    };
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
