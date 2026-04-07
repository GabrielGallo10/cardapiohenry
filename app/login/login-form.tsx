"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getSession,
  loginWithPhonePassword,
  resolveRedirectAfterLogin,
  setSession,
} from "@/lib/auth";
import { normalizePhone } from "@/lib/users-storage";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const next =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "";
  const justRegistered = searchParams.get("cadastro") === "ok";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    router.replace(resolveRedirectAfterLogin(s.role, next));
  }, [router, next]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const role = loginWithPhonePassword(phone, password);
    if (!role) {
      setError("Telefone ou senha incorretos.");
      setLoading(false);
      return;
    }
    setSession({
      role,
      clientPhone: role === "client" ? normalizePhone(phone) : undefined,
    });
    router.push(resolveRedirectAfterLogin(role, next));
    router.refresh();
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-brand opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[min(100%,520px)] -translate-x-1/2 rounded-full bg-amber-200/50 blur-[100px]"
        aria-hidden
      />

      <Link
        href="/"
        className="fixed left-4 top-4 z-30 inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-md backdrop-blur-md transition hover:border-amber-400 hover:text-amber-800 sm:left-6 sm:top-6"
      >
        <span aria-hidden>←</span> Voltar ao início
      </Link>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl glow-brand">
          <div className="border-b border-zinc-100 bg-gradient-to-br from-amber-50 via-white to-blue-50/60 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-2xl text-amber-800">
              <span aria-hidden className="select-none">
                ◆
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Entrar
            </h1>
            <p className="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-zinc-600">
              Bem-vindo de volta. Entre para pedir pelo cardápio ou administrar o
              menu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
            {justRegistered ? (
              <p
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                role="status"
              >
                Cadastro concluído! Agora entre com telefone e senha.
              </p>
            ) : null}
            <div>
              <label
                htmlFor="login-phone"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Telefone
              </label>
              <input
                id="login-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="••••••••"
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
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <p className="text-center text-sm text-zinc-600">
              Não tem conta?{" "}
              <Link
                href="/cadastro"
                className="font-medium text-amber-700 hover:text-amber-900"
              >
                Cadastre-se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
