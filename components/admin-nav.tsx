"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

const navLinkClass =
  "flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-amber-700 sm:px-3";

const mobileCarouselTrack =
  "flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overscroll-x-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const mobileCarouselLink = `${navLinkClass} shrink-0 snap-start whitespace-nowrap px-4`;

export function AdminNav() {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex items-start justify-between gap-3 lg:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-600">
                Administrador
              </p>
              <Link
                href="/admin"
                className="mt-0.5 block text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
              >
                HenryBebidas
              </Link>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 self-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 lg:hidden"
              aria-label="Sair da conta"
            >
              Sair
            </button>
          </div>

          <nav
            className="w-full min-w-0 lg:w-auto lg:shrink-0"
            aria-label="Navegação do painel"
          >
            <div className="-mx-4 lg:mx-0 lg:hidden">
              <div className={`${mobileCarouselTrack} px-4`}>
                <Link href="/admin" className={mobileCarouselLink}>
                  Painel
                </Link>
                <Link href="/admin/cardapio" className={mobileCarouselLink}>
                  Produtos
                </Link>
                <Link href="/admin/pedidos" className={mobileCarouselLink}>
                  Pedidos
                </Link>
                <Link href="/admin/clientes" className={mobileCarouselLink}>
                  Clientes
                </Link>
                <Link href="/admin/financas" className={mobileCarouselLink}>
                  Finanças
                </Link>
              </div>
            </div>

            <div className="hidden flex-wrap items-center justify-end gap-1 lg:flex">
              <Link href="/admin" className={navLinkClass}>
                Painel
              </Link>
              <Link href="/admin/cardapio" className={navLinkClass}>
                Produtos
              </Link>
              <Link href="/admin/pedidos" className={navLinkClass}>
                Pedidos
              </Link>
              <Link href="/admin/clientes" className={navLinkClass}>
                Clientes
              </Link>
              <Link href="/admin/financas" className={navLinkClass}>
                Finanças
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
              >
                Sair
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
