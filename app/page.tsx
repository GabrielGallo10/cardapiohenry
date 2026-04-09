import Image from "next/image";
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

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20 pt-10 md:pt-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <div className="mb-6 w-full max-w-[320px] sm:max-w-[380px] md:mb-8 md:max-w-[440px]">
            <Image
              src="/logohenry.png"
              alt="Henry Bebidas — Centro de bebidas, gelada sempre"
              width={560}
              height={320}
              className="mx-auto h-auto w-full object-contain drop-shadow-md"
              priority
              sizes="(max-width: 768px) 90vw, 440px"
            />
          </div>
          <p className="text-sm font-medium text-zinc-500">
            Distribuidora de bebidas · Pedidos online
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl sm:leading-tight">
            Sua distribuidora de bebidas,{" "}
            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-blue-700 bg-clip-text text-transparent">
              na palma da mão
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-zinc-600">
            Consulte marcas e volumes do catálogo sem login. Para adicionar ao
            carrinho e finalizar pedido, entre na sua conta.
          </p>

          <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cardapio"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-zinc-300 bg-white px-10 py-4 text-base font-semibold text-zinc-800 shadow-md transition hover:border-amber-300 hover:bg-amber-50"
            >
              Visualizar cardápio
            </Link>
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
        <p className="font-medium text-zinc-500">HenryBebidas</p>
        <p className="mt-2 text-zinc-600">
          Desenvolvido por GGCoreSystems
        </p>
      </footer>
    </div>
  );
}
