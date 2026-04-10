import { formatMoney, formatPaymentMethodLabel } from "./format";
import { internationalDigitsForBR } from "./phone-contact";
import { orderItemsTotal } from "./order-totals";
import type { Order, OrderItem, OrderStatus } from "./types";

const DIVIDER = "━━━━━━━━━━━━━━━━";

/** Chave PIX (CNPJ) da HenryBebidas — exibida na mensagem ao cliente quando o pedido é PIX e o status vai para em preparo. */
const PIX_KEY_HENRY = "65.101.324/0001-61";

function isPixPayment(method: string | undefined): boolean {
  const t = method?.trim().toLowerCase() ?? "";
  return t === "pix" || t.includes("pix");
}

export function buildOrderWhatsAppText(params: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  items: OrderItem[];
}): string {
  const lines: string[] = [
    "🛒 *Novo pedido — HenryBebidas*",
    "",
    "👤 *Cliente*",
    params.customerName,
    "",
    "📱 *Telefone*",
    params.customerPhone,
    "",
    "📍 *Entrega*",
    params.deliveryAddress.trim(),
  ];
  if (params.notes.trim()) {
    lines.push("", "📝 *Observações*", params.notes.trim());
  }
  lines.push("", DIVIDER, "📦 *Itens do pedido*", "");
  let total = 0;
  for (const line of params.items) {
    const sub = line.price * line.quantity;
    total += sub;
    lines.push(
      `▸ ${line.quantity}× ${line.name}`,
      `   💵 ${formatMoney(line.price)} un. → *${formatMoney(sub)}*`,
    );
  }
  lines.push(
    "",
    DIVIDER,
    `💰 *Total:* ${formatMoney(total)}`,
    "",
    "✨ Obrigado pelo pedido! Qualquer dúvida, estamos por aqui. 🙏",
  );
  return lines.join("\n");
}

/**
 * Abre conversa com texto pré-preenchido.
 * `wa.me?text=` costuma corromper emoji () no desktop/WhatsApp Web no redirect;
 * `api.whatsapp.com/send` preserva UTF-8 corretamente.
 */
export function whatsAppUrl(phoneDigits: string, text: string): string {
  const num = phoneDigits.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${num}&text=${encoded}`;
}

function orderHasDetailedLineItems(order: Order): boolean {
  if (order.items.length === 0) return false;
  if (
    order.items.length === 1 &&
    order.items[0].menuItemId === "total"
  ) {
    return false;
  }
  return true;
}

/**
 * Mensagem do administrador para o cliente após mudança de status.
 * Abre no WhatsApp do admin (número do cliente, texto pré-preenchido).
 */
export function buildCustomerStatusWhatsAppMessage(
  order: Order,
  status: OrderStatus,
): string {
  const name = order.customerName.trim() || "Cliente";
  const first = name.split(/\s+/)[0] ?? name;

  switch (status) {
    case "em_preparo": {
      const parts: string[] = [
        `👋 Olá, *${first}*!`,
        "",
        "📦 *Boa notícia!* Seu pedido já está *em separação* aqui na HenryBebidas.",
        "",
        "Estamos montando as bebidas e demais itens com cuidado para enviar até você em breve.",
      ];
      const total = orderItemsTotal(order.items);
      const showItems =
        order.items.length > 0 &&
        (orderHasDetailedLineItems(order) || total > 0);
      if (showItems) {
        parts.push("", DIVIDER, "📋 *Resumo do pedido*", "");
        for (const line of order.items) {
          parts.push(
            `▸ ${line.quantity}× ${line.name} — *${formatMoney(line.price * line.quantity)}*`,
          );
        }
        parts.push("", `💰 *Total:* ${formatMoney(total)}`);
      }
      if (order.deliveryAddress?.trim()) {
        parts.push("", "📍 *Entrega*", order.deliveryAddress.trim());
      }
      if (order.paymentMethod?.trim()) {
        parts.push(
          "",
          "💳 *Pagamento*",
          formatPaymentMethodLabel(order.paymentMethod),
        );
        if (isPixPayment(order.paymentMethod)) {
          parts.push(
            "",
            "🔑 *Chave PIX*",
            PIX_KEY_HENRY,
            "",
            "Após realizar o pagamento, *envie o comprovante neste chat do WhatsApp* para agilizarmos a separação do seu pedido.",
          );
        }
      }
      parts.push(
        "",
        DIVIDER,
        "💬 Qualquer dúvida, é só chamar por aqui!",
        "Obrigado pela preferência ✨",
      );
      return parts.join("\n");
    }
    case "pronto":
      return [
        `👋 Olá, *${first}*!`,
        "",
        "🚚 *Seu pedido saiu para entrega!*",
        "",
        "As bebidas já estão a caminho do endereço informado — logo chegam por aí.",
        "",
        "Obrigado por escolher a *HenryBebidas*! 💛",
      ].join("\n");
    case "concluido":
      return [
        `👋 Olá, *${first}*!`,
        "",
        "✅ *Pedido concluído!*",
        "",
        "Obrigado pela confiança. Foi um prazer te atender.",
        "",
        "Quando precisar repor o estoque ou fazer um novo pedido, é só chamar. 💛",
        "",
        "_Equipe HenryBebidas_",
      ].join("\n");
    default:
      return "";
  }
}

/** Abre conversa com o *cliente* (número do pedido) para o admin enviar o aviso. */
export function openWhatsAppNotifyCustomer(
  order: Order,
  status: OrderStatus,
): void {
  if (status === "novo") return;
  const body = buildCustomerStatusWhatsAppMessage(order, status);
  if (!body.trim()) return;
  const intl = internationalDigitsForBR(order.customerPhone);
  if (!intl) return;
  const url = whatsAppUrl(intl, body);
  window.open(url, "_blank", "noopener,noreferrer");
}
