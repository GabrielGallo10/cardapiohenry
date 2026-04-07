"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPhoneForDisplay } from "@/lib/format";
import { customerPhoneContact } from "@/lib/phone-contact";
import type { UserRecord } from "@/lib/types";
import { readUsers, USERS_UPDATED } from "@/lib/users-storage";

function ClienteWhatsappPhone({ phone }: { phone: string }) {
  const c = customerPhoneContact(phone);
  const digits = phone.replace(/\D/g, "");
  const label =
    digits.length >= 10 ? formatPhoneForDisplay(digits) : phone.trim() || "—";
  if (!c) {
    return <span className="tabular-nums text-zinc-700">{label}</span>;
  }
  return (
    <a
      href={c.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-600 underline-offset-2 tabular-nums transition hover:text-blue-800 hover:underline"
    >
      {c.display}
    </a>
  );
}

function clientMatchesQuery(client: UserRecord, raw: string): boolean {
  const q = raw.trim();
  if (!q) return true;
  const qLower = q.toLowerCase();
  if (client.name.toLowerCase().includes(qLower)) return true;
  const qDigits = q.replace(/\D/g, "");
  const phoneDigits = client.phone.replace(/\D/g, "");
  if (qDigits.length > 0 && phoneDigits.includes(qDigits)) return true;
  const displayed = formatPhoneForDisplay(client.phone).toLowerCase();
  if (displayed.includes(qLower)) return true;
  return false;
}

export default function AdminClientesPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => {
    setUsers(readUsers());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener(USERS_UPDATED, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(USERS_UPDATED, on);
      window.removeEventListener("storage", on);
    };
  }, [refresh]);

  const clients = useMemo(
    () => users.filter((u) => u.role === "client"),
    [users],
  );

  const filteredClients = useMemo(
    () => clients.filter((c) => clientMatchesQuery(c, search)),
    [clients, search],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Clientes cadastrados
      </h1>

      <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
        <label
          htmlFor="client-search"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
        >
          Buscar por nome ou telefone
        </label>
        <input
          id="client-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Digite o nome ou o telefone…"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          autoComplete="off"
        />
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-14 text-center text-sm text-zinc-600">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-6 py-12 text-center text-sm text-zinc-600">
          Nenhum cliente encontrado para &quot;{search.trim()}&quot;.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90">
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-600"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-600"
                  >
                    Telefone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredClients.map((u) => (
                  <tr key={u.id} className="transition hover:bg-amber-50/40">
                    <td className="px-5 py-4 font-medium text-zinc-900">
                      {u.name}
                    </td>
                    <td className="px-5 py-4">
                      <ClienteWhatsappPhone phone={u.phone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
