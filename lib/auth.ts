import type { UserRole } from "./types";
import {
  loginWithPhonePassword as verifyPhonePassword,
  normalizePhone,
} from "./users-storage";

export type { UserRole } from "./types";

const AUTH_KEY = "cardapio-henry-auth";

export type AuthSession = {
  role: UserRole;
  /** Telefone normalizado; presente quando o cliente está logado. */
  clientPhone?: string;
};

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { role?: UserRole; clientPhone?: string };
    if (j.role !== "admin" && j.role !== "client") return null;
    return {
      role: j.role,
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
    ...(session.role === "client" && session.clientPhone
      ? { clientPhone: normalizePhone(session.clientPhone) }
      : {}),
  };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export function loginWithPhonePassword(
  phone: string,
  password: string,
): UserRole | null {
  return verifyPhonePassword(phone, password);
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
