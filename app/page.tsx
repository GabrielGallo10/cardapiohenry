import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-brand"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(140%,900px)] -translate-x-1/2 rounded-full bg-yellow-500/[0.14] blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-600/[0.1] blur-[80px]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-8">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-100 text-lg text-amber-700"
            aria-hidden
          >
            ◆
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700">
              Cardápio Henry
            </p>
            <p className="text-sm text-zinc-500">
              Distribuidora de bebidas · Pedidos online
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20 pt-4 md:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl sm:leading-tight">
            Sua distribuidora de bebidas,{" "}
            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-blue-700 bg-clip-text text-transparent">
              na palma da mão
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-zinc-600">
            Consulte marcas e volumes do catálogo, monte seu pedido e finalize
            pelo contato da distribuidora. Faça login para acessar o cardápio.
          </p>

          <div className="mt-14 flex justify-center">
            <Link
              href="/login"
              className="glow-brand inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-400 px-10 py-4 text-base font-semibold text-black shadow-xl transition hover:from-yellow-300 hover:to-amber-200"
            >
              Entrar
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-zinc-200 py-8 text-center text-xs text-zinc-600">
        <p className="font-medium text-zinc-500">Cardápio Henry</p>
        <p className="mt-2 text-zinc-600">
          Desenvolvido por GGCoreSystems
        </p>
      </footer>
    </div>
  );
}
