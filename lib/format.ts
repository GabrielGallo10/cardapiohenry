export function formatMoney(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Exibição amigável a partir de dígitos (DDD + número). */
export function formatPhoneForDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return digits;
}

/** Exibe forma de pagamento vinda da API (ex.: "pix" → "PIX"). */
export function formatPaymentMethodLabel(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  if (lower === "pix") return "PIX";
  return t;
}
