"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClientBar } from "@/components/client-bar";
import { useCart } from "@/components/cart-provider";
import { useMenu } from "@/hooks/use-menu";
import { MenuItemPhoto } from "@/components/menu-item-photo";
import { formatMoney } from "@/lib/format";

export default function CardapioPage() {
  const { items } = useMenu();
  const { addItem, itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items.filter((i) => i.available)) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [items]);

  const categoryNames = useMemo(
    () => byCategory.map(([name]) => name),
    [byCategory],
  );

  const visibleSections = useMemo(() => {
    if (activeCategory === "all") return byCategory;
    return byCategory.filter(([cat]) => cat === activeCategory);
  }, [byCategory, activeCategory]);

  return (
    <div className="relative min-h-full bg-background text-zinc-900">
      <div
        className="pointer-events-none fixed inset-0 bg-grid-brand opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed top-0 left-1/2 h-72 w-[min(100%,640px)] -translate-x-1/2 bg-amber-200/40 blur-[80px]"
        aria-hidden
      />

      <ClientBar
        title="Cardápio"
        trailing={
          <Link
            href="/carrinho"
            className="relative inline-flex items-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition hover:from-yellow-400 hover:to-amber-400"
          >
            Carrinho
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-700 px-1 text-[10px] font-bold text-amber-50">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        }
      />

      {byCategory.length > 0 ? (
        <nav
          aria-label="Filtrar por categoria"
          className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl shadow-sm"
        >
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(202,138,4,0.45)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-400/60">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === "all"
                    ? "border-amber-500 bg-amber-100 text-amber-900"
                    : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                Todos
              </button>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`max-w-[min(100vw-8rem,280px)] shrink-0 truncate rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeCategory === cat
                      ? "border-amber-500 bg-amber-100 text-amber-900"
                      : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                  title={cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </nav>
      ) : null}

      <main className="relative z-10 mx-auto max-w-2xl space-y-12 px-4 py-10 pb-16">
        <div className="text-center">
          <p className="text-sm text-zinc-600">
            Toque em <span className="font-medium text-amber-700">Adicionar</span>{" "}
            para levar ao carrinho.
          </p>
        </div>

        {byCategory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-600">
              Nenhum item disponível no momento.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Voltar ao início
            </Link>
          </div>
        ) : (
          visibleSections.map(([category, list]) => (
            <section key={category}>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/80"
                  aria-hidden
                />
                <h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  {category}
                </h2>
                <span
                  className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/80"
                  aria-hidden
                />
              </div>
              <ul className="space-y-4">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-md transition hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10"
                  >
                    <MenuItemPhoto
                      src={item.imageUrl}
                      alt={item.name}
                      variant="card"
                      hoverZoom
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      {item.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-base font-semibold text-amber-700">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          menuItemId: item.id,
                          name: item.name,
                          price: item.price,
                        })
                      }
                      className="shrink-0 self-center rounded-xl border border-amber-500 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 transition group-hover:bg-amber-100"
                    >
                      Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
