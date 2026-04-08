"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, resolveRedirectAfterLogin } from "@/lib/auth";
import { registerClient } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    router.replace(resolveRedirectAfterLogin(s.role, ""));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("A confirmacao da senha nao confere.");
      return;
    }
    setLoading(true);
    const result = await registerClient({ name, email, phone, password });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/login?cadastro=ok");
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
        <span aria-hidden>←</span> Voltar ao inicio
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
              Criar conta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Cadastre-se para pedir pelo cardápio. Use um e-mail válido para
              recuperar a senha. Na entrada, use o telefone e a senha.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Nome completo
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Seu nome"
                required
                minLength={2}
              />
            </div>
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                E-mail
              </label>
              <input
                id="register-email"
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
            <div>
              <label
                htmlFor="register-phone"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Telefone
              </label>
              <input
                id="register-phone"
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
                htmlFor="register-password"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Minimo 4 caracteres"
                required
                minLength={4}
              />
            </div>
            <div>
              <label
                htmlFor="register-confirm"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600"
              >
                Confirmar senha
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Repita a senha"
                required
                minLength={4}
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
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
            <p className="text-center text-sm text-zinc-600">
              Ja tem conta?{" "}
              <Link
                href="/login"
                className="font-medium text-amber-700 hover:text-amber-900"
              >
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

