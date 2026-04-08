"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecuperarSenhaShell } from "./recuperar-shell";
import { apiPasswordResetRequest } from "@/lib/api";

const STORAGE_EMAIL = "henry-bebidas-pwd-reset-email";

export default function RecuperarSenhaEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (trimmed.length < 5 || !trimmed.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await apiPasswordResetRequest(trimmed);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(STORAGE_EMAIL, trimmed);
        sessionStorage.removeItem("henry-bebidas-pwd-reset-token");
      }
      router.push("/recuperar-senha/codigo");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar o e-mail. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <RecuperarSenhaShell
      title="Esqueceu a senha?"
      subtitle="Use o e-mail da sua conta cadastrada. Só enviamos o código se existir uma conta com esse endereço."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-8 py-8">
        <div>
          <label
            htmlFor="rec-email"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
          >
            E-mail
          </label>
          <input
            id="rec-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="seu@email.com"
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3.5 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400 disabled:opacity-60"
        >
          {loading ? "A enviar..." : "Enviar código por e-mail"}
        </button>
      </form>
    </RecuperarSenhaShell>
  );
}
