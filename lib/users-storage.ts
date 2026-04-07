import type { SavedAddress, UserRecord, UserRole } from "./types";

const USERS_KEY = "cardapio-henry-users";

export const USERS_UPDATED = "cardapio-henry-users-updated";

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

function getDefaultAdminPassword(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "henry";
}

function getDefaultAdminPhone(): string {
  return normalizePhone(
    process.env.NEXT_PUBLIC_ADMIN_PHONE ?? "11999999999",
  );
}

function buildSeedAdmin(): UserRecord {
  return {
    id: "user-seed-admin",
    name: "Administrador",
    phone: getDefaultAdminPhone(),
    password: getDefaultAdminPassword(),
    role: "admin",
  };
}

function persistUsers(users: UserRecord[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(USERS_UPDATED));
  }
}

/**
 * Lista usuários. Na primeira vez (ou lista vazia), cria o administrador padrão.
 */
export function readUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const initial = [buildSeedAdmin()];
      persistUsers(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as UserRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [buildSeedAdmin()];
      persistUsers(initial);
      return initial;
    }
    return parsed.map((u) => ({
      ...u,
      addresses: Array.isArray(u.addresses) ? u.addresses : [],
    }));
  } catch {
    const initial = [buildSeedAdmin()];
    persistUsers(initial);
    return initial;
  }
}

export function findUserByPhone(phoneDigits: string): UserRecord | undefined {
  const p = normalizePhone(phoneDigits);
  return readUsers().find((u) => u.phone === p);
}

export function getClientAddresses(phoneDigits: string): SavedAddress[] {
  const u = findUserByPhone(phoneDigits);
  if (!u || u.role !== "client") return [];
  return u.addresses ?? [];
}

export function addAddressToClientUser(
  phoneDigits: string,
  address: SavedAddress,
): boolean {
  const phone = normalizePhone(phoneDigits);
  const users = readUsers();
  const idx = users.findIndex((u) => u.phone === phone && u.role === "client");
  if (idx === -1) return false;
  const user = users[idx];
  const prev = user.addresses ?? [];
  const nextUsers = [...users];
  nextUsers[idx] = { ...user, addresses: [...prev, address] };
  persistUsers(nextUsers);
  return true;
}

export function registerUser(params: {
  name: string;
  phone: string;
  password: string;
}): { ok: true } | { ok: false; error: string } {
  const name = params.name.trim();
  if (name.length < 2) {
    return { ok: false, error: "Informe um nome com pelo menos 2 caracteres." };
  }
  const phone = normalizePhone(params.phone);
  if (phone.length < 10 || phone.length > 15) {
    return {
      ok: false,
      error: "Informe um telefone válido (com DDD).",
    };
  }
  if (params.password.length < 4) {
    return {
      ok: false,
      error: "A senha deve ter pelo menos 4 caracteres.",
    };
  }
  const users = readUsers();
  if (users.some((u) => u.phone === phone)) {
    return { ok: false, error: "Este telefone já está cadastrado." };
  }
  const newUser: UserRecord = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    phone,
    password: params.password,
    role: "client",
    addresses: [],
  };
  persistUsers([...users, newUser]);
  return { ok: true };
}

export function loginWithPhonePassword(
  phoneInput: string,
  password: string,
): UserRole | null {
  const phone = normalizePhone(phoneInput);
  if (phone.length < 10) return null;
  const user = readUsers().find((u) => u.phone === phone);
  if (!user || user.password !== password) return null;
  return user.role;
}
