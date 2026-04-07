import Link from "next/link";
import type { ReactNode } from "react";

function IconProdutos({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPedidos({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFinancas({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClientes({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLoja({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type PanelCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: {
    glow: string;
    iconBg: string;
    iconRing: string;
    iconText: string;
    title: string;
    borderHover: string;
    arrow: string;
    bar: string;
  };
};

function PanelCard({ href, title, description, icon, accent }: PanelCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-sm ring-1 ring-zinc-100/80 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:ring-0 ${accent.borderHover}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.bar}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-40 blur-3xl transition duration-500 group-hover:opacity-70 ${accent.glow}`}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-2 ring-inset ${accent.iconRing} ${accent.iconBg}`}
        >
          <span className={accent.iconText}>{icon}</span>
        </div>
        <span
          className={`mt-1 flex size-9 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/80 text-zinc-400 opacity-0 transition duration-300 group-hover:opacity-100 ${accent.arrow}`}
          aria-hidden
        >
          <IconArrow className="size-4" />
        </span>
      </div>

      <h2 className={`relative mt-5 text-xl font-semibold tracking-tight ${accent.title}`}>
        {title}
      </h2>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
      <span
        className={`relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2 ${accent.title}`}
      >
        Acessar
        <IconArrow className="size-3.5 opacity-70" />
      </span>
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Painel
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          Bem-vindo. Aqui você organiza seus produtos, acompanha pedidos e trata
          seus clientes em um só lugar — rápido e direto ao ponto.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <PanelCard
          href="/admin/cardapio"
          title="Produtos"
          description="Monte seu catálogo com fotos, preços e categorias. O que o cliente vê no cardápio começa aqui."
          icon={<IconProdutos className="size-7" />}
          accent={{
            glow: "bg-amber-400/45",
            iconBg: "bg-gradient-to-br from-yellow-50 via-amber-50 to-amber-100/90",
            iconRing: "ring-amber-300/80",
            iconText: "text-amber-800",
            title: "text-amber-950 group-hover:text-amber-900",
            borderHover: "hover:shadow-amber-500/15",
            arrow: "group-hover:border-amber-300 group-hover:bg-amber-50 group-hover:text-amber-800",
            bar: "from-yellow-400 via-amber-500 to-amber-600",
          }}
        />
        <PanelCard
          href="/admin/pedidos"
          title="Pedidos"
          description="Veja o que chegou, acompanhe o andamento e mantenha tudo sob controle até a entrega."
          icon={<IconPedidos className="size-7" />}
          accent={{
            glow: "bg-blue-400/45",
            iconBg: "bg-gradient-to-br from-blue-50 to-sky-100/80",
            iconRing: "ring-blue-200/90",
            iconText: "text-blue-700",
            title: "text-blue-950 group-hover:text-blue-800",
            borderHover: "hover:shadow-blue-600/15",
            arrow: "group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700",
            bar: "from-blue-600 via-blue-500 to-sky-400",
          }}
        />
        <PanelCard
          href="/admin/financas"
          title="Finanças"
          description="Reservado para a visão financeira do negócio quando você quiser ir além dos pedidos do dia a dia."
          icon={<IconFinancas className="size-7" />}
          accent={{
            glow: "bg-blue-500/40",
            iconBg: "bg-gradient-to-br from-slate-50 to-blue-100/90",
            iconRing: "ring-blue-300/70",
            iconText: "text-blue-800",
            title: "text-blue-950 group-hover:text-blue-900",
            borderHover: "hover:shadow-blue-700/15",
            arrow: "group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-800",
            bar: "from-slate-700 via-blue-700 to-blue-500",
          }}
        />
        <PanelCard
          href="/admin/clientes"
          title="Clientes"
          description="Conheça quem compra com você e os endereços que eles já salvaram para agilizar a próxima compra."
          icon={<IconClientes className="size-7" />}
          accent={{
            glow: "bg-yellow-300/50",
            iconBg: "bg-gradient-to-br from-yellow-50 to-amber-100/80",
            iconRing: "ring-yellow-300/80",
            iconText: "text-amber-800",
            title: "text-amber-950 group-hover:text-amber-900",
            borderHover: "hover:shadow-amber-500/12",
            arrow: "group-hover:border-yellow-300 group-hover:bg-yellow-50 group-hover:text-amber-800",
            bar: "from-yellow-400 via-amber-500 to-yellow-500",
          }}
        />
        <PanelCard
          href="/admin/loja"
          title="Loja & WhatsApp"
          description="Confira o número usado quando o cliente envia o pedido e ajuste as informações da sua operação."
          icon={<IconLoja className="size-7" />}
          accent={{
            glow: "bg-sky-300/45",
            iconBg: "bg-gradient-to-br from-sky-50 to-blue-50/90",
            iconRing: "ring-sky-200/90",
            iconText: "text-blue-700",
            title: "text-blue-950 group-hover:text-blue-800",
            borderHover: "hover:shadow-sky-500/15",
            arrow: "group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-blue-700",
            bar: "from-sky-500 via-blue-500 to-blue-600",
          }}
        />
      </div>
    </div>
  );
}
