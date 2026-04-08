"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecuperarSenhaShell } from "../recuperar-shell";
import { apiPasswordResetVerify } from "@/lib/api";

const STORAGE_EMAIL = "henry-bebidas-pwd-reset-email";
const STORAGE_TOKEN = "henry-bebidas-pwd-reset-token";

function maskEmailHint(addr: string): string {
  const t = addr.trim();
  const at = t.lastIndexOf("@");
  if (at <= 0) return t;
  const local = t.slice(0, at);
  const domain = t.slice(at);
  if (local.length <= 2) return `•••${domain}`;
  return `${local.slice(0, 2)}•••${domain}`;
}

export default function RecuperarSenhaCodigoPage() {
  const router = useRouter();
  const [emailAddr, setEmailAddr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(STORAGE_EMAIL)
        : null;
    if (!e) {
      router.replace("/recuperar-senha");
      return;
    }
    setEmailAddr(e);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailAddr) return;
    setError(null);
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("O código tem 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const { reset_token } = await apiPasswordResetVerify(emailAddr, digits);
      sessionStorage.setItem(STORAGE_TOKEN, reset_token);
      router.push("/recuperar-senha/nova-senha");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Código inválido. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!emailAddr) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        A redirecionar…
      </div>
    );
  }

  return (
    <RecuperarSenhaShell
      title="Código por e-mail"
      subtitle="Recebeu uma mensagem no e-mail com 6 dígitos. Introduza o código abaixo."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-8 py-8">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Pedido registado para{" "}
          <span className="font-semibold">{maskEmailHint(emailAddr)}</span>. O
          e-mail deve chegar em instantes; o código expira em cerca de 10 minutos.
        </p>
        <div>
          <label
            htmlFor="rec-code"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
          >
            Código de 6 dígitos
          </label>
          <input
            id="rec-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="000000"
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
          {loading ? "A verificar..." : "Confirmar código"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          <Link
            href="/recuperar-senha"
            className="font-medium text-amber-700 hover:text-amber-900"
          >
            Não recebeu? Pedir novo código
          </Link>
        </p>
      </form>
    </RecuperarSenhaShell>
  );
}
