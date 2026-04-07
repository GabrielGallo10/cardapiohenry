import { formatMoney } from "./format";
import type { OrderItem } from "./types";

export function buildOrderWhatsAppText(params: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  items: OrderItem[];
}): string {
  const lines: string[] = [
    "Olá! Gostaria de fazer um pedido pelo cardápio:",
    "",
    `Nome: ${params.customerName}`,
    `Telefone: ${params.customerPhone}`,
    `Endereço de entrega: ${params.deliveryAddress.trim()}`,
  ];
  if (params.notes.trim()) {
    lines.push(`Observações: ${params.notes.trim()}`);
  }
  lines.push("", "Itens:");
  let total = 0;
  for (const line of params.items) {
    const sub = line.price * line.quantity;
    total += sub;
    lines.push(
      `• ${line.quantity}x ${line.name} — ${formatMoney(line.price)} (sub: ${formatMoney(sub)})`,
    );
  }
  lines.push("", `Total: ${formatMoney(total)}`);
  return lines.join("\n");
}

export function whatsAppUrl(phoneDigits: string, text: string): string {
  const num = phoneDigits.replace(/\D/g, "");
  const q = new URLSearchParams({ text });
  return `https://wa.me/${num}?${q.toString()}`;
}
