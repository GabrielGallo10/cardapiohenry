/** Alternância visual nos cards admin (lista + detalhe): faixa superior azul ou âmbar/amarelo. */
export type AdminCardAccent = "blue" | "amber";

export function adminAccentFromIndex(index: number): AdminCardAccent {
  return index % 2 === 0 ? "blue" : "amber";
}

/** Barra de 1px no topo do card */
export const ADMIN_CARD_TOP_BAR: Record<AdminCardAccent, string> = {
  blue: "bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400",
  amber: "bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500",
};

/** Orbes de blur no canto */
export const ADMIN_CARD_GLOW: Record<AdminCardAccent, string> = {
  blue: "bg-gradient-to-br from-blue-400/42 to-sky-300/26",
  amber: "bg-gradient-to-br from-amber-400/48 to-yellow-300/34",
};

/** Fundo suave do corpo do card */
export const ADMIN_CARD_BODY_BG: Record<AdminCardAccent, string> = {
  blue: "from-white via-white to-blue-50/22",
  amber: "from-white via-white to-amber-50/28",
};

/** Cabeçalho com título (SurfaceCard) */
export const ADMIN_CARD_SECTION_HEADER: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/75 bg-gradient-to-r from-zinc-50/98 via-blue-50/48 to-sky-50/22",
  amber:
    "border-amber-100/75 bg-gradient-to-r from-zinc-50/98 via-amber-50/52 to-yellow-50/30",
};

export const ADMIN_CARD_SECTION_TITLE: Record<AdminCardAccent, string> = {
  blue: "text-blue-900/65",
  amber: "text-amber-900/72",
};

/** Lista de pedidos: hover do card inteiro */
export const ADMIN_LIST_CARD_HOVER: Record<AdminCardAccent, string> = {
  blue: "hover:border-blue-200/70 hover:shadow-blue-500/10 hover:ring-blue-100/60",
  amber: "hover:border-amber-200/75 hover:shadow-amber-500/12 hover:ring-amber-100/55",
};

/** Lista: overlay ao passar o dedo / mouse */
export const ADMIN_LIST_CARD_HIT_OVERLAY: Record<AdminCardAccent, string> = {
  blue: "hover:from-blue-50/48 hover:to-sky-50/32 active:from-blue-50/58 active:to-sky-50/38",
  amber:
    "hover:from-amber-50/50 hover:to-yellow-50/35 active:from-amber-50/60 active:to-yellow-50/42",
};

/** Lista: rodapé (status) */
export const ADMIN_LIST_CARD_FOOTER: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/70 bg-gradient-to-r from-zinc-50/95 via-blue-50/52 to-sky-50/28",
  amber:
    "border-amber-100/72 bg-gradient-to-r from-zinc-50/95 via-amber-50/52 to-yellow-50/32",
};

export const ADMIN_LIST_CARD_FOOTER_LABEL: Record<AdminCardAccent, string> = {
  blue: "text-blue-900/55 sm:text-blue-900/65",
  amber: "text-amber-900/58 sm:text-amber-900/68",
};

/** Lista: divisor do endereço */
export const ADMIN_LIST_CARD_ADDRESS_RULE: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/80",
  amber: "border-amber-100/78",
};

/** Lista: nome do cliente */
export const ADMIN_LIST_CARD_NAME: Record<AdminCardAccent, string> = {
  blue: "text-blue-950",
  amber: "text-amber-950",
};

/** Detalhe: tiles Nome / Telefone / Endereço */
export const ADMIN_DETAIL_FIELD_TILE: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/60 bg-white/60 ring-blue-50/50",
  amber: "border-amber-100/65 bg-white/60 ring-amber-50/45",
};

export const ADMIN_DETAIL_FIELD_LABEL: Record<AdminCardAccent, string> = {
  blue: "text-blue-900/45",
  amber: "text-amber-900/48",
};

export const ADMIN_DETAIL_FIELD_NAME: Record<AdminCardAccent, string> = {
  blue: "text-blue-950",
  amber: "text-amber-950",
};

/** Detalhe: moldura da tabela de itens */
export const ADMIN_DETAIL_TABLE_WRAP: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/90 ring-blue-50/60",
  amber: "border-amber-100/88 ring-amber-50/55",
};

export const ADMIN_DETAIL_TABLE_HEAD: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/80 bg-gradient-to-r from-blue-50/95 via-sky-50/50 to-amber-50/22",
  amber:
    "border-amber-100/82 bg-gradient-to-r from-amber-50/95 via-yellow-50/48 to-amber-50/32",
};

export const ADMIN_DETAIL_TABLE_TH: Record<AdminCardAccent, string> = {
  blue: "text-blue-900/70",
  amber: "text-amber-900/72",
};

export const ADMIN_DETAIL_TABLE_ROW_HOVER: Record<AdminCardAccent, string> = {
  blue: "hover:bg-blue-50/35",
  amber: "hover:bg-amber-50/38",
};

export const ADMIN_DETAIL_TABLE_DIVIDE: Record<AdminCardAccent, string> = {
  blue: "divide-blue-100/50",
  amber: "divide-amber-100/50",
};

export const ADMIN_DETAIL_TOTAL_RULE: Record<AdminCardAccent, string> = {
  blue: "border-blue-100/80",
  amber: "border-amber-100/80",
};

export const ADMIN_DETAIL_TOTAL_LABEL: Record<AdminCardAccent, string> = {
  blue: "text-blue-950/80",
  amber: "text-amber-950/82",
};

/** Detalhe: caixa de observações */
export const ADMIN_DETAIL_NOTE_BOX: Record<AdminCardAccent, string> = {
  blue: "border-blue-200/70 bg-blue-50/25",
  amber: "border-amber-200/70 bg-amber-50/28",
};
