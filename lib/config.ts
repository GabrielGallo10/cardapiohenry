/** Número para envio do pedido (DDI, só dígitos). Configure via .env.local */
export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999";
}
