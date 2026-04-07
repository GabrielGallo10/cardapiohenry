import { formatPhoneForDisplay } from "./format";

/**
 * Dígitos no formato internacional para BR (55 + DDD + número).
 * Aceita já com 55 ou só DDD+número (10 ou 11 dígitos).
 */
export function internationalDigitsForBR(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return null;
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if (d.length >= 12) return d;
  return null;
}

export type CustomerPhoneContact = {
  display: string;
  telHref: string;
  whatsappHref: string;
};

/** Links para ligar (tel:) e abrir chat (wa.me). */
export function customerPhoneContact(raw: string): CustomerPhoneContact | null {
  const intl = internationalDigitsForBR(raw);
  if (!intl) return null;
  const national = raw.replace(/\D/g, "");
  const display =
    national.length >= 10
      ? formatPhoneForDisplay(national)
      : raw.trim() || national;
  return {
    display,
    telHref: `tel:+${intl}`,
    whatsappHref: `https://wa.me/${intl}`,
  };
}
