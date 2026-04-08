"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecuperarSenhaShell } from "../recuperar-shell";
import { apiPasswordResetConfirm } from "@/lib/api";

const STORAGE_TOKEN = "henry-bebidas-pwd-reset-token";
const STORAGE_EMAIL = "henry-bebidas-pwd-reset-email";

export default function RecuperarSenhaNovaSenhaPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(STORAGE_TOKEN)
        : null;
    if (!t) {
      router.replace("/recuperar-senha");
      return;
    }
    setToken(t);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await apiPasswordResetConfirm(token, password, confirm);
      sessionStorage.removeItem(STORAGE_TOKEN);
      sessionStorage.removeItem(STORAGE_EMAIL);
      router.push("/login?recuperacao=ok");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a senha. Peça um novo código.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        A redirecionar…
      </div>
    );
  }

  return (
    <RecuperarSenhaShell
      title="Nova senha"
      subtitle="Escolha uma senha nova para a sua conta. Depois pode entrar com o telefone habitual."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-8 py-8">
        <div>
          <label
            htmlFor="rec-pw"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
          >
            Nova senha
          </label>
          <input
            id="rec-pw"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        <div>
          <label
            htmlFor="rec-pw2"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
          >
            Confirmar senha
          </label>
          <input
            id="rec-pw2"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Repita a senha"
            required
            minLength={6}
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
          {loading ? "A guardar..." : "Guardar nova senha"}
        </button>
      </form>
    </RecuperarSenhaShell>
  );
}
