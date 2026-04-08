"use client";

import { useRouter } from "next/navigation";
import { BrandLogoLink } from "@/components/brand-logo-link";
import { clearSession } from "@/lib/auth";

type Props = {
  /** Usado só para leitores de ecrã (a barra mostra apenas a logo). */
  title: string;
  trailing?: React.ReactNode;
};

export function ClientBar({ title, trailing }: Props) {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogoLink
            href="/cardapio"
            ariaLabel={`Ir para o cardápio — ${title}`}
          />
          <span className="sr-only">{title}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {trailing}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
