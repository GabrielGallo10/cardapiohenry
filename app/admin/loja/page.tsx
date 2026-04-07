import Link from "next/link";
import { getWhatsAppNumber } from "@/lib/config";
import { formatPhoneForDisplay } from "@/lib/format";

function formatWhatsAppLine(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) {
    return `+55 ${formatPhoneForDisplay(d.slice(2))}`;
  }
  return formatPhoneForDisplay(d);
}

export default function AdminLojaPage() {
  const raw = getWhatsAppNumber();
  const line = formatWhatsAppLine(raw);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-zinc-600">
          <Link
            href="/admin"
            className="font-medium text-amber-700 hover:text-amber-800"
          >
            ← Painel
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          Loja &amp; WhatsApp
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
          O número abaixo é o que o app usa para montar o link do WhatsApp no
          carrinho. Ele vem da variável de ambiente pública{" "}
          <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-xs text-zinc-800">
            NEXT_PUBLIC_WHATSAPP_NUMBER
          </code>{" "}
          (apenas dígitos, com DDI; ex.:{" "}
          <span className="whitespace-nowrap">5511999999999</span>).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-md">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Número ativo no build
        </p>
        <p className="mt-3 font-mono text-lg text-zinc-900">{raw}</p>
        <p className="mt-1 text-sm text-zinc-600">{line}</p>
        <a
          href={`https://wa.me/${raw.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Abrir conversa no WhatsApp →
        </a>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800">Como alterar</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Crie ou edite{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            na raiz do projeto.
          </li>
          <li>
            Defina{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_WHATSAPP_NUMBER=5511...
            </code>
          </li>
          <li>Reinicie o servidor de desenvolvimento (`npm run dev`).</li>
        </ol>
      </div>
    </div>
  );
}
