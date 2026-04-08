import Link from "next/link";
import type { ReactNode } from "react";
import { AuthCardLogo } from "@/components/auth-card-logo";

export function RecuperarSenhaShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
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
        href="/login"
        className="fixed left-4 top-4 z-30 inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-md backdrop-blur-md transition hover:border-amber-400 hover:text-amber-800 sm:left-6 sm:top-6"
      >
        <span aria-hidden>←</span> Voltar ao login
      </Link>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl glow-brand">
          <div className="border-b border-zinc-100 bg-gradient-to-br from-amber-50 via-white to-blue-50/60 px-8 py-10 text-center">
            <AuthCardLogo />
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[320px] text-sm leading-relaxed text-zinc-600">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
