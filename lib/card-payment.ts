/** Taxas de maquinha — cartão na entrega (percentual sobre o subtotal dos produtos). */

export type CardPaymentKind = "credito" | "debito";

export type CreditBrand = "visa" | "mastercard" | "amex" | "elo";
export type DebitBrand = "visa" | "mastercard" | "elo";

const CREDIT_RATES: Record<CreditBrand, number> = {
  visa: 3.15,
  mastercard: 3.15,
  amex: 4.91,
  elo: 4.91,
};

const DEBIT_RATES: Record<DebitBrand, number> = {
  visa: 1.37,
  mastercard: 1.37,
  elo: 2.58,
};

export function getCardFeePercent(
  kind: CardPaymentKind,
  brand: string,
): number | null {
  const b = brand.trim().toLowerCase();
  if (kind === "credito") {
    if (b in CREDIT_RATES) return CREDIT_RATES[b as CreditBrand];
    return null;
  }
  if (b in DEBIT_RATES) return DEBIT_RATES[b as DebitBrand];
  return null;
}

export function creditBrandOptions(): { value: CreditBrand; label: string }[] {
  return [
    { value: "visa", label: "Visa" },
    { value: "mastercard", label: "Mastercard" },
    { value: "amex", label: "American Express (Amex)" },
    { value: "elo", label: "Elo" },
  ];
}

export function debitBrandOptions(): { value: DebitBrand; label: string }[] {
  return [
    { value: "visa", label: "Visa" },
    { value: "mastercard", label: "Mastercard" },
    { value: "elo", label: "Elo" },
  ];
}

export function subtotalWithCardFee(subtotal: number, feePercent: number): number {
  if (subtotal <= 0 || feePercent <= 0) return subtotal;
  return subtotal + (subtotal * feePercent) / 100;
}

export function formatFeePercentForDisplay(p: number): string {
  return p.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
